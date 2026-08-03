import 'server-only'

// lib/supabase/server.ts — 서버 컴포넌트·라우트 핸들러용 Supabase 클라이언트.
// 쿠키 기반 세션이라 Server Component에서 직접 인증 상태를 읽을 수 있다.
// ★ lib/planner/ 밖에 둔다(위 client.ts와 같은 이유, 규칙 6).
// ★ 환경변수가 없으면 null — 호출부가 isCommunityConfigured()로 먼저 확인한다.

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from './types'

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null

  const cookieStore = await cookies()

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Server Component에서 호출되면 쿠키를 못 쓴다 — 미들웨어가 세션을
          // 갱신하는 한 무해하다(Supabase SSR 가이드의 표준 처리).
        }
      },
    },
  })
}
