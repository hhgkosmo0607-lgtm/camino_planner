// lib/supabase/config.ts — 커뮤니티 기능 활성화 여부 판단.
// app/api/subscribe/route.ts(Resend)와 같은 패턴: 키가 없으면 조용히 비활성화
// 상태로 취급하고, 핵심 기능(계산기 등)은 이 값과 무관하게 그대로 동작한다
// (CLAUDE.md 규칙 8).

export function isCommunityConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
