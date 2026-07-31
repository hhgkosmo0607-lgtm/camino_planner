/**
 * lib/localLog.ts — F-22·F-23 개인 기록(체크리스트·통증 메모·지출) 저장.
 *
 * ★ 규칙 8(2026-07-31 정정): 계획 상태는 URL, 개인 기록은 기기 안 localStorage에만.
 *   서버로 절대 보내지 않는다. 다른 기기·브라우저로 바꾸거나 브라우저 데이터를
 *   지우면 사라진다 — 컴포넌트 쪽에서 이 사실을 화면에 반드시 밝힌다.
 * ★ lib/planner/ 가 아니라 여기 둔 이유: window를 참조해서 순수 함수가 아니다
 *   (규칙 6은 lib/planner/ 전용 — 계산 로직만 Phase 3 재사용을 위해 순수하게 유지).
 * ★ SSR 중에는 window가 없다 — 전부 조용히 빈 값을 반환하고, 실제 로드는
 *   클라이언트에서 useEffect로 마운트 후에 한다(하이드레이션 불일치 방지).
 */

import type { ExpenseEntry } from './cost'

const STORAGE_KEY = 'camino-log-v1'

export interface DayLog {
  amChecked: string[] // 체크된 아침 항목 id
  pmChecked: string[] // 체크된 저녁 항목 id
  painNote: string // 자유 텍스트. 자동으로 일정에 반영되지 않는다(규칙 11 — 의료 조언 아님)
  expenses: ExpenseEntry[]
}

const EMPTY_LOG: DayLog = { amChecked: [], pmChecked: [], painNote: '', expenses: [] }

/** Stage 하루를 가리키는 저장 키. dayNo가 아니라 마을쌍을 쓴다 — 일정 설정을 바꿔도(하루 km 등) dayNo는 흔들리지만 마을쌍은 그대로라서다. */
export function stageKey(fromTownId: string, toTownId: string): string {
  return `${fromTownId}>${toTownId}`
}

function readAll(): Record<string, DayLog> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

function writeAll(all: Record<string, DayLog>): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // 저장 공간 초과 등 — 조용히 무시(개인 기록 실패로 화면 전체를 막지 않는다)
  }
}

export function loadDayLog(key: string): DayLog {
  const all = readAll()
  return all[key] ?? EMPTY_LOG
}

export function saveDayLog(key: string, entry: DayLog): void {
  const all = readAll()
  all[key] = entry
  writeAll(all)
}

/** F-23 지출 합산용 — 현재 이 기기에 기록된 모든 날의 지출을 하나로 모은다. */
export function loadAllExpenses(): ExpenseEntry[] {
  const all = readAll()
  return Object.values(all).flatMap((d) => d.expenses ?? [])
}

export function clearAllLogs(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}
