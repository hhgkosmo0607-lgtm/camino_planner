// data/cards.ts — F-12 보여주기 카드 23장 (2026-07-31 구조만 → 2026-08-03 A축 초안)
//
// ⚠️ 총 23장 고정(03문서 5.3절 "더 늘리지 않는다"). B(숙소 9)·C(이동·기타 6)
//   15장은 표준 관광 회화 수준의 고정 문장이라(F-04 phrasebook.ts와 같은 근거
//   수준) 처음부터 채웠다.
// ⚠️ A(부상 8) — 2026-08-03 갱신: 규칙 11(의료 정보, 정형외과·스포츠의학 자문
//   검수 전 금지)은 여전히 유효하다. 다만 A1~A6·A8(7장)은 "처치·약품을
//   지정"하지 않고 F-04 phrasebook.ts와 완전히 같은 원칙(전문가에게 도움·
//   추천을 요청하는 데서 멈춘다)으로 초안을 작성했다 — 사용자 승인 하에
//   "먼저 작성하고, 실제 자문은 나중에" 순서로 진행한 것이다. **자문 검수를
//   거친 게 아니다** — steps는 채웠지만 blockedReasonKo에 "검수 대기 중"
//   문구를 남겨 UI(CardBrowser.tsx)가 경고 배너로 계속 보여준다. 실제 자문을
//   받으면 그 카드의 blockedReasonKo만 null로 바꾸면 된다(내용은 이미 금칙어
//   테스트 통과, cards.test.ts 참고). A7(내 의료 정보)만 성격이 달라 그대로
//   완전히 보류한다 — 처치 조언이 아니라 순례자 본인의 건강정보를 입력해두는
//   카드라 필요한 건 의학 자문이 아니라 별도 입력 UI 설계다.
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

  // ── A축 · 부상 (8) ──
  // ⚠️ 2026-08-03: "정형외과·스포츠의학 자문 검수 전까지 넣지 않는다"(규칙 11)는
  //   원칙은 그대로 유효하다. 다만 아래 7장(A1~A6, A8)은 "무엇을 처치하라"가
  //   아니라 F-04 phrasebook.ts의 약국·응급 시나리오와 똑같이 "전문가에게 도움·
  //   추천을 요청하는 데서 멈추는" 스크립트라, 그 원칙 자체는 어기지 않는다고
  //   판단해 우선 초안을 작성했다 — **자문 검수 전 임시 배포 승인을 대신하지
  //   않는다.** blockedReasonKo를 검수 대기 문구로 남겨 화면에서 "검수 전"임을
  //   계속 밝히고, 실제 자문을 받으면 문구만 지운다(내용은 이미 금칙어 통과).
  //   `cards.test.ts`가 phrasebook.test.ts와 같은 금칙어(약품명·처치법) 목록으로
  //   전부 감시한다. A7만 성격이 달라 그대로 보류한다(아래 주석).
  {
    id: 'A1',
    category: 'INJURY',
    titleKo: '약국 — 물집',
    blockedReasonKo: '초안 작성됨 — 정형외과·스포츠의학 자문 검수 대기 중(규칙 11)',
    steps: [
      {
        promptEs: 'Hola, tengo molestias por una ampolla en el pie al caminar. ¿Podría recomendarme algo, por favor?',
        promptKo: '발에 물집이 생겨 불편하다고 말하고, 약사에게 추천을 요청합니다',
        options: [
          end('Sí, tengo algo que le puede ayudar', '네, 도움이 될 만한 게 있어요'),
          end('¿Puede enseñármela?', '상처를 보여주실 수 있나요?'),
          end('Le recomiendo ver a un médico', '병원에 가보시길 권해요'),
        ],
      },
    ],
  },
  {
    id: 'A2',
    category: 'INJURY',
    titleKo: '약국 — 근육통·부기',
    blockedReasonKo: '초안 작성됨 — 정형외과·스포츠의학 자문 검수 대기 중(규칙 11)',
    steps: [
      {
        promptEs: 'Hola, tengo dolor muscular y algo de hinchazón por caminar mucho. ¿Podría recomendarme algo, por favor?',
        promptKo: '근육통과 부기가 있다고 말하고, 약사에게 추천을 요청합니다',
        options: [
          end('Sí, tengo algo que le puede ayudar', '네, 도움이 될 만한 게 있어요'),
          end('¿Desde cuándo le duele?', '언제부터 아프셨나요?'),
          end('Le recomiendo ver a un médico', '병원에 가보시길 권해요'),
        ],
      },
    ],
  },
  {
    id: 'A3',
    category: 'INJURY',
    titleKo: '약국 — 발목·무릎',
    blockedReasonKo: '초안 작성됨 — 정형외과·스포츠의학 자문 검수 대기 중(규칙 11)',
    steps: [
      {
        promptEs: 'Hola, me duele el tobillo (o la rodilla) al caminar. ¿Podría recomendarme algo, por favor?',
        promptKo: '발목이나 무릎이 아프다고 말하고, 약사에게 추천을 요청합니다',
        options: [
          end('Sí, tengo algo que le puede ayudar', '네, 도움이 될 만한 게 있어요'),
          end('Le recomiendo ver a un médico', '병원에 가보시길 권해요'),
          end('¿Puede caminar con normalidad?', '평소처럼 걸을 수 있으세요?'),
        ],
      },
    ],
  },
  {
    id: 'A4',
    category: 'INJURY',
    titleKo: '의사를 만나야 합니다',
    blockedReasonKo: '초안 작성됨 — 정형외과·스포츠의학 자문 검수 대기 중(규칙 11)',
    steps: [
      {
        promptEs: 'Hola, necesito ver a un médico, por favor. ¿Dónde está el centro de salud más cercano?',
        promptKo: '의사를 만나야 한다고 말하고, 가장 가까운 보건소 위치를 물어봅니다',
        options: [
          end('Está aquí mismo, en el pueblo', '이 마을 안에 있어요'),
          end('No hay aquí, tiene que ir a otro pueblo', '여기는 없고 다른 마을로 가야 해요'),
          end('Puedo acompañarle', '제가 같이 가드릴게요'),
        ],
      },
    ],
  },
  {
    id: 'A5',
    category: 'INJURY',
    titleKo: '응급입니다',
    blockedReasonKo: '초안 작성됨 — 정형외과·스포츠의학 자문 검수 대기 중(규칙 11)',
    steps: [
      {
        promptEs: '¡Necesito ayuda urgente! ¿Puede llamar al 112, por favor?',
        promptKo: '위급 상황이라고 말하고, 스페인 응급번호(112) 신고를 요청합니다',
        options: [
          end('Sí, llamo ahora mismo', '지금 바로 불러드릴게요'),
          end('¿Dónde está exactamente?', '정확히 어디 계세요?'),
          end('Voy a quedarme con usted', '제가 옆에 있어드릴게요'),
        ],
      },
    ],
  },
  {
    id: 'A6',
    category: 'INJURY',
    titleKo: '물리치료사를 찾습니다',
    blockedReasonKo: '초안 작성됨 — 정형외과·스포츠의학 자문 검수 대기 중(규칙 11)',
    steps: [
      {
        promptEs: 'Hola, ¿sabe si hay un fisioterapeuta cerca? Me gustaría pedir una consulta, por favor.',
        promptKo: '근처에 물리치료사가 있는지 묻고, 진료 예약을 요청합니다',
        options: [
          end('Sí, hay uno en el pueblo', '네, 마을에 한 분 계세요'),
          end('No aquí, tiene que ir a otro pueblo', '여기는 없고 다른 마을로 가야 해요'),
          end('Le doy el teléfono', '전화번호를 드릴게요'),
        ],
      },
    ],
  },
  // A7만 규칙 11이 아니라 다른 이유로 여전히 보류한다 — 처치·추천이 아니라
  // 순례자 본인의 개인 건강정보(혈액형·알레르기·복용약·비상연락처)를 입력해
  // 응급 시 보여주는 카드라, 필요한 건 자문 검수가 아니라 로컬 저장 설계
  // 검토다(규칙 8 개정으로 개인기록 localStorage 자체는 허용됐지만, 입력폼·
  // 인쇄 대비 등 이 카드만의 UI가 아직 없다). 다른 7장과 성격이 달라 같이
  // 처리하지 않는다.
  {
    id: 'A7',
    category: 'INJURY',
    titleKo: '내 의료 정보',
    steps: [],
    blockedReasonKo: '개인 건강정보(혈액형·알레르기) 입력·표시 UI가 아직 없어 비워둡니다(규칙 11과 무관, 별도 설계 필요)',
  },
  {
    id: 'A8',
    category: 'INJURY',
    titleKo: '보험 청구용 서류가 필요합니다',
    blockedReasonKo: '초안 작성됨 — 정형외과·스포츠의학 자문 검수 대기 중(규칙 11)',
    steps: [
      {
        promptEs: 'Hola, ¿podría darme un justificante o informe por escrito, para mi seguro de viaje?',
        promptKo: '여행자보험 청구용으로 서면 확인서를 요청합니다',
        options: [
          end('Sí, se lo preparo', '네, 준비해 드릴게요'),
          end('Puede pedirlo en recepción', '접수처에서 요청하세요'),
          end('Tiene que volver mañana', '내일 다시 오셔야 해요'),
        ],
      },
    ],
  },

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
