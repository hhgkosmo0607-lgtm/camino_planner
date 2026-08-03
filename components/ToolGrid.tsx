/**
 * ToolGrid.tsx — 홈 화면 전용 무료 도구 목록.
 * ★ components/ToolNav.tsx(다른 6개 도구 페이지 상단의 압축 크로스링크)와는
 *   다른 용도라 대체하지 않고 새로 만들었다 — 홈은 "이 도구가 뭘 해주는지"를
 *   처음 보는 사람에게 알려줘야 하고, 도구 페이지는 이미 온 사람이 다른 도구로
 *   빠르게 옮겨가면 된다. 여행 단계(준비/현지/기록)로 묶어 한눈에 훑을 수 있게 했다.
 * ★ "일정"(/plan)은 뺐다 — 바로 위 CalculatorCTA가 이미 그 버튼이라 중복이다.
 */

import Link from 'next/link'

interface ToolItem {
  href: string
  titleKo: string
  descKo: string
}

interface ToolGroup {
  labelKo: string
  items: ToolItem[]
}

const GROUPS: ToolGroup[] = [
  {
    labelKo: '출국 전 준비',
    items: [
      { href: '/tools/cost', titleKo: '비용', descKo: '숙박·식비 예산을 미리 가늠해 봅니다' },
      { href: '/tools/pack', titleKo: '배낭 무게', descKo: '짐을 너무 많이 챙기고 있진 않은지 확인합니다' },
      { href: '/tools/timeline', titleKo: '준비 타임라인', descKo: '출국까지 뭘 언제 준비할지 순서대로 봅니다' },
      { href: '/tools/access', titleKo: '접근 교통', descKo: '인천에서 생장피드포르까지 가는 방법' },
    ],
  },
  {
    labelKo: '현지에서',
    items: [
      { href: '/tools/phrases', titleKo: '예약 문장', descKo: '전화로 알베르게 예약할 때 쓸 스페인어 문장' },
      { href: '/tools/luggage', titleKo: '짐배송 비용', descKo: '짐을 부칠지 직접 멜지 비용으로 비교합니다' },
      { href: '/cards', titleKo: '카드', descKo: '말이 안 통할 때 보여주는 스페인어 회화 카드' },
    ],
  },
  {
    labelKo: '걸으며 기록·동행',
    items: [
      { href: '/fog', titleKo: '안개 지도', descKo: '걸으며 도착한 상징적 장소를 하나씩 열어봅니다' },
      { href: '/community', titleKo: '커뮤니티', descKo: '같은 구간을 걷는 순례자와 체크인·게시판으로' },
    ],
  },
]

export function ToolGrid() {
  return (
    <div className="space-y-8">
      {GROUPS.map((group) => (
        <div key={group.labelKo}>
          <h3 className="text-[13px] font-medium uppercase tracking-wide text-muted">{group.labelKo}</h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="min-h-11 rounded-lg border border-stone bg-white px-4 py-3 transition-colors hover:border-ink"
              >
                <p className="text-[15px] font-medium text-text">{item.titleKo}</p>
                <p className="mt-0.5 text-[13px] text-muted">{item.descKo}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
