// proxy.ts — Supabase 세션 쿠키 갱신 전용(Next.js 16 이후 "middleware"
// 파일 관례가 "proxy"로 이름이 바뀌었다 — 기능은 이전 middleware.ts와 동일).
// ★ 계산기 등 핵심 페이지는 이 프록시와 무관하게 동작한다(요청을 가로채기만
//   하고 리다이렉트하지 않는다) — 규칙 8·10 위반 아님.
// ★ 커뮤니티가 설정 안 됐으면(NEXT_PUBLIC_SUPABASE_URL 등 없음) 아무 것도
//   안 하고 그냥 통과시킨다.

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return NextResponse.next()

  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // 세션 만료 시 갱신 — 결과값은 안 쓰지만 호출 자체가 쿠키를 새로 쓴다.
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ['/community/:path*'],
}
