/**
 * app/api/subscribe/route.ts — 선택적 이메일 수집(D-90 체크리스트, P7).
 * ★ 이메일만 받는다. 이름·전화번호는 받지 않는다. DB를 만들지 않고 Resend Audiences로 바로 보낸다.
 * ★ RESEND_API_KEY/RESEND_AUDIENCE_ID가 없으면 503으로 조용히 거절한다 — 계산 기능과 무관하다(규칙 8).
 */

import { NextResponse } from 'next/server'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!apiKey || !audienceId) {
    return NextResponse.json({ error: '이메일 수집이 아직 활성화되지 않았습니다.' }, { status: 503 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  const { email, consent } = (body ?? {}) as { email?: unknown; consent?: unknown }
  if (consent !== true) {
    return NextResponse.json({ error: '개인정보 수집·이용에 동의해야 합니다.' }, { status: 400 })
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: '이메일 주소를 확인해 주세요.' }, { status: 400 })
  }

  const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, unsubscribed: false }),
  })

  if (!res.ok) {
    return NextResponse.json(
      { error: '등록 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}
