'use client'

// lib/supabase/client.ts — 브라우저(Client Component)용 Supabase 클라이언트.
// ★ lib/planner/ 밖에 둔다 — 순수 함수·fetch/window 금지(규칙 6) 대상이 아니라
//   lib/localLog.ts와 같은 성격(브라우저 API를 직접 쓰는 코드)이기 때문이다.
// ★ 환경변수가 없으면 null을 반환한다 — 호출부가 isCommunityConfigured()로
//   먼저 확인하거나 null 처리해야 한다.

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  return createBrowserClient<Database>(url, anonKey)
}
