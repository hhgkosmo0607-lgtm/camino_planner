# -*- coding: utf-8 -*-
"""
compare_dem.py — IGN MDT05(5m) vs EU-DEM(25m) 비교 (일회성 검증 도구)

목적: CLAUDE.md가 지정한 IGN 5m 를 실제로 조회해, 우리가 우선 사용한
EU-DEM 25m 와 구간 누적 상승/하강이 얼마나 다른지 확인한다.
5m 로 교체할 가치가 있는지 판단 근거를 만든다.

IGN 5m 취득: 스페인 IGN WCS (INSPIRE) 를 좁은 bbox 로 실시간 조회한다.
  https://servicios.idee.es/wcs-inspire/mdt  COVERAGEID=Elevacion4258_5 (ETRS89, 5m)
  ※ 전체 도엽 파일을 배포용으로 내려받는 게 아니라, 검증용으로 필요한 지점만
    작게 조회한다 (CLAUDE.md "도엽 자동 다운로드 금지"의 취지: 배포 회피).

실행: python3 scripts/pipeline/compare_dem.py
의존성: rasterio, numpy (pip install rasterio numpy)
"""

import io
import json
import os
import time
import urllib.request
import urllib.parse

import numpy as np
import rasterio

from build_geometry import (
    resample,
    _moving_avg,
    clean_gain_loss,
    load_towns_source,
    OUT_DIR,
)

WCS = "https://servicios.idee.es/wcs-inspire/mdt"
COVERAGE = "Elevacion4258_5"  # ETRS89 위경도, 5m 격자 (WGS84와 스페인에서 <1m 차이)
BATCH = 25  # 한 번에 조회할 연속 점 수 (bbox 를 작게 유지)
MARGIN = 0.0008  # bbox 여유 (약 90m)

# 비교할 대표 구간 (규칙 3 핵심 + 대조군 평지)
SEGMENTS = [
    ("saint-jean-pied-de-port", "roncesvalles", "피레네 오르막 (1일차)"),
    ("el-acebo", "molinaseca", "엘아세보→몰리나세카 급하강"),
    ("la-faba", "o-cebreiro", "오 세브레이로 오르막"),
    ("burgos", "hornillos-del-camino", "메세타 평지 (대조군)"),
]


def wcs_geotiff(lat0, lat1, lon0, lon1):
    q = {
        "SERVICE": "WCS", "VERSION": "2.0.1", "REQUEST": "GetCoverage",
        "COVERAGEID": COVERAGE, "FORMAT": "image/tiff",
        "SUBSET": [f"lat({lat0},{lat1})", f"long({lon0},{lon1})"],
    }
    # SUBSET 이 2개라 doseq 로 인코딩
    url = WCS + "?" + urllib.parse.urlencode(q, doseq=True)
    for _ in range(4):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                data = r.read()
            if data[:4] in (b"II*\x00", b"MM\x00*"):
                return data
            # 예외 XML
            raise RuntimeError(data[:200].decode("utf-8", "replace"))
        except Exception as e:
            last = e
            time.sleep(2)
    raise last


def sample_ign(points):
    """points: [(lat,lon)...] → IGN 5m 고도 리스트. 연속 점을 batch 로 묶어 bbox 조회."""
    elevs = [None] * len(points)
    for start in range(0, len(points), BATCH):
        chunk = list(range(start, min(start + BATCH, len(points))))
        lats = [points[i][0] for i in chunk]
        lons = [points[i][1] for i in chunk]
        tif = wcs_geotiff(
            min(lats) - MARGIN, max(lats) + MARGIN,
            min(lons) - MARGIN, max(lons) + MARGIN,
        )
        with rasterio.open(io.BytesIO(tif)) as ds:
            nodata = ds.nodata
            band = ds.read(1)
            for i in chunk:
                la, lo = points[i]
                row, col = ds.index(lo, la)  # (x=lon, y=lat)
                row = max(0, min(band.shape[0] - 1, row))
                col = max(0, min(band.shape[1] - 1, col))
                v = float(band[row, col])
                if nodata is not None and v == nodata:
                    v = np.nan
                elevs[i] = v
        time.sleep(0.6)  # 공개 서비스 예의
    return elevs


def gain_loss(vals):
    vals = [v for v in vals if v is not None and not (isinstance(v, float) and np.isnan(v))]
    if len(vals) < 2:
        return 0.0, 0.0, 0.0
    sm = _moving_avg(vals, 5)
    a, d = clean_gain_loss(sm, 3.0)
    return a, d, max(vals)


def main():
    route = json.load(open(os.path.join(OUT_DIR, "full_route.json")))
    full_path, full_cum = route["path"], route["cum"]
    eudem = json.load(open(os.path.join(OUT_DIR, "full_elevations.json")))
    resampled = resample(full_path, full_cum, step=100.0)  # eudem 과 인덱스 일치

    towns = load_towns_source()
    ratio = full_cum[-1] / (towns[-1]["km"] * 1000)
    km_of = {t["es"]: t["km"] for t in towns}
    id_of = {}
    import re, unicodedata
    def slug(es):
        s = unicodedata.normalize("NFKD", es)
        s = "".join(c for c in s if not unicodedata.combining(c)).lower()
        return re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    for t in towns:
        id_of[slug(t["es"])] = t

    print(f"{'구간':<28}{'':2}{'IGN5m 상승/하강':>18}{'EU25m 상승/하강':>18}{'차이':>14}")
    print("-" * 90)
    for from_id, to_id, label in SEGMENTS:
        a = id_of[from_id]; b = id_of[to_id]
        from_m = a["km"] * 1000 * ratio
        to_m = b["km"] * 1000 * ratio
        i0 = int(from_m / 100)
        i1 = int(round(to_m / 100))
        pts = resampled[i0:i1 + 1]
        eu = eudem[i0:i1 + 1]

        ign = sample_ign(pts)
        ia, idsc, imax = gain_loss(ign)
        ea, edsc, emax = gain_loss(eu)

        print(f"{label:<28}{'':2}{f'+{ia:.0f} / -{idsc:.0f}':>18}{f'+{ea:.0f} / -{edsc:.0f}':>18}"
              f"{f'상{ia-ea:+.0f} 하{idsc-edsc:+.0f}':>16}")
        print(f"{'  최고점':<28}{'':2}{f'{imax:.0f}m':>18}{f'{emax:.0f}m':>18}{f'{imax-emax:+.0f}m':>14}")

    print("\n※ IGN 5m = 스페인 국립지리원 MDT05 (PNOA-LiDAR). EU-DEM 25m = Copernicus.")
    print("  두 값 모두 스무딩(이동평균5 + 히스테리시스3m) 후 비교.")


if __name__ == "__main__":
    main()
