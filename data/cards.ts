// data/cards.ts — F-12 보여주기 카드 23장 (구조만, 2026-07-31)
//
// ⚠️ 총 23장 고정(03문서 5.3절 "더 늘리지 않는다"). B(숙소 9)·C(이동·기타 6)
//   15장은 표준 관광 회화 수준의 고정 문장이라(F-04 phrasebook.ts와 같은 근거
//   수준) 지금 채웠다. A(부상 8)는 규칙 11(의료 정보, 정형외과·스포츠의학
//   자문 검수 전 금지)에 걸려 steps를 비워뒀다 — 03문서 5.2절도 "모든 의료
//   카드는 자문 검수를 거친 뒤에만 배포한다"고 블록으로 못박아 개별 카드
//   내용과 무관하게 전부 보류한다.
// ⚠️ B1(침대 있나요)·B7(빈대) 흐름형 분기(03문서 5.4절, GOTO_CARD)는 아직
//   안 만들었다 — 지금은 전부 단일 스텝(END)이다. B3·C2·C4는 원안이 지도
//   짚기·시간 짚기 같은 인터랙션을 요구하는데, 그 UI가 없어서 방향·범위를
//   묻는 정도로 단순화했다(정밀 마을 선택·자동 거리 계산은 다음 확장).
import type { Card } from '../lib/schema'

const end = (labelEs: string, labelKo: string) => ({ labelEs, labelKo, next: { type: 'END' as const } })

export const cards: Card[] = [
  // ── B축 · 숙소 (9) ──
  {
    id: 'B1',
    category: 'BED',
    titleKo: '침대 있나요',
    blockedReasonKo: null,
    steps: [
      {
        promptEs: '¿Tiene una cama libre para esta noche?',
        promptKo: '오늘 밤 침대가 있는지 물어봅니다',
        options: [
          end('Sí, hay cama', '있습니다'),
          end('No, no hay cama', '없습니다(만실)'),
          end('Solo desde cierta hora', '특정 시간 이후부터 가능합니다'),
          end('Solo con reserva', '예약자만 받습니다'),
        ],
      },
    ],
  },
  {
    id: 'B2',
    category: 'BED',
    titleKo: '예약했습니다',
    blockedReasonKo: null,
    steps: [
      {
        promptEs: 'He hecho una reserva.',
        promptKo: '예약했다고 알립니다',
        options: [
          end('Sí, está confirmada', '확인됐습니다'),
          end('No tengo su reserva', '예약 기록이 없습니다'),
          end('¿Puede decirme su nombre otra vez?', '이름을 다시 말씀해 주세요'),
        ],
      },
    ],
  },
  {
    id: 'B3',
    category: 'BED',
    titleKo: '만실인데 어디로 가야 하나요',
    blockedReasonKo: null,
    steps: [
      {
        promptEs: 'Está completo. ¿A qué otro sitio puedo ir?',
        promptKo: '만실일 때 다른 숙소를 물어봅니다',
        options: [
          end('Aquí cerca, se puede ir andando', '가까이 있어요, 걸어갈 수 있어요'),
          end('Está en el próximo pueblo', '다음 마을에 있어요'),
          end('Puedo llamar para preguntar', '제가 대신 전화해서 물어봐 드릴게요'),
        ],
      },
    ],
  },
  {
    id: 'B4',
    category: 'BED',
    titleKo: '몇 시에 문 닫나요',
    blockedReasonKo: null,
    steps: [
      {
        promptEs: '¿A qué hora cierran la puerta / es el silencio?',
        promptKo: '문 닫는 시각·소등 시각을 물어봅니다',
        options: [
          end('A las 22:00', '22시입니다'),
          end('A las 23:00', '23시입니다'),
          end('A medianoche', '자정입니다'),
          end('No hay hora fija', '정해진 시각이 없습니다'),
        ],
      },
    ],
  },
  {
    id: 'B5',
    category: 'BED',
    titleKo: '짐 배송 접수하고 싶습니다',
    blockedReasonKo: null,
    steps: [
      {
        promptEs: 'Quisiera dejar mi mochila para el transporte de equipaje.',
        promptKo: '짐 배송 접수가 되는지 물어봅니다',
        options: [
          end('Sí, es posible', '가능합니다'),
          end('No, no lo aceptamos aquí', '이곳에서는 접수하지 않습니다'),
          end('Cuesta un poco más', '요금이 따로 있습니다'),
        ],
      },
    ],
  },
  {
    id: 'B6',
    category: 'BED',
    titleKo: '세탁기·건조기 쓸 수 있나요',
    blockedReasonKo: null,
    steps: [
      {
        promptEs: '¿Hay lavadora y secadora? ¿Puedo usarlas?',
        promptKo: '세탁기·건조기 여부를 물어봅니다',
        options: [
          end('Sí, hay las dos', '세탁기·건조기 둘 다 있습니다'),
          end('Solo hay lavadora', '세탁기만 있습니다'),
          end('No hay ninguna', '둘 다 없습니다'),
          end('Le explico cómo usarla', '사용법을 알려드릴게요'),
        ],
      },
    ],
  },
  {
    id: 'B7',
    category: 'BED',
    titleKo: '빈대가 있는 것 같습니다',
    blockedReasonKo: null,
    steps: [
      {
        promptEs: 'Creo que hay chinches en mi cama.',
        promptKo: '빈대(chinches)가 있는 것 같다고 알립니다',
        options: [
          end('Sí, lo confirmo', '확인했습니다'),
          end('Le cambio de cama', '침대를 바꿔드릴게요'),
          end('Vamos a lavar la ropa a alta temperatura', '고온으로 세탁하겠습니다'),
        ],
      },
    ],
  },
  {
    id: 'B8',
    category: 'BED',
    titleKo: '아침 몇 시에 나가야 하나요',
    blockedReasonKo: null,
    steps: [
      {
        promptEs: '¿A qué hora tenemos que salir por la mañana?',
        promptKo: '아침 퇴실 시각을 물어봅니다',
        options: [
          end('Antes de las 8:00', '8시 전입니다'),
          end('Antes de las 9:00', '9시 전입니다'),
          end('Antes de las 10:00', '10시 전입니다'),
          end('No hay hora fija', '정해진 시각이 없습니다'),
        ],
      },
    ],
  },
  {
    id: 'B9',
    category: 'BED',
    titleKo: '도장 부탁드립니다',
    blockedReasonKo: null,
    steps: [
      {
        promptEs: '¿Me podría sellar la credencial, por favor?',
        promptKo: '크레덴시알에 도장을 부탁합니다',
        options: [end('Sí, claro', '네, 찍어드릴게요')],
      },
    ],
  },

  // ── A축 · 부상 (8) — 규칙 11: 의료 자문 검수 전까지 전부 보류 ──
  { id: 'A1', category: 'INJURY', titleKo: '약국 — 물집', steps: [], blockedReasonKo: '의료 자문 검수 전까지 비워둡니다(규칙 11)' },
  { id: 'A2', category: 'INJURY', titleKo: '약국 — 근육통·부기', steps: [], blockedReasonKo: '의료 자문 검수 전까지 비워둡니다(규칙 11)' },
  { id: 'A3', category: 'INJURY', titleKo: '약국 — 발목·무릎', steps: [], blockedReasonKo: '의료 자문 검수 전까지 비워둡니다(규칙 11)' },
  { id: 'A4', category: 'INJURY', titleKo: '의사를 만나야 합니다', steps: [], blockedReasonKo: '의료 자문 검수 전까지 비워둡니다(규칙 11)' },
  { id: 'A5', category: 'INJURY', titleKo: '응급입니다', steps: [], blockedReasonKo: '의료 자문 검수 전까지 비워둡니다(규칙 11)' },
  { id: 'A6', category: 'INJURY', titleKo: '물리치료사를 찾습니다', steps: [], blockedReasonKo: '의료 자문 검수 전까지 비워둡니다(규칙 11)' },
  { id: 'A7', category: 'INJURY', titleKo: '내 의료 정보', steps: [], blockedReasonKo: '개인 건강정보(혈액형·알레르기) 입력·표시라 별도 검토 전까지 비워둡니다' },
  { id: 'A8', category: 'INJURY', titleKo: '보험 청구용 서류가 필요합니다', steps: [], blockedReasonKo: '의료 자문 검수 전까지 비워둡니다(규칙 11)' },

  // ── C축 · 이동·기타 (6) ──
  {
    id: 'C1',
    category: 'TRANSPORT_ETC',
    titleKo: '다음 마을까지 택시',
    blockedReasonKo: null,
    steps: [
      {
        promptEs: '¿Puede pedirme un taxi al próximo pueblo?',
        promptKo: '택시를 불러달라고 요청합니다',
        options: [
          end('Sí, puedo llamar uno', '네, 불러드릴게요'),
          end('Tarda un poco en llegar', '조금 기다리셔야 해요'),
          end('Aquí no hay taxi', '이곳엔 택시가 없어요'),
        ],
      },
    ],
  },
  {
    id: 'C2',
    category: 'TRANSPORT_ETC',
    titleKo: '버스 정류장·시간',
    blockedReasonKo: null,
    steps: [
      {
        promptEs: '¿Dónde está la parada de autobús y a qué hora sale el próximo?',
        promptKo: '버스 정류장 위치와 다음 출발 시각을 물어봅니다',
        options: [
          end('Aquí mismo, muy cerca', '바로 근처에 있어요'),
          end('Un poco más lejos', '조금 더 가야 해요'),
          end('Dentro de una hora', '1시간 안에 있어요'),
          end('Hoy no hay más', '오늘은 더 없어요'),
        ],
      },
    ],
  },
  {
    id: 'C3',
    category: 'TRANSPORT_ETC',
    titleKo: '배낭을 맡기고 싶습니다',
    blockedReasonKo: null,
    steps: [
      {
        promptEs: 'Quisiera dejar mi mochila aquí un momento.',
        promptKo: '배낭을 잠시 맡길 수 있는지 물어봅니다',
        options: [
          end('Sí, puede dejarla', '맡기실 수 있어요'),
          end('Lo siento, no es posible', '죄송하지만 안 돼요'),
          end('Cuesta un poco', '요금이 있습니다'),
        ],
      },
    ],
  },
  {
    id: 'C4',
    category: 'TRANSPORT_ETC',
    titleKo: '길을 잃었습니다',
    blockedReasonKo: null,
    steps: [
      {
        promptEs: 'Creo que me he perdido. ¿Puede ayudarme?',
        promptKo: '길을 잃은 것 같다고 도움을 요청합니다',
        options: [
          end('Está en el camino correcto', '맞는 길로 가고 계세요'),
          end('Tiene que volver un poco', '조금 되돌아가셔야 해요'),
          end('Yo le acompaño', '제가 안내해 드릴게요'),
        ],
      },
    ],
  },
  {
    id: 'C5',
    category: 'TRANSPORT_ETC',
    titleKo: '물을 채울 수 있나요',
    blockedReasonKo: null,
    steps: [
      {
        promptEs: '¿Puedo rellenar mi botella de agua aquí?',
        promptKo: '물통을 채울 수 있는지 물어봅니다',
        options: [
          end('Sí, aquí mismo', '여기서 채우실 수 있어요'),
          end('Aquí no, pero hay una fuente cerca', '여기는 안 되지만 근처에 식수대가 있어요'),
        ],
      },
    ],
  },
  {
    id: 'C6',
    category: 'TRANSPORT_ETC',
    titleKo: '채식·알레르기 (식당)',
    blockedReasonKo: null,
    steps: [
      {
        promptEs: 'Soy vegetariano/a. ¿Tienen alguna opción sin carne?',
        promptKo: '채식 메뉴가 있는지 물어봅니다',
        options: [
          end('Sí, tenemos opciones', '있습니다'),
          end('No, lo siento', '없습니다'),
          end('Puedo preparar algo distinto', '다른 걸 준비해 드릴게요'),
        ],
      },
    ],
  },
]
