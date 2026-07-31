// scripts/copy-maplibre-worker.mjs — maplibre-gl 워커 스크립트를 public/에 복사.
//
// ★ 왜 필요한가: Next.js(Turbopack)가 maplibre-gl의 `new Worker(new URL(...))`
//   패턴을 제대로 번들링하지 못해, 타일을 파싱하는 웹 워커가 조용히 생성되지
//   않는 문제가 있다(2026-07-31 실제 확인 — 지도 타일은 뜨는데 벡터 경로·마을
//   레이어는 영원히 안 뜨고, 에러도 안 남). components/RouteMap.tsx가
//   `setWorkerUrl()`로 이 경로를 직접 가리키게 해서 우회한다.
// ★ maplibre-gl 버전을 올릴 때마다 이 스크립트도 다시 돌려야 한다(package.json의
//   predev/prebuild가 자동으로 호출한다).
import { copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const srcDir = join(root, 'node_modules', 'maplibre-gl', 'dist')
const outDir = join(root, 'public', 'maplibre')

const files = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']

if (!existsSync(srcDir)) {
  console.error(`maplibre-gl이 설치돼 있지 않음: ${srcDir}`)
  process.exit(1)
}

mkdirSync(outDir, { recursive: true })
for (const f of files) {
  copyFileSync(join(srcDir, f), join(outDir, f))
}
console.log(`복사 완료: ${files.join(', ')} → public/maplibre/`)
