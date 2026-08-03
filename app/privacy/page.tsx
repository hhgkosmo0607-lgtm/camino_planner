/**
 * app/privacy/page.tsx — 개인정보 처리방침 (P7).
 * ★ 선택적 이메일 수집(D-90 체크리스트) 동의 문구가 이 페이지를 가리킨다(규칙 8: 가입 없음 원칙 재확인).
 */

import type { Metadata } from 'next'
import Link from 'next/link'
import { brand } from '@/config/brand'

export const metadata: Metadata = {
  title: '개인정보 처리방침',
  description: `${brand.nameKo} 개인정보 처리방침 — 가입 없이 이용 가능하며, 계획은 URL에만 저장됩니다.`,
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-granite pb-16">
      <div className="bg-ink px-5 py-8 text-white">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-2xl font-bold">개인정보 처리방침</h1>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 text-[17px] leading-relaxed text-text">
        <section>
          <h2 className="mb-2 font-display text-lg text-text">가입도, 저장도 없습니다</h2>
          <p>
            {brand.nameKo}는 회원가입이나 로그인이 필요 없습니다. 계산한 일정은 저희 서버에
            저장되지 않고, 브라우저 주소창의 링크(URL) 안에만 담깁니다. 그 링크를 지우거나
            잃어버리면 계획도 함께 사라집니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-text">방문 통계</h2>
          <p>
            서비스 개선을 위해 Vercel Analytics로 익명 이용 통계를 수집합니다. 쿠키를 쓰지
            않고, 개인을 식별하지 않습니다. 수집 항목은 다음과 같습니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>어느 페이지를 봤는지(마을·구간 페이지 등)</li>
            <li>일정 계산에 사용한 값의 요약(출발지, 목표 거리, 체력 수준 등 — 이름·연락처 아님)</li>
            <li>어떤 무료 도구(비용·배낭·타임라인)를 열었는지</li>
            <li>계획 링크 복사·인쇄 버튼을 눌렀는지</li>
          </ul>
          <p className="mt-2">광고 목적의 제3자 추적 스크립트는 넣지 않습니다.</p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-text">이메일은 선택 사항입니다</h2>
          <p>
            일부 화면에 &quot;출국 D-90 체크리스트 받기&quot;처럼 이메일을 입력하는 곳이 있습니다.
            이메일 주소만 받으며, 이름이나 전화번호는 받지 않습니다. 입력한 이메일은 해당
            체크리스트를 보내는 용도로만 쓰고, 수신은 언제든 거부할 수 있습니다.
          </p>
          <p className="mt-2">
            <b>이메일을 입력하지 않아도 계산 결과와 모든 기능을 그대로 볼 수 있습니다.</b>{' '}
            결과를 보려면 이메일을 내라는 방식은 쓰지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-text">커뮤니티는 로그인이 필요합니다</h2>
          <p>
            <code>/community</code>(체크인·게시판)를 쓰려면 이메일 매직링크로 로그인해야 합니다 —
            비밀번호는 없습니다. 이건 계산기 등 다른 기능과 분리된 별도 계정이며, 로그인하지 않아도
            나머지 기능은 그대로 이용할 수 있습니다. 로그인에 쓴 이메일은 다른 사용자에게 공개되지
            않고, 화면에는 직접 정한 닉네임만 보입니다(실명·전화번호는 요구하지 않습니다).
          </p>
          <p className="mt-2">
            체크인·게시글·댓글은 Supabase(외부 데이터베이스 서비스)에 저장됩니다 — 계획 URL이나
            개인 기록(localStorage)과 달리, 이 데이터는 다른 사용자도 볼 수 있다는 전제로 직접
            작성하는 내용입니다. 신고·차단 기능이 있으며, 계정을 지우고 싶으면 아래 문의로
            연락해 주세요.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg text-text">문의</h2>
          <p>
            아직 별도 문의 창구를 마련하지 못했습니다. 서비스명과 함께 확정되는 대로 이
            페이지에 안내합니다.
          </p>
        </section>

        <p className="text-[13px] text-muted">최초 게시: 2026-07-26</p>

        <Link href="/" className="inline-block text-[15px] text-ink underline-offset-2 hover:underline">
          ← 홈으로
        </Link>
      </div>
    </main>
  )
}
