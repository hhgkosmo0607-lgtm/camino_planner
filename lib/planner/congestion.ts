/**
 * lib/planner/congestion.ts — F-02 "오늘 서두를 필요 있나요?" 혼잡 추정.
 *
 * ★★ 03 문서 원안의 정밀 수요 공식(기준 순례자 수 × 계절/요일/구간/특수일 계수)은
 *   구현하지 않았다. "기준 순례자 수"(하루 단위 출발자 수) 실측 데이터가 없어서
 *   계수를 지어내야 했기 때문이다(규칙 1). 대신 실제로 확인 가능한 요소만 골라
 *   3단계(LOW/HURRY/HIGH)로만 판정한다 — 이것도 F-02 원안 자체가 "정확도를
 *   과장하지 않는다"고 못박은 것과 방향이 같다.
 *
 * 반영한 실제 요소:
 *  1) 마을 총 침대 수(data/albergues.ts 실측 합계, lib/geo.ts totalBedsForTown)
 *  2) 사리아 이후 구간 — CLAUDE.md에 이미 있는 사실("최다 출발지, 여기부터 114.2km")
 *  3) 성수기(5~10월, 순례자의 83%가 이 기간에 산티아고 도착 — 공식 순례자사무소
 *     통계를 인용한 2차 자료 다수 일치) + 9월 정점(여러 자료가 공통 언급)
 *  4) 실제 날짜 기반 특수일: 부활절(Semana Santa, 서방 그레고리력 계산식으로 산출 —
 *     지어낸 값이 아니라 결정론적 계산), 7/25 성 야고보 축일(산티아고 인근),
 *     10/12 스페인 국경일, 7/6~14 산 페르민(팜플로나 인근), 2027년 성년 — 전부
 *     CLAUDE.md·03 문서에 이미 있는 실제 날짜/사실
 *
 * 순수 함수. fetch/window/localStorage 없음.
 */

export type CongestionLevel = 'LOW' | 'HURRY' | 'HIGH'

export interface CongestionInfo {
  level: CongestionLevel
  totalBeds: number | null
  reasonsKo: string[]
}

const SARRIA_KM = 658.9
const TOTAL_KM = 773.1
const PAMPLONA_KM = 67.5

/** 그레고리력 부활절(서방 기독교). Meeus/Jones/Butcher 알고리즘 — 결정론적 계산. */
function easterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(Date.UTC(year, month - 1, day))
}

const DAY_MS = 24 * 60 * 60 * 1000
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY_MS)

/** 성주간(Semana Santa) — 성지주일(부활절 -7일)부터 부활절 당일까지. */
function isSemanaSanta(date: Date): boolean {
  const easter = easterSunday(date.getUTCFullYear())
  const diff = daysBetween(easter, date) // date - easter
  return diff >= -7 && diff <= 0
}

function isSantiagoFeastDay(date: Date): boolean {
  return date.getUTCMonth() === 6 && date.getUTCDate() === 25 // 7월 25일
}

function isSpanishNationalDay(date: Date): boolean {
  return date.getUTCMonth() === 9 && date.getUTCDate() === 12 // 10월 12일
}

function isSanFermin(date: Date): boolean {
  const m = date.getUTCMonth()
  const d = date.getUTCDate()
  return m === 6 && d >= 6 && d <= 14 // 7월 6~14일
}

function isHolyYear(date: Date): boolean {
  return date.getUTCFullYear() === 2027
}

export interface CongestionParams {
  townKm: number              // 마을의 누적 km (towns.ts Town.km)
  totalBeds: number | null    // lib/geo.ts totalBedsForTown() 결과
  date: Date | null           // 도착 예정일(계산 가능하면). 없으면 계절/특수일 요소는 건너뜀
}

export function assessCongestion(p: CongestionParams): CongestionInfo {
  const reasons: string[] = []
  let score = 0

  // 1) 침대 수 (실측)
  if (p.totalBeds != null) {
    if (p.totalBeds < 20) {
      score += 2
      reasons.push(`이 마을 침대 수가 약 ${p.totalBeds}개로 적은 편입니다`)
    } else if (p.totalBeds < 80) {
      score += 1
    }
  }

  // 2) 사리아 이후 (실제 사실 — 최다 출발지, 도보 순례자 급증 구간)
  const remainingKm = TOTAL_KM - p.townKm
  if (p.townKm >= SARRIA_KM) {
    score += 1
    reasons.push('사리아 이후 구간 — 최소 도보 거리(100km)만 걷는 출발자가 몰립니다')
  }

  // 3~4) 날짜 기반 요소 (계산 가능할 때만)
  if (p.date) {
    const month = p.date.getUTCMonth() + 1
    if (month >= 5 && month <= 10) {
      score += 1
      reasons.push('성수기(5~10월) — 순례자의 약 83%가 이 기간에 도착합니다')
      if (month === 9) {
        score += 1
        reasons.push('9월은 여러 자료가 공통으로 꼽는 최성수 시기입니다')
      }
    }
    if (isSemanaSanta(p.date)) {
      score += 2
      reasons.push('부활절 성주간(Semana Santa) — 스페인 전역 이동·숙박 수요가 급증합니다')
    }
    if (isSpanishNationalDay(p.date)) {
      score += 1
      reasons.push('10월 12일 스페인 국경일 — 연휴 이동이 겹칩니다')
    }
    if (isSantiagoFeastDay(p.date) && remainingKm <= 30) {
      score += 2
      reasons.push('7월 25일 성 야고보 축일 — 산티아고 인근은 특히 붐빕니다')
    }
    if (isSanFermin(p.date) && Math.abs(p.townKm - PAMPLONA_KM) <= 20) {
      score += 2
      reasons.push('7월 6~14일 산 페르민 축제 — 팜플로나 인근이 극심하게 붐빕니다')
    }
    if (isHolyYear(p.date)) {
      score += 1
      reasons.push('2027년 성년(Xacobeo) — 전 구간 순례자가 늘어나는 해입니다')
    }
  }

  const level: CongestionLevel = score >= 4 ? 'HIGH' : score >= 2 ? 'HURRY' : 'LOW'
  return { level, totalBeds: p.totalBeds, reasonsKo: reasons }
}
