# -*- coding: utf-8 -*-
"""
verify_route.py — OSM 경로 정확도 검증 (일회성 도구)

경로(길 모양)가 실제 카미노와 맞는지 reference 값에 기대지 않고 확인한다.

3가지 검사:
  A. 독립 지오코딩 대조 — 82개 마을 위치를 경로와 무관한 출처(Nominatim)로 따로
     찾아, 경로가 각 마을에서 얼마나 떨어져 지나가는지 측정. 카미노는 이 마을들을
     통과하므로, 정확하면 수백 m 이내여야 한다. (경로 relation ≠ 마을 place 노드 =
     서로 독립 → 순환논증 아님)
  B. 연속성 — 경로 점 사이 최대 간격. 스티칭이 순간이동했으면 큰 구멍이 남는다.
  C. 길이 — 총/구간 길이를 알려진 거리와 대조.

실행: PYTHONPATH=scripts/pipeline python3 scripts/pipeline/verify_route.py
"""

import json
import math
import os
import re
import time
import urllib.parse
import urllib.request

from build_geometry import haversine, load_towns_source, OUT_DIR

NOMINATIM = "https://nominatim.openstreetmap.org/search"
UA = "camino-planner-route-verify/1.0 (offline validation)"


def geocode(name_es, km):
    """경로와 무관하게 마을 좌표를 조회. 스페인·프랑스로 국가 제한(동명 남미 마을 회피)."""
    q = {
        "q": name_es,
        "format": "json",
        "limit": 1,
        "countrycodes": "es,fr",
    }
    url = NOMINATIM + "?" + urllib.parse.urlencode(q)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for _ in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                data = json.loads(r.read())
            if data:
                return float(data[0]["lat"]), float(data[0]["lon"])
            return None
        except Exception:
            time.sleep(3)
    return None


def min_dist_to_route(pt, path, step=25):
    """점에서 경로까지 최소 거리(m). 점밀도가 높아 최근접 정점으로 근사(step으로 성김)."""
    best = float("inf")
    for i in range(0, len(path), step):
        d = haversine(pt, path[i])
        if d < best:
            best = d
    # best 주변을 촘촘히 재확인
    return best


def main():
    route = json.load(open(os.path.join(OUT_DIR, "full_route.json")))
    path, cum = route["path"], route["cum"]
    towns = load_towns_source()

    # ── B. 연속성 ──
    print("── B. 경로 연속성 (점 사이 간격) ──")
    gaps = [haversine(path[i], path[i + 1]) for i in range(len(path) - 1)]
    big = [(i, g) for i, g in enumerate(gaps) if g > 100]
    print(f"  점 {len(path)}개, 평균 간격 {sum(gaps)/len(gaps):.1f}m, 최대 {max(gaps):.0f}m")
    print(f"  100m 초과 간격: {len(big)}곳 " + (f"(최대 {max(g for _,g in big):.0f}m)" if big else "→ 순간이동 없음 ✓"))

    # ── C. 길이 ──
    print("\n── C. 길이 대조 ──")
    print(f"  총 길이 {cum[-1]/1000:.1f}km vs 가이드북 773.1km ({(cum[-1]/1000-773.1)/773.1*100:+.1f}%)")

    # ── A. 독립 지오코딩 대조 ──
    print("\n── A. 독립 지오코딩 대조 (마을→경로 최소거리) ──")
    print("  (Nominatim, 1req/s. 82개라 ~1분 반 소요)")
    results = []
    for t in towns:
        g = geocode(t["es"], t["km"])
        time.sleep(1.1)  # Nominatim 예의
        if g is None:
            results.append((t["es"], t["km"], None))
            continue
        d = min_dist_to_route(g, path, step=10)
        results.append((t["es"], t["km"], d))

    found = [r for r in results if r[2] is not None]
    missing = [r for r in results if r[2] is None]
    dists = sorted(r[2] for r in found)
    n = len(dists)
    print(f"\n  지오코딩 성공 {n}/{len(towns)}개")
    if n:
        median = dists[n // 2]
        p90 = dists[int(n * 0.9)]
        print(f"  경로까지 거리 — 중앙값 {median:.0f}m / 90%ile {p90:.0f}m / 최대 {dists[-1]:.0f}m")
        within500 = sum(1 for d in dists if d <= 500)
        within1k = sum(1 for d in dists if d <= 1000)
        print(f"  500m 이내 {within500}/{n} ({within500/n*100:.0f}%), 1km 이내 {within1k}/{n} ({within1k/n*100:.0f}%)")
        print("\n  ⚠️ 경로에서 먼 마을 (>1km — 경로 오류 또는 지오코딩 오류 후보):")
        outliers = sorted([r for r in found if r[2] > 1000], key=lambda r: -r[2])
        if outliers:
            for es, km, d in outliers[:15]:
                print(f"    {km:>6.1f}km  {es:<34} {d:.0f}m")
        else:
            print("    없음 ✓ (모든 마을이 경로 1km 이내)")
    if missing:
        print(f"\n  지오코딩 실패(수동 확인 필요): {', '.join(r[0] for r in missing)}")


if __name__ == "__main__":
    main()
