/**
 * lib/phrasebook.ts — F-04 전화·WhatsApp 예약 스크립트 생성기.
 *
 * CLAUDE.md 규칙 11: 의료 정보(통증 대처법·약품명·처치법)는 넣지 않는다.
 *  - 약국·응급 문장은 "전문가에게 도움·추천을 요청"하는 데서 멈춘다. 우리가 처치나
 *    약을 지정하지 않는다 (예: "소염제 주세요" 대신 "뭐가 좋을지 추천해 주세요").
 * 규칙 6: 순수 함수. fetch/window/localStorage 없음 — React Native 이식 대비.
 * 규칙 8: 상태는 URL 쿼리스트링에서 만들어진다 (이 파일은 순수 계산만).
 *
 * 스페인어 문장·발음·뜻은 표준 관광 회화 수준의 고정 템플릿이다. 인원수·시각만
 * 그 안의 빈칸을 채운다 — 사실을 조사해서 채우는 도메인 데이터(마을·숙소 등)가
 * 아니므로 source 필드가 필요 없다.
 */

export type PhraseSituationId =
  | 'albergue_call'
  | 'whatsapp'
  | 'pharmacy'
  | 'bedbug'
  | 'emergency'
  | 'restaurant'

export interface PhraseLine {
  es: string
  ko: string // 한글 발음
  meaning: string // 뜻(한국어)
}

export interface PhraseSituation {
  id: PhraseSituationId
  labelKo: string
  needsPeople: boolean
  needsTime: boolean
  needsName: boolean
}

export const PHRASE_SITUATIONS: PhraseSituation[] = [
  { id: 'albergue_call', labelKo: '알베르게 전화 예약', needsPeople: true, needsTime: true, needsName: true },
  { id: 'whatsapp', labelKo: 'WhatsApp 메시지', needsPeople: true, needsTime: true, needsName: true },
  { id: 'pharmacy', labelKo: '약국 — 도움 요청', needsPeople: false, needsTime: false, needsName: false },
  { id: 'bedbug', labelKo: '빈대 신고 (chinches)', needsPeople: false, needsTime: false, needsName: false },
  { id: 'emergency', labelKo: '응급 상황', needsPeople: false, needsTime: false, needsName: false },
  { id: 'restaurant', labelKo: '식당 주문', needsPeople: true, needsTime: false, needsName: false },
]

const NUM_ES = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
const NUM_KO = ['', '우노', '도스', '트레스', '콰트로', '싱코', '세이스', '시에테', '오초', '누에베']
const HOUR_ES = ['doce', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce']
const HOUR_KO = ['도세', '우나', '도스', '트레스', '콰트로', '싱코', '세이스', '시에테', '오초', '누에베', '디에스', '온세', '도세']

function timePhrase(hour: number): { es: string; ko: string } {
  const h12 = hour % 12 === 0 ? 12 : hour % 12
  const isOne = h12 === 1
  const period = hour < 12 ? 'de la mañana' : hour < 20 ? 'de la tarde' : 'de la noche'
  const periodKo = hour < 12 ? '데 라 마냐나' : hour < 20 ? '데 라 타르데' : '데 라 노체'
  return {
    es: `${isOne ? 'la' : 'las'} ${HOUR_ES[h12]} ${period}`,
    ko: `${isOne ? '라' : '라스'} ${HOUR_KO[h12]} ${periodKo}`,
  }
}

function describeHourKo(hour: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12
  const period = hour < 12 ? '오전' : hour < 20 ? '오후' : '밤'
  return `${period} ${h12}시`
}

export interface PhraseParams {
  people: number // 1~9
  hour: number // 0~23
  name: string // 빈 문자열 가능(선택)
}

export function buildPhrase(situation: PhraseSituationId, raw: PhraseParams): PhraseLine[] {
  const people = Math.min(9, Math.max(1, Math.round(raw.people) || 1))
  const hour = Math.min(23, Math.max(0, Math.round(raw.hour) || 0))
  const name = raw.name.trim()
  const t = timePhrase(hour)

  switch (situation) {
    case 'albergue_call': {
      const lines: PhraseLine[] = [
        { es: 'Hola, buenos días.', ko: '올라, 부에노스 디아스.', meaning: '안녕하세요.' },
        {
          es: 'Quería reservar una cama para esta noche.',
          ko: '케리아 레세르바르 우나 카마 파라 에스타 노체.',
          meaning: '오늘 밤 침대 하나 예약하고 싶습니다.',
        },
        people === 1
          ? { es: 'Soy una persona.', ko: '소이 우나 페르소나.', meaning: '1명입니다.' }
          : {
              es: `Somos ${NUM_ES[people]} personas.`,
              ko: `소모스 ${NUM_KO[people]} 페르소나스.`,
              meaning: `${people}명입니다.`,
            },
        {
          es: `Llegaremos sobre ${t.es}.`,
          ko: `예가레모스 소브레 ${t.ko}.`,
          meaning: `${describeHourKo(hour)}쯤 도착합니다.`,
        },
      ]
      if (name) {
        lines.push({ es: `Mi nombre es ${name}.`, ko: `미 놈브레 에스 ${name}.`, meaning: `제 이름은 ${name}입니다.` })
      }
      lines.push({ es: 'Muchas gracias.', ko: '무차스 그라시아스.', meaning: '감사합니다.' })
      return lines
    }

    case 'whatsapp': {
      const lines: PhraseLine[] = [
        { es: 'Hola, buenas.', ko: '올라, 부에나스.', meaning: '안녕하세요.' },
        {
          es: 'Quería reservar una cama para esta noche, por favor.',
          ko: '케리아 레세르바르 우나 카마 파라 에스타 노체, 포르 파보르.',
          meaning: '오늘 밤 침대 하나 예약하고 싶습니다.',
        },
        people === 1
          ? { es: 'Soy una persona.', ko: '소이 우나 페르소나.', meaning: '1명입니다.' }
          : {
              es: `Somos ${NUM_ES[people]} personas.`,
              ko: `소모스 ${NUM_KO[people]} 페르소나스.`,
              meaning: `${people}명입니다.`,
            },
        {
          es: `Llegaremos sobre ${t.es}.`,
          ko: `예가레모스 소브레 ${t.ko}.`,
          meaning: `${describeHourKo(hour)}쯤 도착합니다.`,
        },
      ]
      if (name) {
        lines.push({ es: `Mi nombre es ${name}.`, ko: `미 놈브레 에스 ${name}.`, meaning: `제 이름은 ${name}입니다.` })
      }
      lines.push({
        es: 'Quedo a la espera de su respuesta. Muchas gracias.',
        ko: '케도 아 라 에스페라 데 수 레스푸에스타. 무차스 그라시아스.',
        meaning: '답변 기다리겠습니다. 감사합니다.',
      })
      return lines
    }

    case 'pharmacy':
      return [
        { es: 'Hola, buenos días.', ko: '올라, 부에노스 디아스.', meaning: '안녕하세요.' },
        {
          es: 'Tengo molestias en el pie al caminar.',
          ko: '텡고 몰레스티아스 엔 엘 피에 알 카미나르.',
          meaning: '걸을 때 발이 불편해요.',
        },
        {
          es: '¿Podría recomendarme algo, por favor?',
          ko: '포드리아 레코멘다르메 알고, 포르 파보르?',
          meaning: '뭐가 좋을지 추천해 주시겠어요?',
        },
        { es: 'Muchas gracias.', ko: '무차스 그라시아스.', meaning: '감사합니다.' },
      ]

    case 'bedbug':
      return [
        { es: 'Hola, disculpe.', ko: '올라, 디스쿨페.', meaning: '실례합니다.' },
        {
          es: 'Creo que hay chinches en mi habitación.',
          ko: '크레오 케 아이 친체스 엔 미 아비타시온.',
          meaning: '제 방에 빈대가 있는 것 같아요.',
        },
        { es: '¿Podría revisarlo, por favor?', ko: '포드리아 레비사를로, 포르 파보르?', meaning: '확인해 주시겠어요?' },
      ]

    case 'emergency':
      return [
        { es: '¡Necesito ayuda, por favor!', ko: '네세시토 아유다, 포르 파보르!', meaning: '도움이 필요해요!' },
        {
          es: '¿Puede llamar a una ambulancia?',
          ko: '푸에데 야마르 아 우나 암불란시아?',
          meaning: '구급차를 불러주실 수 있나요?',
        },
        {
          es: 'Estoy en el Camino de Santiago.',
          ko: '에스토이 엔 엘 카미노 데 산티아고.',
          meaning: '저는 카미노 데 산티아고 길 위에 있습니다.',
        },
      ]

    case 'restaurant':
      return [
        { es: 'Hola, buenas.', ko: '올라, 부에나스.', meaning: '안녕하세요.' },
        people === 1
          ? {
              es: 'Mesa para una persona, por favor.',
              ko: '메사 파라 우나 페르소나, 포르 파보르.',
              meaning: '1명 테이블 부탁드립니다.',
            }
          : {
              es: `Mesa para ${NUM_ES[people]} personas, por favor.`,
              ko: `메사 파라 ${NUM_KO[people]} 페르소나스, 포르 파보르.`,
              meaning: `${people}명 테이블 부탁드립니다.`,
            },
        { es: '¿Tienen menú del peregrino?', ko: '티에넨 메누 델 페레그리노?', meaning: '순례자 메뉴 있나요?' },
        { es: 'La cuenta, por favor.', ko: '라 쿠엔타, 포르 파보르.', meaning: '계산서 주세요.' },
      ]
  }
}
