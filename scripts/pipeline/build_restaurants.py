# -*- coding: utf-8 -*-
"""
build_restaurants.py — 식당·바·카페 POI 파이프라인 (일회성 배치)

⚠️ CLAUDE.md 규칙 6과 같은 패턴: 앱(Next.js) 코드에서 import하지 않는다.
   결과는 data/restaurants.ts에 정적 배열로 저장된다.

실행: python scripts/pipeline/build_restaurants.py
  (Windows에서는 python3이 아니라 python — build_geometry.py 주석 참고)

── 데이터 출처 ──
  OpenStreetMap contributors (ODbL) — Overpass API, amenity=restaurant|bar|cafe
  town 좌표는 data/towns.ts에 이미 있는 lat/lng(2026-07-31, 지도 기능 때 확보)을 그대로 재사용한다.

── 2026-08-04 조사 — opening_hours 필드를 뺀 이유 ──
  Pamplona Plaza del Castillo(밀집 도심) 208곳 중 opening_hours 태그 보유 24곳(11.5%),
  Hornillos del Camino(소규모 마을) 3곳 중 1곳(33%)만 보유 — 두 표본 모두 절반에 크게 못
  미쳐 "정확한 API 데이터"로 볼 수 없었다. data/exposed_stretches.ts가 이미 같은 이유로
  "바 개점 시각(Waypoint.opensAt)"을 의도적으로 비워둔 전례(DEVLOG)와 일치하는 결론이라
  이번에도 이름·위치·종류만 등록하고 영업시간은 등록하지 않는다(규칙 1).

── 재시도 전략 ──
  build_geometry.py의 overpass() 함수와 동일한 패턴(curl subprocess, 4회 재시도,
  미러 2개 순환) — 이 환경에서 urllib이 Overpass 상대로 타임아웃나는 문제 회피.
"""

import json
import os
import re
import subprocess
import sys
import time
import unicodedata

OVERPASS_MIRRORS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
]

TOWNS_TS = "data/towns.ts"
OUT_TS = "data/restaurants.ts"
CHECKPOINT = "data/geometry/restaurants_checkpoint.json"  # gitignore 대상 디렉터리 재사용
RADIUS_M = 700

_TOWN_RE = re.compile(
    r"id: '([^']+)',.*?lat: (-?[\d.]+),\s*lng: (-?[\d.]+),",
    re.S,
)


def load_towns():
    with open(TOWNS_TS, "r", encoding="utf-8") as f:
        text = f.read()
    towns = []
    seen = set()
    for m in _TOWN_RE.finditer(text):
        tid, lat, lng = m.group(1), float(m.group(2)), float(m.group(3))
        if tid in seen:
            continue
        seen.add(tid)
        towns.append({"id": tid, "lat": lat, "lng": lng})
    if len(towns) < 80:
        raise RuntimeError(f"마을 파싱 개수 이상함: {len(towns)}개 (82개 기대)")
    return towns


def overpass(query, tries=3):
    last = None
    for attempt in range(tries):
        for mirror in OVERPASS_MIRRORS:
            try:
                result = subprocess.run(
                    ["curl", "-s", "-X", "POST", mirror, "--data-urlencode", f"data={query}"],
                    capture_output=True, timeout=180, check=True,
                )
                data = json.loads(result.stdout)
                if "elements" in data:
                    return data
                last = Exception(str(data)[:200])
            except Exception as e:
                last = e
        time.sleep(5)
    raise last


def fetch_eateries_near(lat, lng, radius=RADIUS_M):
    q = (
        f'[out:json][timeout:60];'
        f'node["amenity"~"^(restaurant|bar|cafe)$"](around:{radius},{lat},{lng});'
        f'out body;'
    )
    data = overpass(q)
    return data["elements"]


def load_checkpoint():
    if os.path.exists(CHECKPOINT):
        with open(CHECKPOINT, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"done_town_ids": [], "records": [], "seen_osm_ids": []}


def save_checkpoint(state):
    os.makedirs(os.path.dirname(CHECKPOINT), exist_ok=True)
    with open(CHECKPOINT, "w", encoding="utf-8") as f:
        json.dump(state, f, ensure_ascii=False)


def esc(s):
    return s.replace("\\", "\\\\").replace("'", "\\'")


def write_restaurants_ts(records):
    checked_at = "2026-08"
    lines = []
    lines.append("// data/restaurants.ts — 식당·바·카페 (OSM POI), F축 부속 데이터")
    lines.append("//")
    lines.append("// ⚠️ 출처: OpenStreetMap contributors (ODbL) — Overpass API,")
    lines.append(f"//   amenity~restaurant|bar|cafe, 마을 좌표(700m 반경) 기준 조회 ({checked_at}).")
    lines.append("// ⚠️ openingHours를 두지 않는다 — 2026-08-04 조사 결과 OSM opening_hours 태그")
    lines.append("//   보유율이 11~33%뿐이라 '정확한 데이터'로 볼 수 없었다(스크립트 상단 주석 참고,")
    lines.append("//   data/exposed_stretches.ts의 Waypoint.opensAt 보류 결정과 같은 이유, 규칙 1).")
    lines.append("//   이름·종류·좌표만 등록한다.")
    lines.append("import type { Eatery } from '../lib/schema'")
    lines.append("")
    lines.append(f"const CHECKED_AT = '{checked_at}'")
    lines.append("")
    lines.append("export const eateries: Eatery[] = [")
    for r in records:
        lines.append(
            "  { id: '%s', townId: '%s', name: '%s', type: '%s', lat: %s, lng: %s, source: 'OSM', checkedAt: CHECKED_AT },"
            % (r["id"], r["townId"], esc(r["name"]), r["type"], r["lat"], r["lng"])
        )
    lines.append("]")
    lines.append("")
    with open(OUT_TS, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


TYPE_MAP = {"restaurant": "RESTAURANT", "bar": "BAR", "cafe": "CAFE"}


def slug_counter_factory():
    counters = {}

    def next_id(town_id):
        counters[town_id] = counters.get(town_id, 0) + 1
        return f"{town_id}-eat-{counters[town_id]}"

    return next_id


def main():
    towns = load_towns()
    state = load_checkpoint()
    done_ids = set(state["done_town_ids"])
    records = state["records"]
    seen_osm = set(state["seen_osm_ids"])

    remaining = [t for t in towns if t["id"] not in done_ids]
    print(f"총 {len(towns)}개 마을, 이미 완료 {len(done_ids)}개, 남은 {len(remaining)}개")

    for i, t in enumerate(remaining):
        try:
            els = fetch_eateries_near(t["lat"], t["lng"])
        except Exception as e:
            print(f"[FAIL] {t['id']}: {e}", file=sys.stderr)
            save_checkpoint(state)
            continue
        added = 0
        for e in els:
            osm_id = f"{e['type']}/{e['id']}"
            if osm_id in seen_osm:
                continue
            tags = e.get("tags", {})
            amenity = tags.get("amenity")
            name = tags.get("name")
            if not name or amenity not in TYPE_MAP:
                continue
            seen_osm.add(osm_id)
            records.append({
                "osm_id": osm_id,
                "townId": t["id"],
                "name": name,
                "type": TYPE_MAP[amenity],
                "lat": round(e["lat"], 6),
                "lng": round(e["lon"], 6),
            })
            added += 1
        done_ids.add(t["id"])
        state["done_town_ids"] = list(done_ids)
        state["records"] = records
        state["seen_osm_ids"] = list(seen_osm)
        save_checkpoint(state)
        print(f"[{i+1}/{len(remaining)}] {t['id']}: +{added} (누적 {len(records)})")
        time.sleep(1.5)

    next_id = slug_counter_factory()
    final_records = []
    for r in records:
        final_records.append({
            "id": next_id(r["townId"]),
            "townId": r["townId"],
            "name": r["name"],
            "type": r["type"],
            "lat": r["lat"],
            "lng": r["lng"],
        })
    write_restaurants_ts(final_records)
    print(f"완료: {len(final_records)}곳 -> {OUT_TS}")


if __name__ == "__main__":
    main()
