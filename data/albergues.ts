// data/albergues.ts — 프랑스 길 82개 마을 알베르게(순례자 숙소), F-05·B "가장 중요" 항목
//
// ⚠️ 출처: Gronze.com 구간(etapa)별 페이지 33개 전수 조사(2026-07). 개인 실측
//   아님 — source: 'GUIDEBOOK'. 일반 호텔·펜션·까사루랄(Hostal/Hotel/Pensión/
//   Casa Rural/Apartamento)은 순례자 전용 알베르게가 아니라서 제외했다.
//   "일시 휴업" 명시된 곳도 제외했다(규칙 1 — 문 닫은 곳을 있는 것처럼 보이면 안 됨).
//
// ⚠️ 정말 중요 — 갈리시아는 Xunta 공립이지 지자체(municipal) 공립이 아니다
//   (CLAUDE.md "숙소 자주 틀림" 표). O 세브레이로부터 산티아고까지 마을의
//   공립 알베르게는 전부 XUNTA로 표시했다. 그 앞(나바라~레온)의 공립은 MUNICIPAL.
//
// ⚠️ priceEur는 도미토리 최저가(1인 기준) 하나만 남긴다. 개인실·조식포함가 등
//   여러 요금이 있으면 가장 기본적인 값만 쓴다 — 정밀 요금표가 아니라 예산
//   감을 잡기 위한 참고치다.
//
// ⚠️ beds(침대 수, F-02 혼잡 추정의 전제 데이터)는 2026-07 2차 조사(아래)에서
//   Gronze.com 개별 알베르게 상세 페이지(구간 요약 페이지가 아니라 알베르게 하나당
//   페이지, "Precios y plazas" 절)를 하나씩 찾아 도미토리별 침대 수를 합산해 채웠다.
//   283곳 중 281곳 확보(카스트로헤리스 Espacio Interior는 2026-08-03 재조사로
//   6개 확보, 아래 참고). 나머지 2곳은 방(habitación) 단위로만 표기돼 도미토리
//   합계를 못 낸 경우(카카벨로스 Saint James Way, 트라바델로 Camino y Leyenda)라
//   null로 남겼다 — 지어내지 않았다.
//   ⚠️ 조사 중 "도미토리 개수"와 "총 침대 수"를 혼동해 틀린 값을 넣을 뻔한 사례가
//   여러 건 있었다(예: 수비리 Río Arga Ibaia — 도미토리 3개를 침대 3개로 오독할 뻔함,
//   실제는 20개). 이상치로 보이는 값은 "Precios y plazas" 원문을 다시 확인해 고쳤다.
//
// ⚠️ reservation: 2026-07-29 3차 갱신(실제 완료분). MUNICIPAL/XUNTA/DONATIVO 44곳은
//   CLAUDE.md "숙소 자주 틀림" 표에 이미 있는 도메인 사실(이 세 유형은 "불가"라고
//   "대부분" 같은 단서 없이 명시돼 있다 — 지자체·Xunta 공립은 선착순, 도네이티보는
//   예약 자체가 구조상 없음)을 근거로 일괄 'NONE'을 채웠다. 개별 알베르게 하나하나를
//   다시 Gronze에서 재확인한 것은 아니다 — 정책이 바뀌면(규칙 2, 예: 성수기 예약 허용
//   논의) 이 값도 같이 갱신해야 한다.
//   PARISH·MONASTERY·PRIVATE 239곳은 "대부분 불가"로 일괄 적용하지 않고 Gronze
//   개별 알베르게 상세 페이지("Admite reserva" 필드 + 연락처 절)를 하나씩 조사했다.
//   239곳 중 235곳 확인 완료(PHONE 81 · WHATSAPP 5 · ONLINE 132 · NONE 17),
//   4곳은 당시 Gronze에 상세 페이지가 없거나("Admite reserva" 필드·연락 수단이
//   전혀 없어 판정 불가) 확인 못해 UNKNOWN으로 남겼었다.
//   판정 기준: Booking.com 등 온라인 예약 시스템 안내 → ONLINE. "por WhatsApp"
//   명시 → WHATSAPP. 전화·이메일·자체 홈페이지만 있고 온라인 예약 시스템이
//   확인 안 되면 → PHONE(보수적으로 판정, 실제로는 이메일도 가능할 수 있음).
//   "Admite reserva: No" 명시 → NONE. contact·openFrom/openTo·hasKitchen 등
//   나머지 세부 필드는 여전히 이번 조사 범위 밖 — UNKNOWN/null.
//
// ⚠️ 2026-08-03 재조사로 위 4곳 전부 NONE 확정(Gronze 외 alberguescaminosantiago.com·
//   caminodesantiago.consumer.es·caminomaps.org 등 복수 출처 교차 확인, 전부
//   "예약 불가/선착순" 일치):
//   - 벨로라도 Albergue parroquial de Belorado: "no admite reserva de plaza" 명시.
//   - 토산토스 Albergue parroquial San Francisco de Asís: 선착순 안내.
//   - 카스트로헤리스 Espacio Interior: 2024년 개업 신규 숙소라 Gronze에 상세
//     페이지가 없었던 것 — alberguescaminosantiago.com에서 예약 불가·정원
//     6명·1인 20유로 확인, beds·priceEur도 같이 갱신(기존 beds null→6,
//     priceEur 15→20).
//   - 엘 부르고 라네로 Albergue de peregrinos Domenico Laffi: 예약 불가 확인과
//     별개로 **type이 잘못돼 있었다** — 기존 PRIVATE였으나 caminomaps.org·
//     caminosantiago.org·caminodesantiagofrances.com 등 복수 출처가 전부
//     "Albergue Municipal"로 표기, León 카미노 친구회 소속 자원봉사 오스피탈레로가
//     운영. MUNICIPAL로 정정(CLAUDE.md "숙소 자주 틀림" 표가 경고하는 유형
//     오분류를 실제로 잡은 사례).
//
// 출처(이름·유형·요금, 1차): https://www.gronze.com/camino-frances (구간별 33개 페이지, 2026-07)
// 출처(beds, 2차): https://www.gronze.com 개별 알베르게 상세 페이지 280개 (2026-07)
// 출처(reservation, 3차): PARISH·MONASTERY·PRIVATE 235/239곳 확인 완료, https://www.gronze.com
//   개별 알베르게 상세 페이지 "Admite reserva"/연락처 절 (2026-07-29)
// 출처(reservation 나머지 4곳 + Castrojeriz beds/price + Burgo Ranero type 정정, 4차):
//   https://www.alberguescaminosantiago.com/ , https://caminodesantiago.consumer.es/ ,
//   https://caminomaps.org/ (2026-08-03)
import type { Albergue, AlbergueType, ReservationMethod } from '../lib/schema'

const CHECKED_AT = '2026-07'

const counters: Record<string, number> = {}
function a(
  townId: string,
  name: string,
  type: AlbergueType,
  priceEur: number | null,
  beds: number | null = null,
  reservation: ReservationMethod = 'UNKNOWN',
): Albergue {
  counters[townId] = (counters[townId] ?? 0) + 1
  return {
    id: `${townId}-${counters[townId]}`,
    townId,
    name,
    type,
    beds,
    priceEur,
    reservation,
    contact: null,
    openFrom: null,
    openTo: null,
    hasKitchen: null,
    hasLaundry: null,
    hasDryer: null,
    hasWifi: null,
    hasHeating: null,
    acceptsBagTransfer: null,
    wheelchairAccessible: null,
    verifiedAt: CHECKED_AT,
    source: 'GUIDEBOOK',
  }
}

export const albergues: Albergue[] = [
  // ── 생장피드포르 ──
  a('saint-jean-pied-de-port', 'Ospitalia Refuge Municipal', 'MUNICIPAL', 16, 34, 'NONE'),
  a('saint-jean-pied-de-port', 'Refuge Accueil Paroissial Kaserna', 'PARISH', 25, 14, 'PHONE'),
  a('saint-jean-pied-de-port', "Gîte d'étape Beilari", 'PRIVATE', 47, 14, 'PHONE'),
  a('saint-jean-pied-de-port', "Gîte L'Auberge du Pèlerin", 'PRIVATE', 24, 24, 'ONLINE'),
  a('saint-jean-pied-de-port', "Gîte Le Chemin vers l'Étoile", 'PRIVATE', 24, 48, 'ONLINE'),
  a('saint-jean-pied-de-port', 'Gîte Izaxulo', 'PRIVATE', 22, 18, 'ONLINE'),
  a('saint-jean-pied-de-port', 'Gîte Le Lièvre et la Tortue', 'PRIVATE', 24, 12, 'PHONE'),
  a('saint-jean-pied-de-port', 'Gîte Compostella', 'PRIVATE', 26, 14, 'ONLINE'),

  // ── 오리송 ──
  a('orisson', 'Refuge Orisson', 'PRIVATE', 45, 34, 'PHONE'),

  // ── 론세스바예스 ──
  a('roncesvalles', 'Albergue de peregrinos de Roncesvalles', 'PARISH', 15, 183, 'ONLINE'),

  // ── 수비리 ──
  a('zubiri', 'Albergue municipal de Zubiri', 'MUNICIPAL', 16, 72, 'NONE'),
  a('zubiri', 'Albergue-Pensión Zaldiko', 'PRIVATE', 15, 24, 'PHONE'),
  a('zubiri', 'Albergue El Palo de Avellano', 'PRIVATE', 19, 59, 'PHONE'),
  a('zubiri', 'Albergue Suseia', 'PRIVATE', 18, 6, 'ONLINE'),
  a('zubiri', 'Albergue Río Arga Ibaia', 'PRIVATE', 17, 20, 'PHONE'),
  a('zubiri', 'Albergue Segunda Etapa', 'PRIVATE', 16, 12, 'ONLINE'),

  // ── 라라소아냐 ──
  a('larrasoana', 'Albergue de peregrinos de Larrasoaña', 'MUNICIPAL', 15, 32, 'NONE'),
  a('larrasoana', 'Albergue San Nicolás', 'PRIVATE', 17, 38, 'ONLINE'),

  // ── 팜플로나 ──
  a('pamplona', 'Albergue Jesús y María', 'PRIVATE', 12, 112, 'PHONE'),
  a('pamplona', 'Albergue diocesano Betania', 'PARISH', null, 20, 'NONE'),
  a('pamplona', 'Albergue Casa Paderborn', 'PRIVATE', 9.5, 26, 'NONE'),
  a('pamplona', 'Albergue Casa Ibarrola', 'PRIVATE', 25, 20, 'ONLINE'),
  a('pamplona', 'Albergue de Pamplona-Iruñako Aterpea', 'PRIVATE', 19, 22, 'ONLINE'),
  a('pamplona', 'Albergue Plaza Catedral', 'PRIVATE', 17, 38, 'ONLINE'),

  // ── 시수르 메노르 ──
  a('cizur-menor', 'Albergue de peregrinos de la Orden de Malta', 'PARISH', 10, 27, 'NONE'),

  // ── 우테르가 ──
  a('uterga', 'Albergue Casa Baztán', 'PRIVATE', 16, 24, 'ONLINE'),

  // ── 오바노스 ──
  // (본문에 순수 알베르게 없음 — 호스탈/까사루랄만 확인됨, 제외)

  // ── 푸엔테 라 레이나 ──
  a('puente-la-reina', 'Albergue de los Padres Reparadores', 'PARISH', 9, 100, 'WHATSAPP'),
  a('puente-la-reina', 'Albergue Jakue', 'PRIVATE', 20, 30, 'ONLINE'),
  a('puente-la-reina', 'Albergue Puente', 'PRIVATE', 16, 30, 'ONLINE'),
  a('puente-la-reina', 'Albergue Estrella Guía', 'PRIVATE', 23, 12, 'ONLINE'),
  a('puente-la-reina', 'Albergue Gares', 'PRIVATE', 15, 16, 'ONLINE'),
  a('puente-la-reina', 'Albergue Santiago Apóstol - Camping El Real', 'PRIVATE', 15, 100, 'ONLINE'),

  // ── 시라우키 ──
  a('cirauqui', 'Albergue Cirauqui Casa Maralotx', 'PRIVATE', 19, 20, 'ONLINE'),

  // ── 비야투에르타 ──
  a('villatuerta', 'Albergue Etxeurdina', 'PRIVATE', 19, 8, 'PHONE'),

  // ── 에스테야 ──
  a('estella', 'Albergue de peregrinos de Estella', 'MUNICIPAL', 8, 78, 'NONE'),
  a('estella', 'Albergue Capuchinos Rocamador', 'MONASTERY', 15, 20, 'ONLINE'),
  a('estella', 'Albergue de la Asociación ANFAS', 'DONATIVO', 12, 24, 'NONE'),

  // ── 아예기 ──
  a('ayegui', 'Albergue Turístico San Cipriano', 'PRIVATE', 15, 42, 'ONLINE'),

  // ── 비야마요르 데 몬하르딘 ──
  a('villamayor-de-monjardin', 'Albergue Oasis Trails', 'PRIVATE', 12, 22, 'PHONE'),
  a('villamayor-de-monjardin', 'Albergue Villamayor de Monjardín', 'PRIVATE', 14, 20, 'PHONE'),

  // ── 로스 아르코스 ──
  a('los-arcos', 'Albergue de peregrinos Isaac Santiago', 'MUNICIPAL', 8, 70, 'NONE'),
  a('los-arcos', 'Albergue Casa Arqueña', 'PRIVATE', 18, 8, 'ONLINE'),
  a('los-arcos', 'Albergue Los Arcos', 'PRIVATE', 22, 18, 'ONLINE'),
  a('los-arcos', 'Albergue Casa Alberdi', 'PRIVATE', 15, 30, 'PHONE'),
  a('los-arcos', 'Albergue Casa de la Abuela', 'PRIVATE', 16, 20, 'PHONE'),
  a('los-arcos', 'Albergue La Fuente - Casa de Austria', 'PRIVATE', 12, 42, 'PHONE'),

  // ── 토레스 델 리오 ──
  a('torres-del-rio', 'Albergue-Hotel La Pata de Oca', 'PRIVATE', 12, 32, 'ONLINE'),
  a('torres-del-rio', 'Albergue Casa Mariela', 'PRIVATE', 14, 45, 'ONLINE'),
  a('torres-del-rio', 'Albergue-Hostal San Andrés', 'PRIVATE', 15, 20, 'ONLINE'),

  // ── 비아나 ──
  a('viana', 'Albergue de peregrinos Andrés Muñoz', 'MUNICIPAL', 9.5, 46, 'NONE'),
  a('viana', 'Albergue Izar', 'PRIVATE', 15, 38, 'PHONE'),

  // ── 로그로뇨 ──
  a('logrono', 'Albergue de peregrinos de Logroño', 'MUNICIPAL', 0, 68, 'NONE'),
  a('logrono', 'Albergue parroquial Santiago El Real', 'PARISH', 0, 30, 'NONE'),
  a('logrono', 'Albergue Albas', 'PRIVATE', 18, 26, 'ONLINE'),
  a('logrono', 'Albergue Santiago Apóstol', 'PRIVATE', 18, 68, 'ONLINE'),
  a('logrono', 'Albergue San Nicolás', 'PRIVATE', 20, 20, 'ONLINE'),

  // ── 나바레테 ──
  a('navarrete', 'Albergue de peregrinos de Navarrete', 'MUNICIPAL', 10, 17, 'NONE'),
  a('navarrete', 'Albergue El Cántaro', 'PRIVATE', 15, 18, 'PHONE'),
  a('navarrete', 'Albergue La Casa del Peregrino Ángel', 'PRIVATE', 10, 26, 'PHONE'),
  a('navarrete', 'Albergue La Iglesia', 'PRIVATE', 15, 14, 'ONLINE'),
  a('navarrete', 'Albergue El Refugio Navarrete', 'PRIVATE', 15, 35, 'ONLINE'),
  a('navarrete', 'Albergue Ikigai', 'PRIVATE', 12, 42, 'ONLINE'),

  // ── 벤토사 ──
  a('ventosa', 'Albergue San Saturnino', 'PRIVATE', 14, 42, 'ONLINE'),

  // ── 나헤라 ──
  a('najera', 'Albergue de peregrinos de Nájera', 'MUNICIPAL', 7, 48, 'NONE'),
  a('najera', 'Albergue Puerta de Nájera', 'PRIVATE', 15, 29, 'PHONE'),
  a('najera', 'Albergue Nido de Cigüeña', 'PRIVATE', 15, 15, 'PHONE'),
  a('najera', 'Albergue Las Peñas', 'PRIVATE', 15, 10, 'PHONE'),
  a('najera', 'Albergue El Peregrino Najerino', 'PRIVATE', 14, 28, 'WHATSAPP'),
  a('najera', 'Albergue Sancho III - La Judería', 'PRIVATE', 13, 16, 'PHONE'),

  // ── 아소프라 ──
  a('azofra', 'Albergue de peregrinos de Azofra', 'MUNICIPAL', 16, 60, 'NONE'),

  // ── 시루에냐 ──
  a('ciruena', 'Albergue Virgen de Guadalupe', 'PRIVATE', 20, 5, 'PHONE'),
  a('ciruena', 'Albergue Victoria', 'PRIVATE', 18, 10, 'ONLINE'),

  // ── 산토 도밍고 데 라 칼사다 ──
  a('santo-domingo-de-la-calzada', 'Albergue de peregrinos Cofradía del Santo', 'PARISH', 13, 164, 'PHONE'),
  a('santo-domingo-de-la-calzada', 'Albergue de peregrinos Abadía Cisterciense', 'MONASTERY', 13, 40, 'PHONE'),

  // ── 그라뇬 ──
  a('granon', 'Albergue parroquial San Juan Bautista', 'PARISH', null, 40, 'NONE'),
  a('granon', 'Albergue La Casa de las Sonrisas', 'PRIVATE', null, 15, 'PHONE'),

  // ── 레데시야 델 카미노 ──
  a('redecilla-del-camino', 'Albergue de peregrinos San Lázaro', 'MUNICIPAL', 7, 52, 'NONE'),
  a('redecilla-del-camino', 'Albergue Essentia', 'PRIVATE', 14, 10, 'PHONE'),

  // ── 벨로라도 ──
  a('belorado', 'Albergue parroquial de Belorado', 'PARISH', 10, 20, 'NONE'),
  a('belorado', 'Albergue Cuatro Cantones', 'PRIVATE', 15, 65, 'ONLINE'),
  a('belorado', 'Albergue-Pensión Caminante', 'PRIVATE', 6, 22, 'ONLINE'),
  a('belorado', 'Albergue A Santiago', 'PRIVATE', 14, 98, 'ONLINE'),

  // ── 토산토스 ──
  a('tosantos', 'Albergue parroquial San Francisco de Asís', 'PARISH', 0, 30, 'NONE'),

  // ── 비야프랑카 몬테스 데 오카 ──
  a('villafranca-montes-de-oca', 'Albergue San Antón Abad', 'PRIVATE', 15, 49, 'PHONE'),

  // ── 산 후안 데 오르테가 ──
  a('san-juan-de-ortega', 'Albergue parroquial de San Juan de Ortega', 'PARISH', 15, 30, 'NONE'),
  a('san-juan-de-ortega', 'Alojamiento El Descanso de San Juan', 'PRIVATE', 15, 7, 'PHONE'),
  a('san-juan-de-ortega', 'Albergue La Cuadra de Luisito', 'PRIVATE', 15, 22, 'PHONE'),

  // ── 아헤스 ──
  a('ages', 'Albergue municipal de Agés', 'MUNICIPAL', 15, 36, 'NONE'),
  a('ages', 'Albergue Fagus', 'PRIVATE', 16, 22, 'NONE'),

  // ── 아타푸에르카 ──
  a('atapuerca', 'Albergue-Habitaciones El Peregrino', 'PRIVATE', 14, 30, 'NONE'),
  a('atapuerca', 'Hostel La Plazuela Verde', 'PRIVATE', 15, 16, 'ONLINE'),
  a('atapuerca', 'Hostel Atapuerca INpulso', 'PRIVATE', 20, 13, 'ONLINE'),

  // ── 부르고스 ──
  a('burgos', 'Albergue de peregrinos Casa del Cubo y de los Lerma', 'MUNICIPAL', 10, 120, 'NONE'),
  a('burgos', 'Albergue Santiago y Santa Catalina', 'PARISH', 11, 16, 'NONE'),

  // ── 타르다호스 ──
  a('tardajos', 'Albergue de peregrinos de Tardajos', 'MUNICIPAL', 0, 18, 'NONE'),
  a('tardajos', 'Albergue La Fábrica', 'PRIVATE', 13, 14, 'ONLINE'),

  // ── 오르니요스 델 카미노 ──
  a('hornillos-del-camino', 'Albergue de peregrinos de Hornillos del Camino', 'MUNICIPAL', 15, 30, 'NONE'),
  a('hornillos-del-camino', 'Albergue El Alfar de Rosalía', 'PRIVATE', 15, 24, 'ONLINE'),
  a('hornillos-del-camino', 'Albergue Hornillos Meeting Point', 'PRIVATE', 15, 32, 'ONLINE'),

  // ── 온타나스 ──
  a('hontanas', 'Albergue de peregrinos Antiguo Hospital de San Juan', 'PARISH', 14, 42, 'PHONE'),
  a('hontanas', 'Albergue El Puntido', 'PRIVATE', 15, 40, 'ONLINE'),
  a('hontanas', 'Albergue Santa Brígida', 'PRIVATE', 15, 42, 'ONLINE'),

  // ── 카스트로헤리스 ──
  a('castrojeriz', 'Albergue de peregrinos San Esteban', 'MUNICIPAL', 9, 35, 'NONE'),
  a('castrojeriz', 'Albergue Ultreia', 'PRIVATE', 16, 26, 'PHONE'),
  a('castrojeriz', 'Albergue Rosalía', 'PRIVATE', 15, 30, 'ONLINE'),
  a('castrojeriz', 'Albergue Orión', 'PRIVATE', 15, 22, 'ONLINE'),
  a('castrojeriz', 'Albergue-Hotel A Cien Leguas', 'PRIVATE', 17, 24, 'ONLINE'),
  a('castrojeriz', 'Albergue La Rinconada', 'PRIVATE', 14, 18, 'ONLINE'),
  a('castrojeriz', 'Albergue Casa Nostra', 'PRIVATE', 14, 26, 'ONLINE'),
  a('castrojeriz', 'Albergue Espacio Interior', 'PRIVATE', 20, 6, 'NONE'),

  // ── 보아디야 델 카미노 ──
  a('boadilla-del-camino', 'Albergue En el Camino', 'PRIVATE', 15, 70, 'PHONE'),
  a('boadilla-del-camino', 'Juntos Albergue de Peregrinos', 'PRIVATE', 18, 10, 'PHONE'),

  // ── 프로미스타 ──
  a('fromista', 'Albergue de peregrinos de Frómista', 'MUNICIPAL', 15, 56, 'NONE'),
  a('fromista', 'Albergue Estrella del Camino', 'PRIVATE', 15, 32, 'ONLINE'),
  a('fromista', 'Acogida de invierno Betania', 'PARISH', null, 7, 'PHONE'),
  a('fromista', 'Albergue Luz de Frómista', 'PRIVATE', 15, 31, 'PHONE'),

  // ── 포블라시온 데 캄포스 ──
  a('poblacion-de-campos', 'Albergue de peregrinos de Población de Campos', 'MUNICIPAL', 13, 18, 'NONE'),

  // ── 비얄카사르 데 시르가 ──
  a('villalcazar-de-sirga', 'Albergue de peregrinos Casa del Peregrino', 'PARISH', 10, 20, 'PHONE'),
  a('villalcazar-de-sirga', 'Albergue Don Camino', 'PRIVATE', 16, 26, 'ONLINE'),

  // ── 카리온 데 로스 콘데스 ──
  a('carrion-de-los-condes', 'Albergue parroquial Santa María', 'PARISH', 10, 50, 'NONE'),
  a('carrion-de-los-condes', 'Albergue-Hospedería del Convento de Santa Clara', 'MONASTERY', 10, 28, 'PHONE'),
  a('carrion-de-los-condes', 'Albergue Espíritu Santo', 'PRIVATE', 10, 96, 'NONE'),

  // ── 칼사딜야 데 라 쿠에사 ──
  a('calzadilla-de-la-cueza', 'Albergue de peregrinos de Calzadilla de la Cueza', 'MUNICIPAL', 15, 34, 'NONE'),
  a('calzadilla-de-la-cueza', 'Albergue Los Canarios', 'PRIVATE', 18, 11, 'ONLINE'),
  a('calzadilla-de-la-cueza', 'Albergue Camino Real', 'PRIVATE', 14, 30, 'WHATSAPP'),

  // ── 테라디요스 데 로스 템플라리오스 ──
  a('terradillos-de-los-templarios', 'Albergue Jacques de Molay', 'PRIVATE', 15, 50, 'PHONE'),
  a('terradillos-de-los-templarios', 'Albergue Los Templarios', 'PRIVATE', 17, 46, 'PHONE'),

  // ── 사아군 ──
  a('sahagun', 'Albergue de peregrinos Cluny', 'PARISH', 9, 64, 'PHONE'),
  a('sahagun', 'Albergue de peregrinos de la Santa Cruz', 'PARISH', 10, 58, 'WHATSAPP'),

  // ── 베르시아노스 델 레알 카미노 ──
  a('bercianos-del-real-camino', 'Albergue parroquial Casa Rectoral', 'PARISH', 0, 5, 'PHONE'),
  a('bercianos-del-real-camino', 'Albergue Bercianos 1900', 'PRIVATE', 18, 20, 'ONLINE'),
  a('bercianos-del-real-camino', 'Albergue La Perala', 'PRIVATE', 18, 29, 'PHONE'),
  a('bercianos-del-real-camino', 'Albergue Santa Clara', 'PRIVATE', 15, 10, 'PHONE'),

  // ── 엘 부르고 라네로 ──
  a('el-burgo-ranero', 'Albergue de peregrinos Domenico Laffi', 'MUNICIPAL', null, 30, 'NONE'),
  a('el-burgo-ranero', 'Albergue La Laguna', 'PRIVATE', 18, 20, 'PHONE'),

  // ── 렐리에고스 ──
  a('reliegos', 'Albergue municipal de peregrinos de Reliegos - Don Gaiferos', 'MUNICIPAL', null, 44, 'NONE'),
  a('reliegos', 'Albergue La Parada', 'PRIVATE', 14, 36, 'PHONE'),
  a('reliegos', 'Albergue Gil', 'PRIVATE', 15, 14, 'PHONE'),
  a('reliegos', 'Albergue Vive tu Camino', 'PRIVATE', 13, 20, 'ONLINE'),
  a('reliegos', 'Albergue Las Hadas', 'PRIVATE', 16, 20, 'ONLINE'),

  // ── 만시야 데 라스 물라스 ──
  a('mansilla-de-las-mulas', 'Albergue de peregrinos de Mansilla de las Mulas', 'MUNICIPAL', 7, 28, 'NONE'),
  a('mansilla-de-las-mulas', 'Albergue Gaia', 'PRIVATE', 14, 16, 'PHONE'),
  a('mansilla-de-las-mulas', 'Albergue El Jardín del Camino', 'PRIVATE', 15, 44, 'PHONE'),
  a('mansilla-de-las-mulas', 'Albergue La Pingüina', 'PRIVATE', 28, 12, 'ONLINE'),

  // ── 레온 ──
  a('leon', 'Albergue del convento de las Carbajalas', 'MONASTERY', null, 85, 'NONE'),
  a('leon', 'Albergue-Residencia San Francisco de Asís', 'PRIVATE', 12, 70, 'ONLINE'),
  a('leon', 'Albergue Santo Tomás de Canterbury', 'PRIVATE', 12, 48, 'ONLINE'),
  a('leon', 'Albergue Check in León', 'PRIVATE', 12, 40, 'ONLINE'),
  a('leon', 'Albergue Muralla Leonesa', 'PRIVATE', 16, 60, 'ONLINE'),

  // ── 비야당고스 델 파라모 ──
  a('villadangos-del-paramo', 'Albergue de peregrinos de Villadangos del Páramo', 'MUNICIPAL', null, 48, 'NONE'),
  a('villadangos-del-paramo', 'Albergue La Santa Siesta', 'PRIVATE', 18, 26, 'ONLINE'),

  // ── 산 마르틴 델 카미노 ──
  a('san-martin-del-camino', 'Albergue de peregrinos de San Martín del Camino', 'MUNICIPAL', 10, 46, 'NONE'),
  a('san-martin-del-camino', 'Albergue Santa Ana', 'PRIVATE', 10, 40, 'ONLINE'),
  a('san-martin-del-camino', 'Albergue La Casa Verde', 'PRIVATE', 14, 8, 'ONLINE'),
  a('san-martin-del-camino', 'Albergue La Huella', 'PRIVATE', 18, 24, 'ONLINE'),
  a('san-martin-del-camino', 'Albergue Vieira', 'PRIVATE', 12, 34, 'PHONE'),

  // ── 오스피탈 데 오르비고 ──
  a('hospital-de-orbigo', 'Albergue parroquial Karl Leisner', 'PARISH', 12, 62, 'NONE'),
  a('hospital-de-orbigo', 'Albergue DORMERO San Miguel', 'PRIVATE', 16, 34, 'ONLINE'),
  a('hospital-de-orbigo', 'Albergue Verde', 'PRIVATE', 20, 26, 'PHONE'),
  a('hospital-de-orbigo', 'Albergue La Encina', 'PRIVATE', 17, 16, 'ONLINE'),
  a('hospital-de-orbigo', 'Albergue DORMERO Hidalgos', 'PRIVATE', 17, 18, 'ONLINE'),

  // ── 산티바녜스 데 발데이글레시아스 ──
  a('santibanez-de-valdeiglesias', 'Albergue parroquial de Santibáñez de Valdeiglesias', 'PARISH', 15, 20, 'PHONE'),
  a('santibanez-de-valdeiglesias', 'Albergue Camino Francés', 'PRIVATE', 16, 20, 'PHONE'),

  // ── 아스토르가 ──
  a('astorga', 'Albergue de peregrinos Siervas de María', 'MUNICIPAL', 8, 156, 'NONE'),
  a('astorga', 'Albergue franciscano Santa María de los Ángeles', 'MONASTERY', 10, 30, 'WHATSAPP'),
  a('astorga', 'Albergue San Javier', 'PRIVATE', 12, 110, 'ONLINE'),
  a('astorga', 'Albergue MyWay', 'PRIVATE', 15, 13, 'ONLINE'),

  // ── 라바날 델 카미노 ──
  a('rabanal-del-camino', 'Refugio Gaucelmo', 'DONATIVO', 0, 36, 'NONE'),
  a('rabanal-del-camino', 'Albergue Nuestra Señora del Pilar', 'PRIVATE', 10, 76, 'PHONE'),
  a('rabanal-del-camino', 'Albergue La Senda', 'PRIVATE', 15, 24, 'ONLINE'),

  // ── 폰세바돈 ──
  a('foncebadon', 'Albergue parroquial Domus Dei', 'PARISH', 0, 18, 'NONE'),
  a('foncebadon', 'Albergue Monte Irago', 'PRIVATE', 14, 22, 'PHONE'),
  a('foncebadon', 'Albergue El Convento de Foncebadón', 'PRIVATE', 16, 24, 'PHONE'),
  a('foncebadon', 'Albergue La Posada del Druida', 'PRIVATE', 17, 20, 'PHONE'),
  a('foncebadon', 'Albergue La Cruz de Fierro', 'PRIVATE', 15, 34, 'PHONE'),
  a('foncebadon', 'Albergue Casa Chelo', 'PRIVATE', 20, 10, 'PHONE'),

  // ── 엘 아세보 ──
  a('el-acebo', 'Albergue parroquial Apóstol Santiago', 'PARISH', 0, 22, 'NONE'),
  a('el-acebo', 'Albergue Mesón El Acebo', 'PRIVATE', 12, 16, 'PHONE'),
  a('el-acebo', 'Albergue La Casa del Peregrino', 'PRIVATE', 14, 80, 'ONLINE'),

  // ── 몰리나세카 ──
  a('molinaseca', 'Albergue Compostela', 'PRIVATE', 14, 32, 'ONLINE'),
  a('molinaseca', 'Albergue Santa Marina', 'PRIVATE', 12, 38, 'ONLINE'),
  a('molinaseca', 'Albergue Señor Oso', 'PRIVATE', 14, 16, 'ONLINE'),

  // ── 폰페라다 ──
  a('ponferrada', 'Albergue parroquial San Nicolás de Flüe', 'PARISH', 0, 186, 'NONE'),
  a('ponferrada', 'Albergue Alea', 'PRIVATE', 15, 18, 'PHONE'),
  a('ponferrada', 'Albergue Guiana', 'PRIVATE', 16, 72, 'ONLINE'),
  a('ponferrada', 'Albergue Alda Pilgrim Ponferrada', 'PRIVATE', 14, 40, 'ONLINE'),
  a('ponferrada', 'Albergue El Templarín', 'PRIVATE', 15, 24, 'ONLINE'),

  // ── 카카벨로스 ──
  a('cacabelos', 'Albergue de peregrinos de Cacabelos', 'MUNICIPAL', null, 60, 'NONE'),
  a('cacabelos', 'Albergue-Hostal La Gallega', 'PRIVATE', 19, 29, 'ONLINE'),
  a('cacabelos', 'Albergue-Hostal Saint James Way', 'PRIVATE', 22, null, 'ONLINE'),

  // ── 비야프랑카 델 비에르소 ──
  a('villafranca-del-bierzo', 'Albergue de peregrinos de Villafranca del Bierzo', 'MUNICIPAL', 10, 60, 'NONE'),
  a('villafranca-del-bierzo', 'Albergue Ave Fénix', 'PRIVATE', 10, 80, 'PHONE'),
  a('villafranca-del-bierzo', 'Albergue de la Piedra', 'PRIVATE', 15, 15, 'ONLINE'),
  a('villafranca-del-bierzo', 'Albergue Leo', 'PRIVATE', 15, 7, 'PHONE'),
  a('villafranca-del-bierzo', 'Albergue-Hospedería Viña Femita', 'PRIVATE', 17, 20, 'ONLINE'),
  a('villafranca-del-bierzo', 'Albergue-Hospedería San Nicolás el Real', 'PRIVATE', 13, 75, 'PHONE'),

  // ── 트라바델로 ──
  a('trabadelo', 'Albergue municipal de Trabadelo', 'MUNICIPAL', 10, 18, 'NONE'),
  a('trabadelo', 'Albergue parroquial de Trabadelo', 'PARISH', 10, 22, 'PHONE'),
  a('trabadelo', 'Albergue Crispeta', 'PRIVATE', 12, 32, 'PHONE'),
  a('trabadelo', 'Albergue Camino y Leyenda', 'PRIVATE', 18, null, 'ONLINE'),
  a('trabadelo', 'Albergue Casa Susi', 'PRIVATE', 15, 10, 'PHONE'),

  // ── 라 파바 ──
  a('la-faba', 'Albergue de La Faba', 'DONATIVO', 8, 52, 'NONE'),
  a('la-faba', 'Albergue El Rincón del Bierzo', 'PRIVATE', 13.5, 11, 'PHONE'),

  // ── 오 세브레이로 (갈리시아 — Xunta) ──
  a('o-cebreiro', 'Albergue de peregrinos de O Cebreiro', 'XUNTA', 10, 104, 'NONE'),
  a('o-cebreiro', 'Albergue Casa Campelo', 'PRIVATE', 15, 10, 'PHONE'),

  // ── 폰프리아 (갈리시아) ──
  a('fonfria', 'Albergue-Pensión A Reboleira', 'PRIVATE', 14, 50, 'ONLINE'),

  // ── 트리아카스텔라 (갈리시아) ──
  a('triacastela', 'Albergue de peregrinos de Triacastela', 'XUNTA', 10, 14, 'NONE'),
  a('triacastela', 'Albergue Aitzenea', 'PRIVATE', 13, 38, 'PHONE'),
  a('triacastela', 'Albergue Berce do Camiño', 'PRIVATE', 15, 27, 'ONLINE'),
  a('triacastela', 'Albergue Refugio del Oribio', 'PRIVATE', 13, 27, 'PHONE'),
  a('triacastela', 'Albergue-Pensión Complexo Xacobeo', 'PRIVATE', 15, 36, 'ONLINE'),
  a('triacastela', 'Albergue A Horta de Abel', 'PRIVATE', 12, 14, 'ONLINE'),
  a('triacastela', 'Albergue Atrio', 'PRIVATE', 14, 20, 'ONLINE'),

  // ── 사리아 (갈리시아) ──
  a('sarria', 'Albergue de peregrinos de Sarria', 'XUNTA', 10, 40, 'NONE'),
  a('sarria', 'Albergue Monasterio de la Magdalena', 'MONASTERY', 12, 110, 'ONLINE'),
  a('sarria', 'Albergue-Pensión Don Álvaro', 'PRIVATE', 15, 40, 'ONLINE'),
  a('sarria', 'Albergue O Durmiñento', 'PRIVATE', 12, 38, 'ONLINE'),
  a('sarria', 'Albergue Los Blasones', 'PRIVATE', 11, 42, 'ONLINE'),
  a('sarria', 'Albergue San Lázaro', 'PRIVATE', 13, 27, 'ONLINE'),
  a('sarria', 'Albergue Casa Peltre', 'PRIVATE', 13, 22, 'ONLINE'),
  a('sarria', 'Albergue Mayor', 'PRIVATE', 13, 16, 'ONLINE'),

  // ── 바르바델로 (갈리시아) ──
  a('barbadelo', 'Albergue-Pensión Casa Barbadelo', 'PRIVATE', 14, 48, 'ONLINE'),
  a('barbadelo', 'Albergue A Casa de Carmen', 'PRIVATE', 16, 20, 'ONLINE'),
  a('barbadelo', 'Albergue O Pombal', 'PRIVATE', 15, 12, 'ONLINE'),

  // ── 페레이로스 (갈리시아 — Xunta) ──
  a('ferreiros', 'Albergue de peregrinos de Ferreiros', 'XUNTA', 10, 20, 'NONE'),
  a('ferreiros', 'Albergue Casa Cruceiro de Ferreiros', 'PRIVATE', 16, 24, 'PHONE'),

  // ── 포르토마린 (갈리시아 — Xunta) ──
  a('portomarin', 'Albergue de peregrinos de Portomarín', 'XUNTA', 10, 86, 'NONE'),
  a('portomarin', 'Albergue Ferramenteiro', 'PRIVATE', 15, 130, 'ONLINE'),
  a('portomarin', 'Albergue-Pensión PortoSantiago', 'PRIVATE', 15, 7, 'ONLINE'),
  a('portomarin', 'Albergue-Pensión Ultreia', 'PRIVATE', 16, 14, 'ONLINE'),
  a('portomarin', 'Albergue Casa Cruz', 'PRIVATE', 15, 16, 'PHONE'),
  a('portomarin', 'Albergue-Pensión Manuel', 'PRIVATE', 16, 16, 'PHONE'),
  a('portomarin', 'Albergue Casa do Marabillas', 'PRIVATE', 17, 16, 'ONLINE'),
  a('portomarin', 'Albergue-Pensión Pons Minea', 'PRIVATE', 16, 24, 'ONLINE'),

  // ── 곤사르 (갈리시아 — Xunta) ──
  a('gonzar', 'Albergue de peregrinos de Gonzar', 'XUNTA', 10, 28, 'NONE'),
  a('gonzar', 'Albergue-Hostería de Gonzar', 'PRIVATE', 15, 20, 'ONLINE'),

  // ── 벤타스 데 나론 (갈리시아) ──
  a('ventas-de-naron', 'Albergue Casa Molar', 'PRIVATE', 15, 18, 'PHONE'),
  a('ventas-de-naron', 'Albergue-Pensión O Cruceiro', 'PRIVATE', 15, 26, 'ONLINE'),

  // ── 팔라스 데 레이 (갈리시아 — Xunta) ──
  a('palas-de-rei', 'Albergue de peregrinos Os Chacotes', 'XUNTA', 10, 112, 'NONE'),
  a('palas-de-rei', 'Albergue de peregrinos de Palas de Rei', 'XUNTA', 10, 24, 'NONE'),
  a('palas-de-rei', 'Albergue San Marcos', 'PRIVATE', 15, 10, 'ONLINE'),
  a('palas-de-rei', 'Albergue Outeiro', 'PRIVATE', 16, 64, 'ONLINE'),
  a('palas-de-rei', 'Albergue Buen Camino', 'PRIVATE', 15, 35, 'PHONE'),
  a('palas-de-rei', 'Albergue Mesón de Benito', 'PRIVATE', 15, 78, 'PHONE'),
  a('palas-de-rei', 'Albergue Castro', 'PRIVATE', 14, 60, 'PHONE'),
  a('palas-de-rei', 'Albergue A Casiña di Marcello', 'PRIVATE', 17, 17, 'ONLINE'),

  // ── 멜리데 (갈리시아 — Xunta) ──
  a('melide', 'Albergue de peregrinos de Melide', 'XUNTA', 10, 140, 'NONE'),
  a('melide', 'Albergue O Apalpador', 'PRIVATE', 13, 10, 'ONLINE'),
  a('melide', 'Albergue O Cruceiro', 'PRIVATE', 13, 88, 'PHONE'),
  a('melide', 'Albergue Pereiro', 'PRIVATE', 13, 40, 'ONLINE'),
  a('melide', 'Albergue Melide', 'PRIVATE', 15, 49, 'ONLINE'),
  a('melide', 'Albergue San Antón', 'PRIVATE', 15, 28, 'ONLINE'),
  a('melide', 'Albergue Alfonso II El Casto', 'PRIVATE', 15, 34, 'ONLINE'),
  a('melide', 'Albergue Arraigos', 'PRIVATE', 15, 20, 'ONLINE'),

  // ── 리바디소 (갈리시아 — Xunta) ──
  a('ribadiso', 'Albergue de peregrinos de Ribadiso de Baixo', 'XUNTA', 10, 60, 'NONE'),
  a('ribadiso', 'Albergue-Pensión Los Caminantes I', 'PRIVATE', 13, 68, 'ONLINE'),
  a('ribadiso', 'Albergue Milpés', 'PRIVATE', 15, 25, 'ONLINE'),
  a('ribadiso', 'Albergue Miraiso', 'PRIVATE', 15, 12, 'ONLINE'),

  // ── 아르수아 (갈리시아 — Xunta) ──
  a('arzua', 'Albergue de peregrinos de Arzúa', 'XUNTA', 10, 56, 'NONE'),
  a('arzua', 'Albergue de Camino', 'PRIVATE', 16, 46, 'ONLINE'),
  a('arzua', 'Albergue Don Quijote', 'PRIVATE', 16, 50, 'ONLINE'),
  a('arzua', 'Albergue Vía Láctea', 'PRIVATE', 16, 130, 'ONLINE'),
  a('arzua', 'Albergue Ultreia', 'PRIVATE', 16, 28, 'ONLINE'),
  a('arzua', 'Albergue Santiago Apóstol', 'PRIVATE', 16, 92, 'PHONE'),
  a('arzua', 'Albergue Los Caminantes II', 'PRIVATE', 14, 26, 'ONLINE'),

  // ── 살세다 (갈리시아) ──
  a('salceda', 'Albergue-Hotel Rural Salceda', 'PRIVATE', 18, 8, 'ONLINE'),
  a('salceda', 'Albergue-Pensión Alborada', 'PRIVATE', 18, 10, 'ONLINE'),
  a('salceda', 'Albergue La Corona', 'PRIVATE', 18, 6, 'ONLINE'),

  // ── 오 페드로우소 (갈리시아 — Xunta) ──
  a('o-pedrouzo', 'Albergue de peregrinos de Arca - O Pino', 'XUNTA', 10, 150, 'NONE'),
  a('o-pedrouzo', 'Albergue Mirador de Pedrouzo', 'PRIVATE', 15, 62, 'ONLINE'),
  a('o-pedrouzo', 'Albergue Otero', 'PRIVATE', 14, 34, 'PHONE'),
  a('o-pedrouzo', 'Albergue O Trisquel', 'PRIVATE', 14, 78, 'ONLINE'),
  a('o-pedrouzo', 'Albergue Porta de Santiago', 'PRIVATE', 14, 54, 'NONE'),

  // ── 몬테 도 고소 (갈리시아 — Xunta) ──
  a('monte-do-gozo', 'Albergue de peregrinos del Monte do Gozo', 'XUNTA', 10, 500, 'NONE'),
  a('monte-do-gozo', 'Albergue Monte do Gozo', 'PRIVATE', 14, 620, 'ONLINE'),

  // ── 산티아고 데 콤포스텔라 ──
  a('santiago-de-compostela', 'Residencia de peregrinos San Lázaro', 'MUNICIPAL', 10, 80, 'NONE'),
  a('santiago-de-compostela', 'Albergue Seminario Menor', 'PARISH', 20, 169, 'ONLINE'),
  a('santiago-de-compostela', 'Albergue parroquial Fin del Camino', 'PARISH', 16, 112, 'PHONE'),
  a('santiago-de-compostela', 'Albergue Mundoalbergue', 'PRIVATE', 22, 34, 'ONLINE'),
  a('santiago-de-compostela', 'Albergue The Last Stamp', 'PRIVATE', 22, 62, 'ONLINE'),
  a('santiago-de-compostela', 'Albergue La Estación', 'PRIVATE', 20, 30, 'ONLINE'),
  a('santiago-de-compostela', 'Albergue Porta Real', 'PRIVATE', 21, 20, 'ONLINE'),
  a('santiago-de-compostela', 'Albergue Azabache', 'PRIVATE', 20, 20, 'ONLINE'),
]
