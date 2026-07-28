# -*- coding: utf-8 -*-
"""
build_road_share.py — 마을 구간별 차도 병행 비율(roadShareRatio) 계산

⚠️ 새 Overpass 조회 없이 build_geometry.py가 이미 캐시해 둔
   data/geometry/*_ways.json(OSM way + highway/surface 태그)만 재사용한다.
   실행 전 반드시 `python3 build_geometry.py full` 로 캐시가 있어야 한다.

방법: build_geometry.stitch()와 같은 끝점 이어붙이기 알고리즘을 쓰되,
  점 하나하나에 "그 점을 만든 way의 highway 태그"를 같이 기록한다(stitch()는
  이 태그 정보를 버린다). 6개 구간을 이어붙인 뒤, data/towns.ts와 같은 방식
  (km 비율 스케일링)으로 각 마을의 스티칭 경로상 위치를 다시 구하고, 마을
  구간 사이 각 "에지"(연속된 두 점)의 길이를 highway 태그별로 합산해
  ROAD_TAGS 비율 = 차도 길이 / 전체 길이 로 roadShareRatio를 만든다.

실행: python3 scripts/pipeline/build_road_share.py
"""

import json
import math
import os
import re
import sys
import unicodedata
from collections import defaultdict

sys.path.insert(0, os.path.dirname(__file__))
from build_geometry import haversine, _key, SEGMENTS, OUT_DIR, TOWNS_SOURCE_FILE, _TOWN_ROW_RE, slugify

# highway=* 태그 분류. 차도(ROAD)로 볼 것들 — 순례자가 자동차와 도로를 공유하는 구간.
ROAD_HIGHWAYS = {
    'motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'unclassified',
    'residential', 'service', 'living_street',
    'motorway_link', 'trunk_link', 'primary_link', 'secondary_link', 'tertiary_link',
}
# 오솔길/전용로(PATH) — 차량과 분리된 도보 전용 구간.
PATH_HIGHWAYS = {'path', 'track', 'footway', 'bridleway', 'steps', 'cycleway', 'pedestrian'}


def stitch_with_tags(ways, near_point):
    """build_geometry.stitch()와 동일한 끝점 이어붙이기 알고리즘이지만,
    각 점에 그 점을 만든 way의 highway 태그를 함께 기록해 반환한다.
    반환: (path[(lat,lon)...], cum[누적거리...], edge_tags[len(path)-1개], ok)"""
    segs = []  # (points, highway_tag)
    for w in ways:
        pts = [(g["lat"], g["lon"]) for g in w.get("geometry", [])]
        if len(pts) >= 2:
            segs.append((pts, w.get("tags", {}).get("highway", "")))

    endpoint_map = defaultdict(list)
    for i, (pts, _tag) in enumerate(segs):
        endpoint_map[_key(pts[0])].append((i, True))
        endpoint_map[_key(pts[-1])].append((i, False))

    deg1 = [k for k, v in endpoint_map.items() if len(v) == 1]
    if not deg1:
        return None, None, None, False
    start_key = min(deg1, key=lambda k: haversine(k, near_point))

    used = [False] * len(segs)
    si, is_start = endpoint_map[start_key][0]
    pts0, tag0 = segs[si]
    path = list(pts0) if is_start else list(reversed(pts0))
    edge_tags = [tag0] * (len(path) - 1)
    used[si] = True
    cur = path[-1]
    ok = True

    for _ in range(len(segs) + 5):
        if all(used):
            break
        nxt = next(((i, s) for (i, s) in endpoint_map.get(_key(cur), []) if not used[i]), None)
        if nxt is None:
            best, best_d = None, 50.0
            for i, (pts, _tag) in enumerate(segs):
                if used[i]:
                    continue
                for end, is_s in ((pts[0], True), (pts[-1], False)):
                    d = haversine(cur, end)
                    if d < best_d:
                        best_d, best = d, (i, is_s)
            nxt = best
        if nxt is None:
            ok = False
            break
        i, is_s = nxt
        pts_i, tag_i = segs[i]
        seg_pts = pts_i if is_s else list(reversed(pts_i))
        new_pts = seg_pts[1:]
        path.extend(new_pts)
        edge_tags.extend([tag_i] * len(new_pts))
        used[i] = True
        cur = path[-1]

    cum = [0.0]
    for i in range(1, len(path)):
        cum.append(cum[-1] + haversine(path[i - 1], path[i]))
    return path, cum, edge_tags, ok


def build_full_route_with_tags():
    full_path, full_cum, full_tags = [], [], []
    offset = 0.0
    prev_end = None

    for rel_id, name, near_point in SEGMENTS:
        path_file = os.path.join(OUT_DIR, f"{name}_ways.json")
        with open(path_file, "r", encoding="utf-8") as f:
            ways = json.load(f)
        anchor = prev_end if prev_end is not None else near_point
        path, cum, edge_tags, ok = stitch_with_tags(ways, anchor)
        if not ok:
            raise RuntimeError(f"{name}: 태그 포함 스티칭 실패")
        print(f"{name}: {cum[-1]/1000:.1f}km, {len(path)}점")

        if full_path and prev_end is not None:
            full_path.extend(path[1:])
            full_cum.extend([offset + c for c in cum[1:]])
            full_tags.extend(edge_tags)
        else:
            full_path.extend(path)
            full_cum.extend([offset + c for c in cum])
            full_tags.extend(edge_tags)

        offset = full_cum[-1]
        prev_end = path[-1]

    return full_path, full_cum, full_tags


def load_towns_km():
    with open(TOWNS_SOURCE_FILE, "r", encoding="utf-8") as f:
        text = f.read()
    rows = _TOWN_ROW_RE.findall(text)
    towns = []
    for es, ko, km, el, beds, sv in rows:
        towns.append({"es": es, "km": float(km)})
    return towns


def classify(tag):
    if tag in ROAD_HIGHWAYS:
        return "ROAD"
    if tag in PATH_HIGHWAYS:
        return "PATH"
    return "OTHER"


def main():
    full_path, full_cum, full_tags = build_full_route_with_tags()
    print(f"\n전체: {full_cum[-1]/1000:.1f}km, 에지 {len(full_tags)}개")

    towns = load_towns_km()
    guidebook_total_m = towns[-1]["km"] * 1000
    ratio = full_cum[-1] / guidebook_total_m
    print(f"ratio={ratio:.4f}")
    for t in towns:
        t["scaled_m"] = t["km"] * 1000 * ratio
        t["id"] = slugify(t["es"])

    # 각 마을 구간 [a.scaled_m, b.scaled_m) 사이 에지 길이를 ROAD/PATH/OTHER로 합산
    results = []
    edge_idx = 0
    n_edges = len(full_tags)
    for i in range(len(towns) - 1):
        a, b = towns[i], towns[i + 1]
        road_m = path_m = other_m = 0.0
        # 에지 j: full_path[j]~full_path[j+1], 길이 full_cum[j+1]-full_cum[j]
        while edge_idx < n_edges and full_cum[edge_idx + 1] <= a["scaled_m"]:
            edge_idx += 1
        j = edge_idx
        while j < n_edges and full_cum[j] < b["scaled_m"]:
            length = full_cum[j + 1] - full_cum[j]
            cls = classify(full_tags[j])
            if cls == "ROAD":
                road_m += length
            elif cls == "PATH":
                path_m += length
            else:
                other_m += length
            j += 1
        total = road_m + path_m + other_m
        ratio_road = round(road_m / total, 3) if total > 0 else None
        results.append({
            "fromTownId": a["id"], "toTownId": b["id"],
            "roadShareRatio": ratio_road,
            "totalM": round(total), "roadM": round(road_m), "pathM": round(path_m), "otherM": round(other_m),
        })

    out_path = os.path.join(OUT_DIR, "road_share.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=1)
    print(f"저장: {out_path} ({len(results)}개 구간)")

    # 상위 10개 차도 비율 출력(검산용)
    top = sorted([r for r in results if r["roadShareRatio"] is not None], key=lambda r: -r["roadShareRatio"])[:10]
    print("\n차도 비율 상위 10구간:")
    for r in top:
        print(f"  {r['fromTownId']} -> {r['toTownId']}: {r['roadShareRatio']}")


if __name__ == "__main__":
    main()
