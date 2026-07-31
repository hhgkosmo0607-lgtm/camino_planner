'use client'

/**
 * RouteMap.tsx — 프랑스 길 지도(웹 트랙 경량 지도, 2026-07-31 신설).
 *
 * ★ MapLibre GL(오픈소스, 특정 회사 종속 없음) + OpenFreeMap 타일(무료·무API키).
 *   06문서 원안의 GraphHopper·Photon·PostGIS 그래프 라우팅은 안 쓴다 — 우리 경로는
 *   고정된 프랑스 길 하나 + 갈림길 11곳뿐이라 실시간 임의 장소 검색·경로탐색이
 *   필요 없고, 하루 단위 일정 분할은 이미 lib/planner/split.ts가 한다. 그 셋은
 *   진짜 오프라인 내비게이션이 필요한 Phase 3 앱 트랙에서 다시 설계한다.
 * ★ 경로선은 /geo/camino-frances.geojson(public/, 정적 자산)을 클라이언트에서
 *   fetch — scripts/pipeline/build_geometry.py의 Douglas-Peucker 단순화 결과다.
 *   정밀 거리·고도 계산에는 절대 안 쓴다(그건 data/profiles.ts). 지도 표시 전용.
 * ★ 마을 마커는 data/towns.ts의 실측 lat/lng을 그대로 쓴다(추가 API 호출 없음).
 * ★ 노란 선(flecha, #F0B429)은 "길 안내 전용" 규칙과 정확히 맞는 용도 — 여기서만 쓴다.
 * ★ 서버 렌더 불가(캔버스/WebGL) — 호출부(app/plan/page.tsx)에서 next/dynamic으로
 *   { ssr: false } 임포트한다. 이 파일 자체는 평범한 클라이언트 컴포넌트다.
 */

import { useEffect, useRef } from 'react'
import {
  Map as MaplibreMap,
  NavigationControl,
  AttributionControl,
  LngLatBounds,
  Popup,
  setWorkerUrl,
  type MapLayerMouseEvent,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { towns } from '@/data/towns'

// ★ Next.js(Turbopack)가 maplibre-gl의 `new Worker(new URL(...))` 패턴을 제대로
//   번들링하지 못해 타일 워커가 조용히 생성되지 않는 문제가 있었다(2026-07-31
//   실제 확인 — page.workers().length가 0, 'load' 이벤트가 영원히 안 뜸).
//   워커 스크립트(+그 안에서 import하는 shared 청크)를 public/에 그대로 복사해두고
//   경로를 직접 지정해서 우회한다. `scripts/copy-maplibre-worker.mjs`가 이 복사를 한다.
setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')

const OSM_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors (ODbL) · 타일 © OpenFreeMap'

interface RouteMapProps {
  /** 현재 계획에 포함된 마을 id — 다른 색으로 강조 표시. 없으면 전부 기본색. */
  highlightTownIds?: string[]
  height?: number
}

export function RouteMap({ highlightTownIds, height = 420 }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MaplibreMap | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const highlighted = new Set(highlightTownIds ?? [])
    const map = new MaplibreMap({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [-3.7, 42.6], // 프랑스 길 대략 중앙(부르고스 인근)
      zoom: 6,
      attributionControl: false,
    })
    mapRef.current = map

    map.addControl(new AttributionControl({ customAttribution: OSM_ATTRIBUTION }))
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right')

    map.on('load', () => {
      // 경로선
      fetch('/geo/camino-frances.geojson')
        .then((r) => r.json())
        .then((geojson) => {
          if (!map.getSource('route')) {
            map.addSource('route', { type: 'geojson', data: geojson })
            map.addLayer({
              id: 'route-line',
              type: 'line',
              source: 'route',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': '#F0B429', 'line-width': 3.5 },
            })
          }
          const coords: [number, number][] = geojson.features[0].geometry.coordinates
          const bounds = coords.reduce(
            (b: LngLatBounds, c: [number, number]) => b.extend(c),
            new LngLatBounds(coords[0], coords[0]),
          )
          map.fitBounds(bounds, { padding: 32, duration: 0 })
        })
        .catch(() => {
          // 지도 타일은 뜨지만 경로선만 빠지는 상태 — 조용히 무시(지도 전체를 막지 않음)
        })

      // 마을 마커 — 숙소 있는 마을만(beds > 0), 강조 여부를 속성으로 구분
      const townFeatures = towns
        .filter((t) => t.beds > 0)
        .map((t) => ({
          type: 'Feature' as const,
          properties: { id: t.id, nameKo: t.nameKo, nameEs: t.nameEs, km: t.km, highlighted: highlighted.has(t.id) },
          geometry: { type: 'Point' as const, coordinates: [t.lng, t.lat] },
        }))
      map.addSource('towns', { type: 'geojson', data: { type: 'FeatureCollection', features: townFeatures } })
      map.addLayer({
        id: 'towns-point',
        type: 'circle',
        source: 'towns',
        paint: {
          'circle-radius': ['case', ['get', 'highlighted'], 6, 3.5],
          'circle-color': ['case', ['get', 'highlighted'], '#F0B429', '#12253F'],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
        },
      })

      const popup = new Popup({ closeButton: false, offset: 10 })
      map.on('mouseenter', 'towns-point', (e: MapLayerMouseEvent) => {
        map.getCanvas().style.cursor = 'pointer'
        const f = e.features?.[0]
        if (!f) return
        const p = f.properties as { nameKo: string; nameEs: string; km: number }
        popup
          .setLngLat((f.geometry as GeoJSON.Point).coordinates as [number, number])
          .setHTML(`<b>${p.nameKo}</b><br><span style="color:#6F6450">${p.nameEs} · ${p.km.toFixed(1)}km</span>`)
          .addTo(map)
      })
      map.on('mouseleave', 'towns-point', () => {
        map.getCanvas().style.cursor = ''
        popup.remove()
      })
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="no-print overflow-hidden rounded-lg border border-stone">
      <noscript>
        <div className="flex items-center justify-center bg-granite px-4 py-8 text-center text-[15px] text-muted">
          지도를 보려면 JavaScript가 필요합니다 — 경로·마을 정보는 이 페이지 다른 곳에서 확인할 수 있습니다.
        </div>
      </noscript>
      <div ref={containerRef} style={{ height }} aria-label="프랑스 길 경로 지도" role="img" />
    </div>
  )
}
