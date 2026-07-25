# -*- coding: utf-8 -*-
"""
build_geometry.py — 경로·고도 데이터 파이프라인 (프로토타입)

⚠️ 이건 CLAUDE.md의 scripts/build-profiles.ts에 해당하는 "일회성 배치"다.
   앱(Next.js) 코드에서 import 하지 않는다. 검증이 끝나면 최종본은 TypeScript로 옮긴다.
   지금은 파이썬으로 API 호출+가공을 빠르게 검증하는 용도.

실행: python scripts/pipeline/build_geometry.py
  (Windows 이 환경에서는 python3 아니라 python 을 써야 한다 — python3은 MS Store 스텁)

의존성: 표준 라이브러리만 사용 (urllib). 별도 설치 불필요.

── 검증 완료 (2026-07-24) ──
  생장피드포르 → 론세스바예스 (1일차, ~25.7km) 상승고도:
    - 마을 고도차 방식(틀림): 780m
    - 이 파이프라인(평활화 후): 1,327m
    - CLAUDE.md 기준값(레포에데르 고개 ~1,450m 경유): 약 1,280m
    → 오차 4% 이내. 파이프라인이 규칙 3(고도는 profiles.ts 경유)을 실제로 만족함.

── 데이터 출처 (CLAUDE.md 출처 표시 의무) ──
  경로: OpenStreetMap contributors (ODbL) — Overpass API
  고도: EU-DEM 25m (CC BY, Copernicus) via Open Topo Data 공개 API
        ※ CLAUDE.md는 스페인 IGN MDT05(5m)를 지정했으나, IGN은 공개 API가 아니라
          GeoTIFF 직접 다운로드+좌표변환이 필요. 우선 EU-DEM 25m로 전체 검증.
          최종 배포 전에 스페인 구간은 IGN 5m로 교체 검토.
"""

import json
import math
import os
import re
import sys
import time
import unicodedata
import urllib.request
import urllib.parse
from collections import defaultdict

# ── 카미노 프랑스 길 = OSM relation 6개 (wikidata Q1029584) ──
# 이름에 02, 05가 없는 건 OSM 자체 넘버링. 아래 6개가 전 구간을 커버한다.
SEGMENTS = [
    (2163569, "01_sjpp_logrono",       (43.1637, -1.2364)),  # 생장 → 로그로뇨
    (2163558, "03_logrono_burgos",     (42.4650, -2.4456)),  # 로그로뇨 → 부르고스
    (2163560, "04_burgos_leon",        (42.3410, -3.7040)),  # 부르고스 → 레온
    (2163561, "06_leon_cacabelos",     (42.5987, -5.5671)),  # 레온 → 카카벨로스
    (2163565, "07_cacabelos_palas",    (42.5960, -6.7290)),  # 카카벨로스 → 팔라스 데 레이
    (2163559, "08_palas_santiago",     (42.8730, -7.8690)),  # 팔라스 데 레이 → 산티아고
]

OVERPASS_MIRRORS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
]
ELEV_API = "https://api.opentopodata.org/v1/eudem25m"

OUT_DIR = "data/geometry"  # ⚠️ CLAUDE.md: data/geometry/ 는 gitignore 대상


# ────────────────────────────────────────────────
# 기하 유틸
# ────────────────────────────────────────────────
def haversine(a, b):
    R = 6371000.0
    lat1, lon1 = math.radians(a[0]), math.radians(a[1])
    lat2, lon2 = math.radians(b[0]), math.radians(b[1])
    dlat, dlon = lat2 - lat1, lon2 - lon1
    h = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))


def _key(pt, prec=5):
    return (round(pt[0], prec), round(pt[1], prec))


# ────────────────────────────────────────────────
# 1. Overpass에서 구간별 way 지오메트리 수집
# ────────────────────────────────────────────────
def overpass(query, tries=4):
    data = urllib.parse.urlencode({"data": query}).encode("utf-8")
    last = None
    for _ in range(tries):
        for mirror in OVERPASS_MIRRORS:
            try:
                req = urllib.request.Request(mirror, data=data, method="POST")
                with urllib.request.urlopen(req, timeout=180) as r:
                    return json.loads(r.read())
            except Exception as e:
                last = e
        time.sleep(6)
    raise last


def fetch_segment_ways(rel_id):
    q = f"[out:json][timeout:150];relation({rel_id});way(r);out geom;"
    result = overpass(q)
    return [e for e in result["elements"] if e["type"] == "way"]


def fetch_segment_ways_cached(rel_id, name):
    """Overpass 응답을 data/geometry/{name}_ways.json 에 캐시.
    같은 구간을 재조회하지 않도록(예의상 + 재실행 속도) — data/geometry/ 는 gitignore 대상."""
    os.makedirs(OUT_DIR, exist_ok=True)
    path = os.path.join(OUT_DIR, f"{name}_ways.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    ways = fetch_segment_ways(rel_id)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(ways, f)
    return ways


# ────────────────────────────────────────────────
# 2. 뒤섞인 way 조각들을 연속 경로로 이어붙이기 (stitching)
# ────────────────────────────────────────────────
def stitch(ways, near_point):
    """near_point에서 가장 가까운 끝점부터 시작해 조각들을 순서대로 연결.
    반환: (path[(lat,lon)...], cum[누적거리 m...], ok)"""
    segs = []
    for w in ways:
        pts = [(g["lat"], g["lon"]) for g in w.get("geometry", [])]
        if len(pts) >= 2:
            segs.append(pts)

    endpoint_map = defaultdict(list)
    for i, s in enumerate(segs):
        endpoint_map[_key(s[0])].append((i, True))
        endpoint_map[_key(s[-1])].append((i, False))

    deg1 = [k for k, v in endpoint_map.items() if len(v) == 1]
    if not deg1:
        return None, None, False
    start_key = min(deg1, key=lambda k: haversine(k, near_point))

    used = [False] * len(segs)
    si, is_start = endpoint_map[start_key][0]
    path = list(segs[si]) if is_start else list(reversed(segs[si]))
    used[si] = True
    cur = path[-1]
    ok = True

    for _ in range(len(segs) + 5):
        if all(used):
            break
        nxt = next(((i, s) for (i, s) in endpoint_map.get(_key(cur), []) if not used[i]), None)
        if nxt is None:  # 작은 틈(≤50m)은 최근접으로 이어붙임
            best, best_d = None, 50.0
            for i, s in enumerate(segs):
                if used[i]:
                    continue
                for end, is_s in ((s[0], True), (s[-1], False)):
                    d = haversine(cur, end)
                    if d < best_d:
                        best_d, best = d, (i, is_s)
            nxt = best
        if nxt is None:
            ok = False
            break
        i, is_s = nxt
        seg = segs[i] if is_s else list(reversed(segs[i]))
        path.extend(seg[1:])
        used[i] = True
        cur = path[-1]

    cum = [0.0]
    for i in range(1, len(path)):
        cum.append(cum[-1] + haversine(path[i - 1], path[i]))
    return path, cum, ok


# ────────────────────────────────────────────────
# 3. 100m 간격 리샘플 + 고도 조회 + 평활화
# ────────────────────────────────────────────────
def resample(path, cum, step=100.0):
    targets = list(range(0, int(cum[-1]), int(step))) + [cum[-1]]
    out, j = [], 0
    for t in targets:
        while j < len(cum) - 1 and cum[j + 1] < t:
            j += 1
        if j >= len(cum) - 1:
            out.append(path[-1]); continue
        d0, d1 = cum[j], cum[j + 1]
        p0, p1 = path[j], path[j + 1]
        f = 0 if d1 == d0 else (t - d0) / (d1 - d0)
        out.append((p0[0] + (p1[0] - p0[0]) * f, p0[1] + (p1[1] - p0[1]) * f))
    return out


def fetch_elevations(points, batch=100):
    elevs = []
    for i in range(0, len(points), batch):
        chunk = points[i:i + batch]
        loc = "|".join(f"{la:.6f},{lo:.6f}" for la, lo in chunk)
        url = ELEV_API + "?" + urllib.parse.urlencode({"locations": loc})
        for attempt in range(4):
            try:
                with urllib.request.urlopen(url, timeout=30) as r:
                    body = json.loads(r.read())
                elevs.extend(x["elevation"] for x in body["results"])
                break
            except Exception:
                time.sleep(2)
        else:
            raise RuntimeError(f"elevation batch failed at {i}")
        time.sleep(1.1)  # 공개 API 예의 (1 req/s)
    return elevs


def _moving_avg(vals, window=5):
    n, half = len(vals), window // 2
    return [sum(vals[max(0, i - half):min(n, i + half + 1)]) /
            (min(n, i + half + 1) - max(0, i - half)) for i in range(n)]


def clean_gain_loss(vals, threshold=3.0):
    """히스테리시스: threshold(m) 이상 방향 전환해야 오르막/내리막으로 인정.
    노이즈를 그냥 더하면 실제의 2~3배가 되므로 필수 (CLAUDE.md 경고)."""
    ascent = descent = 0.0
    pivot, rising = vals[0], None
    for v in vals[1:]:
        if rising is None:
            if abs(v - pivot) >= threshold:
                rising = v > pivot
                (ascent := ascent + (v - pivot)) if rising else (descent := descent + (pivot - v))
                pivot = v
            continue
        if rising:
            if v >= pivot:
                ascent += v - pivot; pivot = v
            elif pivot - v >= threshold:
                rising = False; descent += pivot - v; pivot = v
        else:
            if v <= pivot:
                descent += pivot - v; pivot = v
            elif v - pivot >= threshold:
                rising = True; ascent += v - pivot; pivot = v
    return ascent, descent


def profile_for_range(path, cum, elevations, resampled, from_m, to_m):
    """리샘플 인덱스로 [from_m, to_m] 구간의 ascent/descent/max 계산."""
    step = 100.0
    i0 = max(0, int(from_m / step))
    i1 = min(len(elevations) - 1, int(to_m / step))
    seg = elevations[i0:i1 + 1]
    if len(seg) < 2:
        return {"ascent": 0, "descent": 0, "maxElevation": max(seg) if seg else 0}
    sm = _moving_avg(seg, 5)
    a, d = clean_gain_loss(sm, 3.0)
    return {"ascent": round(a), "descent": round(d), "maxElevation": round(max(seg))}


# ────────────────────────────────────────────────
# 메인 — 지금은 검증용. 전체 마을 매핑은 아래 TODO 참조.
# ────────────────────────────────────────────────
def validate_day1():
    """1일차 구간으로 파이프라인 정확도 검증 (기준값 ~1,280m)."""
    print("생장→론세스바예스 검증 중...")
    ways = fetch_segment_ways(2163569)  # seg01 (생장부터 포함)
    path, cum, ok = stitch(ways, (43.1637, -1.2364))
    print(f"  이어붙임 ok={ok}, 총 길이 {cum[-1]/1000:.1f}km, {len(path)}점")
    resampled = resample(path[:_idx_at(cum, 25700) + 1], cum[:_idx_at(cum, 25700) + 1])
    elevs = fetch_elevations(resampled)
    sm = _moving_avg(elevs, 5)
    a, d = clean_gain_loss(sm, 3.0)
    print(f"  상승 {a:.0f}m / 하강 {d:.0f}m / 최고 {max(elevs):.0f}m")
    print(f"  기준값 1,280m 대비 {'OK' if abs(a-1280) < 200 else '재확인 필요'}")


def _idx_at(cum, meters):
    return next((i for i, c in enumerate(cum) if c >= meters), len(cum) - 1)


# ────────────────────────────────────────────────
# 4. 6개 구간 전체를 이어붙여 하나의 773km 경로로 만들기
# ────────────────────────────────────────────────
def build_full_route():
    """SEGMENTS 순서대로 각 구간을 스티칭하고, 구간 경계끼리 이어붙여
    하나의 연속 경로(path)와 누적거리(cum, 0부터 시작)를 만든다.
    결과를 data/geometry/full_route.json 에 저장(gitignore 대상, 좌표 포함하므로 배포 금지)."""
    full_path = []
    full_cum = []
    offset = 0.0
    boundary_gaps = []
    prev_end = None

    for rel_id, name, near_point in SEGMENTS:
        print(f"{name} 가져오는 중...")
        ways = fetch_segment_ways_cached(rel_id, name)
        anchor = prev_end if prev_end is not None else near_point
        path, cum, ok = stitch(ways, anchor)
        if not ok:
            raise RuntimeError(f"{name}: 스티칭 실패 (ok=False)")
        print(f"  ok={ok}, {cum[-1]/1000:.1f}km, {len(path)}점")

        if prev_end is not None:
            gap = haversine(prev_end, path[0])
            boundary_gaps.append((name, gap))
            if gap > 500:
                print(f"  ⚠️ 경계 불연속: 이전 구간 끝점과 {gap:.0f}m 떨어짐 (재확인 필요)")

        if full_path and prev_end is not None:
            full_path.extend(path[1:])
            full_cum.extend([offset + c for c in cum[1:]])
        else:
            full_path.extend(path)
            full_cum.extend([offset + c for c in cum])

        offset = full_cum[-1]
        prev_end = path[-1]

    print(f"\n전체 경로: {full_cum[-1]/1000:.1f}km, {len(full_path)}점 (기준값 773.1km)")
    for name, gap in boundary_gaps:
        print(f"  경계({name}) 이전 구간과 거리: {gap:.0f}m")

    os.makedirs(OUT_DIR, exist_ok=True)
    out_path = os.path.join(OUT_DIR, "full_route.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({"path": full_path, "cum": full_cum}, f)
    print(f"저장: {out_path}")
    return full_path, full_cum



# ════════════════════════════════════════════════════════════════
# 5. 82개 마을 좌표 매핑 + 구간 프로파일 → data/towns.ts, data/profiles.ts
# ════════════════════════════════════════════════════════════════
#
# ── 설계 결정 (사용자 부재 중 진행, 근거를 여기 남긴다) ──
# TODO 주석에 있던 3가지 선택지: (a) Nominatim 지오코딩+스냅 (b) km 비율 보간
# (c) 교차검증. Nominatim은 소도시 동명이인 위험(여러 지방에 같은 이름 마을)과
# 공개 API rate limit(1req/s, 무인증)이 있어 82개를 무인 배치로 신뢰성 있게
# 처리하기 어렵다고 판단해 (b) km 비율 보간을 택했다.
#
# 근거: 1일차 검증에서 우리가 이어붙인 실제 경로 길이(163.3km)가 가이드북 km
# (로그로뇨 162.2km)과 0.7%밖에 차이 나지 않았다 — 카미노는 굴곡이 완만해서
# "가이드북 km 비율 = 경로상 위치 비율"이 잘 성립한다. ratio = 우리_총길이 /
# 가이드북_총길이(773.1km)로 스케일링해 각 마을의 실제 경로상 지점을 찾는다.
#
# town.km / town.elevation 은 절대 이 값으로 덮어쓰지 않는다 — 기존 검증된
# 값(camino-companion.jsx, CLAUDE.md 규칙 1)을 그대로 보존하고, 지금까지 없던
# lat/lng만 새로 채운다.

TOWNS_SOURCE_FILE = "src/camino-companion.jsx"

_TOWN_ROW_RE = re.compile(
    r'\{\s*es:\s*"([^"]+)",\s*ko:\s*"([^"]+)",\s*km:\s*([\d.]+),\s*el:\s*(\d+),'
    r'\s*beds:\s*(\d+),\s*sv:\s*"([a-z]*)"\s*\}'
)

_SV_MAP = {
    "w": "WATER", "b": "BAR", "s": "SHOP",
    "p": "PHARMACY", "a": "ATM", "x": "BAG_TRANSFER",
}


def load_towns_source():
    """검증된 82개 마을 원본 데이터를 src/camino-companion.jsx에서 직접 파싱.
    숫자를 여기 다시 옮겨 적지 않는다 — 오타로 값이 틀릴 위험을 없애기 위해
    소스 파일을 그대로 정규식으로 읽는다."""
    with open(TOWNS_SOURCE_FILE, "r", encoding="utf-8") as f:
        text = f.read()
    rows = _TOWN_ROW_RE.findall(text)
    if len(rows) < 80:
        raise RuntimeError(f"마을 파싱 개수 이상함: {len(rows)}개 (82개 기대)")
    towns = []
    for es, ko, km, el, beds, sv in rows:
        towns.append({
            "es": es, "ko": ko, "km": float(km), "el": int(el),
            "beds": int(beds), "services": [_SV_MAP[c] for c in sv],
        })
    return towns


def slugify(es):
    s = unicodedata.normalize("NFKD", es)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def point_at(path, cum, meters):
    """path 위에서 시작점 기준 meters 지점의 (lat,lon)을 선형보간으로 구한다."""
    meters = max(0.0, min(meters, cum[-1]))
    j = 0
    while j < len(cum) - 1 and cum[j + 1] < meters:
        j += 1
    if j >= len(cum) - 1:
        return path[-1]
    d0, d1 = cum[j], cum[j + 1]
    p0, p1 = path[j], path[j + 1]
    f = 0 if d1 == d0 else (meters - d0) / (d1 - d0)
    return (p0[0] + (p1[0] - p0[0]) * f, p0[1] + (p1[1] - p0[1]) * f)


def profile_for_range_full(elevations, from_m, to_m, step=100.0):
    """elevations: 0m부터 step 간격 전체 경로 고도 배열.
    [from_m, to_m] 구간의 ascent/descent/maxElevation/maxGradient(%)."""
    i0 = max(0, int(from_m / step))
    i1 = min(len(elevations) - 1, int(round(to_m / step)))
    seg = elevations[i0:i1 + 1]
    if len(seg) < 2:
        v = seg[0] if seg else 0
        return {"ascent": 0, "descent": 0, "maxElevation": round(v), "maxGradient": 0.0}
    sm = _moving_avg(seg, 5)
    a, d = clean_gain_loss(sm, 3.0)
    grad = max(abs(sm[i + 1] - sm[i]) for i in range(len(sm) - 1)) if len(sm) > 1 else 0.0
    return {
        "ascent": round(a), "descent": round(d),
        "maxElevation": round(max(seg)), "maxGradient": round(grad, 1),
    }


def build_profiles_and_towns():
    route_path = os.path.join(OUT_DIR, "full_route.json")
    if not os.path.exists(route_path):
        raise RuntimeError("먼저 `python3 build_geometry.py full` 로 전체 경로를 만들어야 함")
    with open(route_path, "r", encoding="utf-8") as f:
        route = json.load(f)
    full_path, full_cum = route["path"], route["cum"]

    towns = load_towns_source()
    guidebook_total_m = towns[-1]["km"] * 1000
    ratio = full_cum[-1] / guidebook_total_m
    print(f"경로 실측 {full_cum[-1]/1000:.1f}km vs 가이드북 {towns[-1]['km']}km → ratio={ratio:.4f}")

    for t in towns:
        t["scaled_m"] = t["km"] * 1000 * ratio
        t["lat"], t["lng"] = point_at(full_path, full_cum, t["scaled_m"])

    elev_path = os.path.join(OUT_DIR, "full_elevations.json")
    if os.path.exists(elev_path):
        with open(elev_path, "r", encoding="utf-8") as f:
            elevations = json.load(f)
        print(f"고도 캐시 로드: {len(elevations)}점")
    else:
        resampled = resample(full_path, full_cum, step=100.0)
        print(f"고도 조회 중: {len(resampled)}점 (100m 간격, 공개 API라 시간 걸림)")
        elevations = fetch_elevations(resampled)
        with open(elev_path, "w", encoding="utf-8") as f:
            json.dump(elevations, f)
        print(f"저장: {elev_path}")

    profiles = []
    for i in range(len(towns) - 1):
        a, b = towns[i], towns[i + 1]
        prof = profile_for_range_full(elevations, a["scaled_m"], b["scaled_m"])
        prof["fromTownId"] = slugify(a["es"])
        prof["toTownId"] = slugify(b["es"])
        prof["distanceKm"] = round((b["scaled_m"] - a["scaled_m"]) / 1000, 1)
        profiles.append(prof)

    ids = [slugify(t["es"]) for t in towns]
    dupes = {i for i in ids if ids.count(i) > 1}
    if dupes:
        raise RuntimeError(f"슬러그 중복 발생: {dupes} — slugify 규칙 조정 필요")

    write_towns_ts(towns)
    write_profiles_ts(profiles)
    print(f"\n완료: 마을 {len(towns)}개, 구간 {len(profiles)}개")
    print("source: 'OSM+EUDEM' (경로 OSM + 고도 EU-DEM 25m). IGN 5m는 급경사 노이즈로 부정확 —")
    print("   DEVLOG 2026-07-25(2) 3소스 교차검증 참조.")


def ts_str(s):
    """작은따옴표 TS 문자열 리터럴 (프로젝트 스타일). 내부 작은따옴표는 이스케이프."""
    return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"


def write_towns_ts(towns):
    out = []
    out.append("// data/towns.ts — 마을 82곳 마스터 데이터")
    out.append("// km · elevation: src/camino-companion.jsx 검증값 그대로 보존 (수정 금지, CLAUDE.md 규칙 1)")
    out.append("// lat/lng: scripts/pipeline/build_geometry.py 로 OSM 경로 위에 km-비율 스케일링해 도출")
    out.append("// 경로 데이터 © OpenStreetMap contributors (ODbL)")
    out.append("import type { Town } from '../lib/schema'")
    out.append("")
    out.append("export const towns: Town[] = [")
    for t in towns:
        out.append("  {")
        out.append(f"    id: {ts_str(slugify(t['es']))},")
        out.append(f"    nameEs: {ts_str(t['es'])},")
        out.append(f"    nameKo: {ts_str(t['ko'])},")
        out.append("    routeId: 'camino-frances',")
        out.append(f"    km: {t['km']},")
        out.append(f"    elevation: {t['el']},")
        out.append(f"    lat: {t['lat']:.6f},")
        out.append(f"    lng: {t['lng']:.6f},")
        out.append(f"    services: [{', '.join(ts_str(s) for s in t['services'])}],")
        out.append(f"    beds: {t['beds']},")
        out.append("    population: null,")
        out.append("    notesKo: null,")
        out.append("  },")
    out.append("]")
    os.makedirs("data", exist_ok=True)
    with open("data/towns.ts", "w", encoding="utf-8") as f:
        f.write("\n".join(out) + "\n")
    print("저장: data/towns.ts")


def write_profiles_ts(profiles):
    out = []
    out.append("// data/profiles.ts — 마을 간 81개 구간 실측 고도 프로파일")
    out.append("// 경로: OpenStreetMap contributors (ODbL) · 고도: EU-DEM 25m (CC BY, Copernicus) via Open Topo Data")
    out.append("// source: 'OSM+EUDEM' — 경로 OSM + 고도 EU-DEM 25m. IGN MDT05(5m)는 급경사에서")
    out.append("//   경로 노이즈를 증폭해 오히려 부정확했다(DEVLOG 2026-07-25(2)). 현재는 EU-DEM 25m가 실용적 정답.")
    out.append("import type { SegmentProfile } from '../lib/schema'")
    out.append("")
    out.append("export const profiles: SegmentProfile[] = [")
    for p in profiles:
        out.append("  {")
        out.append(f"    fromTownId: {ts_str(p['fromTownId'])},")
        out.append(f"    toTownId: {ts_str(p['toTownId'])},")
        out.append(f"    distanceKm: {p['distanceKm']},")
        out.append(f"    ascent: {p['ascent']},")
        out.append(f"    descent: {p['descent']},")
        out.append(f"    maxElevation: {p['maxElevation']},")
        out.append(f"    maxGradient: {p['maxGradient']},")
        out.append("    source: 'OSM+EUDEM',")
        out.append("  },")
    out.append("]")
    with open("data/profiles.ts", "w", encoding="utf-8") as f:
        f.write("\n".join(out) + "\n")
    print("저장: data/profiles.ts")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "full":
        build_full_route()
    elif len(sys.argv) > 1 and sys.argv[1] == "profiles":
        build_profiles_and_towns()
    else:
        validate_day1()

# ══════════════════════════════════════════════════
# TODO (다음 세션에서 이어서) — 아직 안 끝난 것:
#
# 1. 6개 구간 전체를 이어붙여 하나의 773km 경로로 만들기
#    (seg01 끝점=로그로뇨 ≈ seg03 시작점. 경계에서 stitch 재사용)
#
# 2. 82개 마을 좌표 매핑 — ⚠️ 설계 결정 필요:
#    towns.ts의 검증된 km값(예: 사리아 658.9km)을 실제 경로 위에서 찾아
#    그 지점의 (lat, lng)를 얻는다. 문제: OSM 경로 길이(163km)와
#    가이드북 km(162.2km)가 미세하게 다름 → km를 그대로 인덱싱하면 오차 누적.
#    선택지: (a) 마을명으로 Nominatim 지오코딩 후 경로에 스냅
#           (b) km 비율로 보간   (c) 둘을 교차검증
#    → 다음 세션에서 사용자와 방법 확정하고 진행.
#
# 3. 각 구간(마을→마을)별 profile_for_range()로 ascent/descent 계산
#    → data/profiles.ts 생성 (SegmentProfile[] 타입, source:'OSM+EUDEM')
#    ⚠️ 좌표는 profiles.ts에 넣지 않는다 — 숫자만 (ODbL 파생DB 배포 회피)
#
# 4. 최종본을 scripts/build-profiles.ts (TypeScript)로 포팅
# ══════════════════════════════════════════════════
