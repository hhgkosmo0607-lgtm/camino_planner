/**
 * app/api/health/route.ts — 배포 모니터링용 헬스체크.
 * ★ 일정 계산은 여전히 서버 렌더 시 클라이언트 없이도 URL만으로 되며(규칙 7·10),
 *   이 엔드포인트는 그 계산에 관여하지 않는다. 가동 여부 확인 전용.
 */

import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
}
