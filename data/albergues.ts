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
//   283곳 중 280곳 확보, 3곳은 상세 페이지가 없거나(카스트로헤리스 Espacio Interior)
//   방(habitación) 단위로만 표기돼 도미토리 합계를 못 낸 경우(카카벨로스 Saint James
//   Way, 트라바델로 Camino y Leyenda)라 null로 남겼다 — 지어내지 않았다.
//   ⚠️ 조사 중 "도미토리 개수"와 "총 침대 수"를 혼동해 틀린 값을 넣을 뻔한 사례가
//   여러 건 있었다(예: 수비리 Río Arga Ibaia — 도미토리 3개를 침대 3개로 오독할 뻔함,
//   실제는 20개). 이상치로 보이는 값은 "Precios y plazas" 원문을 다시 확인해 고쳤다.
//
// ⚠️ reservation·contact·openFrom/openTo·hasKitchen 등 세부 필드는 이번 조사
//   범위 밖이라 전부 UNKNOWN/null이다. 이것도 "확인 안 됨"이지 "없음"이 아니다.
//
// 출처(이름·유형·요금, 1차): https://www.gronze.com/camino-frances (구간별 33개 페이지, 2026-07)
// 출처(beds, 2차): https://www.gronze.com 개별 알베르게 상세 페이지 280개 (2026-07)
import type { Albergue, AlbergueType } from '../lib/schema'

const CHECKED_AT = '2026-07'

const counters: Record<string, number> = {}
function a(townId: string, name: string, type: AlbergueType, priceEur: number | null, beds: number | null = null): Albergue {
  counters[townId] = (counters[townId] ?? 0) + 1
  return {
    id: `${townId}-${counters[townId]}`,
    townId,
    name,
    type,
    beds,
    priceEur,
    reservation: 'UNKNOWN',
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
  a('saint-jean-pied-de-port', 'Ospitalia Refuge Municipal', 'MUNICIPAL', 16, 34),
  a('saint-jean-pied-de-port', 'Refuge Accueil Paroissial Kaserna', 'PARISH', 25, 14),
  a('saint-jean-pied-de-port', "Gîte d'étape Beilari", 'PRIVATE', 47, 14),
  a('saint-jean-pied-de-port', "Gîte L'Auberge du Pèlerin", 'PRIVATE', 24, 24),
  a('saint-jean-pied-de-port', "Gîte Le Chemin vers l'Étoile", 'PRIVATE', 24, 48),
  a('saint-jean-pied-de-port', 'Gîte Izaxulo', 'PRIVATE', 22, 18),
  a('saint-jean-pied-de-port', 'Gîte Le Lièvre et la Tortue', 'PRIVATE', 24, 12),
  a('saint-jean-pied-de-port', 'Gîte Compostella', 'PRIVATE', 26, 14),

  // ── 오리송 ──
  a('orisson', 'Refuge Orisson', 'PRIVATE', 45, 34),

  // ── 론세스바예스 ──
  a('roncesvalles', 'Albergue de peregrinos de Roncesvalles', 'PARISH', 15, 183),

  // ── 수비리 ──
  a('zubiri', 'Albergue municipal de Zubiri', 'MUNICIPAL', 16, 72),
  a('zubiri', 'Albergue-Pensión Zaldiko', 'PRIVATE', 15, 24),
  a('zubiri', 'Albergue El Palo de Avellano', 'PRIVATE', 19, 59),
  a('zubiri', 'Albergue Suseia', 'PRIVATE', 18, 6),
  a('zubiri', 'Albergue Río Arga Ibaia', 'PRIVATE', 17, 20),
  a('zubiri', 'Albergue Segunda Etapa', 'PRIVATE', 16, 12),

  // ── 라라소아냐 ──
  a('larrasoana', 'Albergue de peregrinos de Larrasoaña', 'MUNICIPAL', 15, 32),
  a('larrasoana', 'Albergue San Nicolás', 'PRIVATE', 17, 38),

  // ── 팜플로나 ──
  a('pamplona', 'Albergue Jesús y María', 'PRIVATE', 12, 112),
  a('pamplona', 'Albergue diocesano Betania', 'PARISH', null, 20),
  a('pamplona', 'Albergue Casa Paderborn', 'PRIVATE', 9.5, 26),
  a('pamplona', 'Albergue Casa Ibarrola', 'PRIVATE', 25, 20),
  a('pamplona', 'Albergue de Pamplona-Iruñako Aterpea', 'PRIVATE', 19, 22),
  a('pamplona', 'Albergue Plaza Catedral', 'PRIVATE', 17, 38),

  // ── 시수르 메노르 ──
  a('cizur-menor', 'Albergue de peregrinos de la Orden de Malta', 'PARISH', 10, 27),

  // ── 우테르가 ──
  a('uterga', 'Albergue Casa Baztán', 'PRIVATE', 16, 24),

  // ── 오바노스 ──
  // (본문에 순수 알베르게 없음 — 호스탈/까사루랄만 확인됨, 제외)

  // ── 푸엔테 라 레이나 ──
  a('puente-la-reina', 'Albergue de los Padres Reparadores', 'PARISH', 9, 100),
  a('puente-la-reina', 'Albergue Jakue', 'PRIVATE', 20, 30),
  a('puente-la-reina', 'Albergue Puente', 'PRIVATE', 16, 30),
  a('puente-la-reina', 'Albergue Estrella Guía', 'PRIVATE', 23, 12),
  a('puente-la-reina', 'Albergue Gares', 'PRIVATE', 15, 16),
  a('puente-la-reina', 'Albergue Santiago Apóstol - Camping El Real', 'PRIVATE', 15, 100),

  // ── 시라우키 ──
  a('cirauqui', 'Albergue Cirauqui Casa Maralotx', 'PRIVATE', 19, 20),

  // ── 비야투에르타 ──
  a('villatuerta', 'Albergue Etxeurdina', 'PRIVATE', 19, 8),

  // ── 에스테야 ──
  a('estella', 'Albergue de peregrinos de Estella', 'MUNICIPAL', 8, 78),
  a('estella', 'Albergue Capuchinos Rocamador', 'MONASTERY', 15, 20),
  a('estella', 'Albergue de la Asociación ANFAS', 'DONATIVO', 12, 24),

  // ── 아예기 ──
  a('ayegui', 'Albergue Turístico San Cipriano', 'PRIVATE', 15, 42),

  // ── 비야마요르 데 몬하르딘 ──
  a('villamayor-de-monjardin', 'Albergue Oasis Trails', 'PRIVATE', 12, 22),
  a('villamayor-de-monjardin', 'Albergue Villamayor de Monjardín', 'PRIVATE', 14, 20),

  // ── 로스 아르코스 ──
  a('los-arcos', 'Albergue de peregrinos Isaac Santiago', 'MUNICIPAL', 8, 70),
  a('los-arcos', 'Albergue Casa Arqueña', 'PRIVATE', 18, 8),
  a('los-arcos', 'Albergue Los Arcos', 'PRIVATE', 22, 18),
  a('los-arcos', 'Albergue Casa Alberdi', 'PRIVATE', 15, 30),
  a('los-arcos', 'Albergue Casa de la Abuela', 'PRIVATE', 16, 20),
  a('los-arcos', 'Albergue La Fuente - Casa de Austria', 'PRIVATE', 12, 42),

  // ── 토레스 델 리오 ──
  a('torres-del-rio', 'Albergue-Hotel La Pata de Oca', 'PRIVATE', 12, 32),
  a('torres-del-rio', 'Albergue Casa Mariela', 'PRIVATE', 14, 45),
  a('torres-del-rio', 'Albergue-Hostal San Andrés', 'PRIVATE', 15, 20),

  // ── 비아나 ──
  a('viana', 'Albergue de peregrinos Andrés Muñoz', 'MUNICIPAL', 9.5, 46),
  a('viana', 'Albergue Izar', 'PRIVATE', 15, 38),

  // ── 로그로뇨 ──
  a('logrono', 'Albergue de peregrinos de Logroño', 'MUNICIPAL', 0, 68),
  a('logrono', 'Albergue parroquial Santiago El Real', 'PARISH', 0, 30),
  a('logrono', 'Albergue Albas', 'PRIVATE', 18, 26),
  a('logrono', 'Albergue Santiago Apóstol', 'PRIVATE', 18, 68),
  a('logrono', 'Albergue San Nicolás', 'PRIVATE', 20, 20),

  // ── 나바레테 ──
  a('navarrete', 'Albergue de peregrinos de Navarrete', 'MUNICIPAL', 10, 17),
  a('navarrete', 'Albergue El Cántaro', 'PRIVATE', 15, 18),
  a('navarrete', 'Albergue La Casa del Peregrino Ángel', 'PRIVATE', 10, 26),
  a('navarrete', 'Albergue La Iglesia', 'PRIVATE', 15, 14),
  a('navarrete', 'Albergue El Refugio Navarrete', 'PRIVATE', 15, 35),
  a('navarrete', 'Albergue Ikigai', 'PRIVATE', 12, 42),

  // ── 벤토사 ──
  a('ventosa', 'Albergue San Saturnino', 'PRIVATE', 14, 42),

  // ── 나헤라 ──
  a('najera', 'Albergue de peregrinos de Nájera', 'MUNICIPAL', 7, 48),
  a('najera', 'Albergue Puerta de Nájera', 'PRIVATE', 15, 29),
  a('najera', 'Albergue Nido de Cigüeña', 'PRIVATE', 15, 15),
  a('najera', 'Albergue Las Peñas', 'PRIVATE', 15, 10),
  a('najera', 'Albergue El Peregrino Najerino', 'PRIVATE', 14, 28),
  a('najera', 'Albergue Sancho III - La Judería', 'PRIVATE', 13, 16),

  // ── 아소프라 ──
  a('azofra', 'Albergue de peregrinos de Azofra', 'MUNICIPAL', 16, 60),

  // ── 시루에냐 ──
  a('ciruena', 'Albergue Virgen de Guadalupe', 'PRIVATE', 20, 5),
  a('ciruena', 'Albergue Victoria', 'PRIVATE', 18, 10),

  // ── 산토 도밍고 데 라 칼사다 ──
  a('santo-domingo-de-la-calzada', 'Albergue de peregrinos Cofradía del Santo', 'PARISH', 13, 164),
  a('santo-domingo-de-la-calzada', 'Albergue de peregrinos Abadía Cisterciense', 'MONASTERY', 13, 40),

  // ── 그라뇬 ──
  a('granon', 'Albergue parroquial San Juan Bautista', 'PARISH', null, 40),
  a('granon', 'Albergue La Casa de las Sonrisas', 'PRIVATE', null, 15),

  // ── 레데시야 델 카미노 ──
  a('redecilla-del-camino', 'Albergue de peregrinos San Lázaro', 'MUNICIPAL', 7, 52),
  a('redecilla-del-camino', 'Albergue Essentia', 'PRIVATE', 14, 10),

  // ── 벨로라도 ──
  a('belorado', 'Albergue parroquial de Belorado', 'PARISH', 10, 20),
  a('belorado', 'Albergue Cuatro Cantones', 'PRIVATE', 15, 65),
  a('belorado', 'Albergue-Pensión Caminante', 'PRIVATE', 6, 22),
  a('belorado', 'Albergue A Santiago', 'PRIVATE', 14, 98),

  // ── 토산토스 ──
  a('tosantos', 'Albergue parroquial San Francisco de Asís', 'PARISH', 0, 30),

  // ── 비야프랑카 몬테스 데 오카 ──
  a('villafranca-montes-de-oca', 'Albergue San Antón Abad', 'PRIVATE', 15, 49),

  // ── 산 후안 데 오르테가 ──
  a('san-juan-de-ortega', 'Albergue parroquial de San Juan de Ortega', 'PARISH', 15, 30),
  a('san-juan-de-ortega', 'Alojamiento El Descanso de San Juan', 'PRIVATE', 15, 7),
  a('san-juan-de-ortega', 'Albergue La Cuadra de Luisito', 'PRIVATE', 15, 22),

  // ── 아헤스 ──
  a('ages', 'Albergue municipal de Agés', 'MUNICIPAL', 15, 36),
  a('ages', 'Albergue Fagus', 'PRIVATE', 16, 22),

  // ── 아타푸에르카 ──
  a('atapuerca', 'Albergue-Habitaciones El Peregrino', 'PRIVATE', 14, 30),
  a('atapuerca', 'Hostel La Plazuela Verde', 'PRIVATE', 15, 16),
  a('atapuerca', 'Hostel Atapuerca INpulso', 'PRIVATE', 20, 13),

  // ── 부르고스 ──
  a('burgos', 'Albergue de peregrinos Casa del Cubo y de los Lerma', 'MUNICIPAL', 10, 120),
  a('burgos', 'Albergue Santiago y Santa Catalina', 'PARISH', 11, 16),

  // ── 타르다호스 ──
  a('tardajos', 'Albergue de peregrinos de Tardajos', 'MUNICIPAL', 0, 18),
  a('tardajos', 'Albergue La Fábrica', 'PRIVATE', 13, 14),

  // ── 오르니요스 델 카미노 ──
  a('hornillos-del-camino', 'Albergue de peregrinos de Hornillos del Camino', 'MUNICIPAL', 15, 30),
  a('hornillos-del-camino', 'Albergue El Alfar de Rosalía', 'PRIVATE', 15, 24),
  a('hornillos-del-camino', 'Albergue Hornillos Meeting Point', 'PRIVATE', 15, 32),

  // ── 온타나스 ──
  a('hontanas', 'Albergue de peregrinos Antiguo Hospital de San Juan', 'PARISH', 14, 42),
  a('hontanas', 'Albergue El Puntido', 'PRIVATE', 15, 40),
  a('hontanas', 'Albergue Santa Brígida', 'PRIVATE', 15, 42),

  // ── 카스트로헤리스 ──
  a('castrojeriz', 'Albergue de peregrinos San Esteban', 'MUNICIPAL', 9, 35),
  a('castrojeriz', 'Albergue Ultreia', 'PRIVATE', 16, 26),
  a('castrojeriz', 'Albergue Rosalía', 'PRIVATE', 15, 30),
  a('castrojeriz', 'Albergue Orión', 'PRIVATE', 15, 22),
  a('castrojeriz', 'Albergue-Hotel A Cien Leguas', 'PRIVATE', 17, 24),
  a('castrojeriz', 'Albergue La Rinconada', 'PRIVATE', 14, 18),
  a('castrojeriz', 'Albergue Casa Nostra', 'PRIVATE', 14, 26),
  a('castrojeriz', 'Albergue Espacio Interior', 'PRIVATE', 15),

  // ── 보아디야 델 카미노 ──
  a('boadilla-del-camino', 'Albergue En el Camino', 'PRIVATE', 15, 70),
  a('boadilla-del-camino', 'Juntos Albergue de Peregrinos', 'PRIVATE', 18, 10),

  // ── 프로미스타 ──
  a('fromista', 'Albergue de peregrinos de Frómista', 'MUNICIPAL', 15, 56),
  a('fromista', 'Albergue Estrella del Camino', 'PRIVATE', 15, 32),
  a('fromista', 'Acogida de invierno Betania', 'PARISH', null, 7),
  a('fromista', 'Albergue Luz de Frómista', 'PRIVATE', 15, 31),

  // ── 포블라시온 데 캄포스 ──
  a('poblacion-de-campos', 'Albergue de peregrinos de Población de Campos', 'MUNICIPAL', 13, 18),

  // ── 비얄카사르 데 시르가 ──
  a('villalcazar-de-sirga', 'Albergue de peregrinos Casa del Peregrino', 'PARISH', 10, 20),
  a('villalcazar-de-sirga', 'Albergue Don Camino', 'PRIVATE', 16, 26),

  // ── 카리온 데 로스 콘데스 ──
  a('carrion-de-los-condes', 'Albergue parroquial Santa María', 'PARISH', 10, 50),
  a('carrion-de-los-condes', 'Albergue-Hospedería del Convento de Santa Clara', 'MONASTERY', 10, 28),
  a('carrion-de-los-condes', 'Albergue Espíritu Santo', 'PRIVATE', 10, 96),

  // ── 칼사딜야 데 라 쿠에사 ──
  a('calzadilla-de-la-cueza', 'Albergue de peregrinos de Calzadilla de la Cueza', 'MUNICIPAL', 15, 34),
  a('calzadilla-de-la-cueza', 'Albergue Los Canarios', 'PRIVATE', 18, 11),
  a('calzadilla-de-la-cueza', 'Albergue Camino Real', 'PRIVATE', 14, 30),

  // ── 테라디요스 데 로스 템플라리오스 ──
  a('terradillos-de-los-templarios', 'Albergue Jacques de Molay', 'PRIVATE', 15, 50),
  a('terradillos-de-los-templarios', 'Albergue Los Templarios', 'PRIVATE', 17, 46),

  // ── 사아군 ──
  a('sahagun', 'Albergue de peregrinos Cluny', 'PARISH', 9, 64),
  a('sahagun', 'Albergue de peregrinos de la Santa Cruz', 'PARISH', 10, 58),

  // ── 베르시아노스 델 레알 카미노 ──
  a('bercianos-del-real-camino', 'Albergue parroquial Casa Rectoral', 'PARISH', 0, 5),
  a('bercianos-del-real-camino', 'Albergue Bercianos 1900', 'PRIVATE', 18, 20),
  a('bercianos-del-real-camino', 'Albergue La Perala', 'PRIVATE', 18, 29),
  a('bercianos-del-real-camino', 'Albergue Santa Clara', 'PRIVATE', 15, 10),

  // ── 엘 부르고 라네로 ──
  a('el-burgo-ranero', 'Albergue de peregrinos Domenico Laffi', 'PRIVATE', null, 30),
  a('el-burgo-ranero', 'Albergue La Laguna', 'PRIVATE', 18, 20),

  // ── 렐리에고스 ──
  a('reliegos', 'Albergue municipal de peregrinos de Reliegos - Don Gaiferos', 'MUNICIPAL', null, 44),
  a('reliegos', 'Albergue La Parada', 'PRIVATE', 14, 36),
  a('reliegos', 'Albergue Gil', 'PRIVATE', 15, 14),
  a('reliegos', 'Albergue Vive tu Camino', 'PRIVATE', 13, 20),
  a('reliegos', 'Albergue Las Hadas', 'PRIVATE', 16, 20),

  // ── 만시야 데 라스 물라스 ──
  a('mansilla-de-las-mulas', 'Albergue de peregrinos de Mansilla de las Mulas', 'MUNICIPAL', 7, 28),
  a('mansilla-de-las-mulas', 'Albergue Gaia', 'PRIVATE', 14, 16),
  a('mansilla-de-las-mulas', 'Albergue El Jardín del Camino', 'PRIVATE', 15, 44),
  a('mansilla-de-las-mulas', 'Albergue La Pingüina', 'PRIVATE', 28, 12),

  // ── 레온 ──
  a('leon', 'Albergue del convento de las Carbajalas', 'MONASTERY', null, 85),
  a('leon', 'Albergue-Residencia San Francisco de Asís', 'PRIVATE', 12, 70),
  a('leon', 'Albergue Santo Tomás de Canterbury', 'PRIVATE', 12, 48),
  a('leon', 'Albergue Check in León', 'PRIVATE', 12, 40),
  a('leon', 'Albergue Muralla Leonesa', 'PRIVATE', 16, 60),

  // ── 비야당고스 델 파라모 ──
  a('villadangos-del-paramo', 'Albergue de peregrinos de Villadangos del Páramo', 'MUNICIPAL', null, 48),
  a('villadangos-del-paramo', 'Albergue La Santa Siesta', 'PRIVATE', 18, 26),

  // ── 산 마르틴 델 카미노 ──
  a('san-martin-del-camino', 'Albergue de peregrinos de San Martín del Camino', 'MUNICIPAL', 10, 46),
  a('san-martin-del-camino', 'Albergue Santa Ana', 'PRIVATE', 10, 40),
  a('san-martin-del-camino', 'Albergue La Casa Verde', 'PRIVATE', 14, 8),
  a('san-martin-del-camino', 'Albergue La Huella', 'PRIVATE', 18, 24),
  a('san-martin-del-camino', 'Albergue Vieira', 'PRIVATE', 12, 34),

  // ── 오스피탈 데 오르비고 ──
  a('hospital-de-orbigo', 'Albergue parroquial Karl Leisner', 'PARISH', 12, 62),
  a('hospital-de-orbigo', 'Albergue DORMERO San Miguel', 'PRIVATE', 16, 34),
  a('hospital-de-orbigo', 'Albergue Verde', 'PRIVATE', 20, 26),
  a('hospital-de-orbigo', 'Albergue La Encina', 'PRIVATE', 17, 16),
  a('hospital-de-orbigo', 'Albergue DORMERO Hidalgos', 'PRIVATE', 17, 18),

  // ── 산티바녜스 데 발데이글레시아스 ──
  a('santibanez-de-valdeiglesias', 'Albergue parroquial de Santibáñez de Valdeiglesias', 'PARISH', 15, 20),
  a('santibanez-de-valdeiglesias', 'Albergue Camino Francés', 'PRIVATE', 16, 20),

  // ── 아스토르가 ──
  a('astorga', 'Albergue de peregrinos Siervas de María', 'MUNICIPAL', 8, 156),
  a('astorga', 'Albergue franciscano Santa María de los Ángeles', 'MONASTERY', 10, 30),
  a('astorga', 'Albergue San Javier', 'PRIVATE', 12, 110),
  a('astorga', 'Albergue MyWay', 'PRIVATE', 15, 13),

  // ── 라바날 델 카미노 ──
  a('rabanal-del-camino', 'Refugio Gaucelmo', 'DONATIVO', 0, 36),
  a('rabanal-del-camino', 'Albergue Nuestra Señora del Pilar', 'PRIVATE', 10, 76),
  a('rabanal-del-camino', 'Albergue La Senda', 'PRIVATE', 15, 24),

  // ── 폰세바돈 ──
  a('foncebadon', 'Albergue parroquial Domus Dei', 'PARISH', 0, 18),
  a('foncebadon', 'Albergue Monte Irago', 'PRIVATE', 14, 22),
  a('foncebadon', 'Albergue El Convento de Foncebadón', 'PRIVATE', 16, 24),
  a('foncebadon', 'Albergue La Posada del Druida', 'PRIVATE', 17, 20),
  a('foncebadon', 'Albergue La Cruz de Fierro', 'PRIVATE', 15, 34),
  a('foncebadon', 'Albergue Casa Chelo', 'PRIVATE', 20, 10),

  // ── 엘 아세보 ──
  a('el-acebo', 'Albergue parroquial Apóstol Santiago', 'PARISH', 0, 22),
  a('el-acebo', 'Albergue Mesón El Acebo', 'PRIVATE', 12, 16),
  a('el-acebo', 'Albergue La Casa del Peregrino', 'PRIVATE', 14, 80),

  // ── 몰리나세카 ──
  a('molinaseca', 'Albergue Compostela', 'PRIVATE', 14, 32),
  a('molinaseca', 'Albergue Santa Marina', 'PRIVATE', 12, 38),
  a('molinaseca', 'Albergue Señor Oso', 'PRIVATE', 14, 16),

  // ── 폰페라다 ──
  a('ponferrada', 'Albergue parroquial San Nicolás de Flüe', 'PARISH', 0, 186),
  a('ponferrada', 'Albergue Alea', 'PRIVATE', 15, 18),
  a('ponferrada', 'Albergue Guiana', 'PRIVATE', 16, 72),
  a('ponferrada', 'Albergue Alda Pilgrim Ponferrada', 'PRIVATE', 14, 40),
  a('ponferrada', 'Albergue El Templarín', 'PRIVATE', 15, 24),

  // ── 카카벨로스 ──
  a('cacabelos', 'Albergue de peregrinos de Cacabelos', 'MUNICIPAL', null, 60),
  a('cacabelos', 'Albergue-Hostal La Gallega', 'PRIVATE', 19, 29),
  a('cacabelos', 'Albergue-Hostal Saint James Way', 'PRIVATE', 22),

  // ── 비야프랑카 델 비에르소 ──
  a('villafranca-del-bierzo', 'Albergue de peregrinos de Villafranca del Bierzo', 'MUNICIPAL', 10, 60),
  a('villafranca-del-bierzo', 'Albergue Ave Fénix', 'PRIVATE', 10, 80),
  a('villafranca-del-bierzo', 'Albergue de la Piedra', 'PRIVATE', 15, 15),
  a('villafranca-del-bierzo', 'Albergue Leo', 'PRIVATE', 15, 7),
  a('villafranca-del-bierzo', 'Albergue-Hospedería Viña Femita', 'PRIVATE', 17, 20),
  a('villafranca-del-bierzo', 'Albergue-Hospedería San Nicolás el Real', 'PRIVATE', 13, 75),

  // ── 트라바델로 ──
  a('trabadelo', 'Albergue municipal de Trabadelo', 'MUNICIPAL', 10, 18),
  a('trabadelo', 'Albergue parroquial de Trabadelo', 'PARISH', 10, 22),
  a('trabadelo', 'Albergue Crispeta', 'PRIVATE', 12, 32),
  a('trabadelo', 'Albergue Camino y Leyenda', 'PRIVATE', 18),
  a('trabadelo', 'Albergue Casa Susi', 'PRIVATE', 15, 10),

  // ── 라 파바 ──
  a('la-faba', 'Albergue de La Faba', 'DONATIVO', 8, 52),
  a('la-faba', 'Albergue El Rincón del Bierzo', 'PRIVATE', 13.5, 11),

  // ── 오 세브레이로 (갈리시아 — Xunta) ──
  a('o-cebreiro', 'Albergue de peregrinos de O Cebreiro', 'XUNTA', 10, 104),
  a('o-cebreiro', 'Albergue Casa Campelo', 'PRIVATE', 15, 10),

  // ── 폰프리아 (갈리시아) ──
  a('fonfria', 'Albergue-Pensión A Reboleira', 'PRIVATE', 14, 50),

  // ── 트리아카스텔라 (갈리시아) ──
  a('triacastela', 'Albergue de peregrinos de Triacastela', 'XUNTA', 10, 14),
  a('triacastela', 'Albergue Aitzenea', 'PRIVATE', 13, 38),
  a('triacastela', 'Albergue Berce do Camiño', 'PRIVATE', 15, 27),
  a('triacastela', 'Albergue Refugio del Oribio', 'PRIVATE', 13, 27),
  a('triacastela', 'Albergue-Pensión Complexo Xacobeo', 'PRIVATE', 15, 36),
  a('triacastela', 'Albergue A Horta de Abel', 'PRIVATE', 12, 14),
  a('triacastela', 'Albergue Atrio', 'PRIVATE', 14, 20),

  // ── 사리아 (갈리시아) ──
  a('sarria', 'Albergue de peregrinos de Sarria', 'XUNTA', 10, 40),
  a('sarria', 'Albergue Monasterio de la Magdalena', 'MONASTERY', 12, 110),
  a('sarria', 'Albergue-Pensión Don Álvaro', 'PRIVATE', 15, 40),
  a('sarria', 'Albergue O Durmiñento', 'PRIVATE', 12, 38),
  a('sarria', 'Albergue Los Blasones', 'PRIVATE', 11, 42),
  a('sarria', 'Albergue San Lázaro', 'PRIVATE', 13, 27),
  a('sarria', 'Albergue Casa Peltre', 'PRIVATE', 13, 22),
  a('sarria', 'Albergue Mayor', 'PRIVATE', 13, 16),

  // ── 바르바델로 (갈리시아) ──
  a('barbadelo', 'Albergue-Pensión Casa Barbadelo', 'PRIVATE', 14, 48),
  a('barbadelo', 'Albergue A Casa de Carmen', 'PRIVATE', 16, 20),
  a('barbadelo', 'Albergue O Pombal', 'PRIVATE', 15, 12),

  // ── 페레이로스 (갈리시아 — Xunta) ──
  a('ferreiros', 'Albergue de peregrinos de Ferreiros', 'XUNTA', 10, 20),
  a('ferreiros', 'Albergue Casa Cruceiro de Ferreiros', 'PRIVATE', 16, 24),

  // ── 포르토마린 (갈리시아 — Xunta) ──
  a('portomarin', 'Albergue de peregrinos de Portomarín', 'XUNTA', 10, 86),
  a('portomarin', 'Albergue Ferramenteiro', 'PRIVATE', 15, 130),
  a('portomarin', 'Albergue-Pensión PortoSantiago', 'PRIVATE', 15, 7),
  a('portomarin', 'Albergue-Pensión Ultreia', 'PRIVATE', 16, 14),
  a('portomarin', 'Albergue Casa Cruz', 'PRIVATE', 15, 16),
  a('portomarin', 'Albergue-Pensión Manuel', 'PRIVATE', 16, 16),
  a('portomarin', 'Albergue Casa do Marabillas', 'PRIVATE', 17, 16),
  a('portomarin', 'Albergue-Pensión Pons Minea', 'PRIVATE', 16, 24),

  // ── 곤사르 (갈리시아 — Xunta) ──
  a('gonzar', 'Albergue de peregrinos de Gonzar', 'XUNTA', 10, 28),
  a('gonzar', 'Albergue-Hostería de Gonzar', 'PRIVATE', 15, 20),

  // ── 벤타스 데 나론 (갈리시아) ──
  a('ventas-de-naron', 'Albergue Casa Molar', 'PRIVATE', 15, 18),
  a('ventas-de-naron', 'Albergue-Pensión O Cruceiro', 'PRIVATE', 15, 26),

  // ── 팔라스 데 레이 (갈리시아 — Xunta) ──
  a('palas-de-rei', 'Albergue de peregrinos Os Chacotes', 'XUNTA', 10, 112),
  a('palas-de-rei', 'Albergue de peregrinos de Palas de Rei', 'XUNTA', 10, 24),
  a('palas-de-rei', 'Albergue San Marcos', 'PRIVATE', 15, 10),
  a('palas-de-rei', 'Albergue Outeiro', 'PRIVATE', 16, 64),
  a('palas-de-rei', 'Albergue Buen Camino', 'PRIVATE', 15, 35),
  a('palas-de-rei', 'Albergue Mesón de Benito', 'PRIVATE', 15, 78),
  a('palas-de-rei', 'Albergue Castro', 'PRIVATE', 14, 60),
  a('palas-de-rei', 'Albergue A Casiña di Marcello', 'PRIVATE', 17, 17),

  // ── 멜리데 (갈리시아 — Xunta) ──
  a('melide', 'Albergue de peregrinos de Melide', 'XUNTA', 10, 140),
  a('melide', 'Albergue O Apalpador', 'PRIVATE', 13, 10),
  a('melide', 'Albergue O Cruceiro', 'PRIVATE', 13, 88),
  a('melide', 'Albergue Pereiro', 'PRIVATE', 13, 40),
  a('melide', 'Albergue Melide', 'PRIVATE', 15, 49),
  a('melide', 'Albergue San Antón', 'PRIVATE', 15, 28),
  a('melide', 'Albergue Alfonso II El Casto', 'PRIVATE', 15, 34),
  a('melide', 'Albergue Arraigos', 'PRIVATE', 15, 20),

  // ── 리바디소 (갈리시아 — Xunta) ──
  a('ribadiso', 'Albergue de peregrinos de Ribadiso de Baixo', 'XUNTA', 10, 60),
  a('ribadiso', 'Albergue-Pensión Los Caminantes I', 'PRIVATE', 13, 68),
  a('ribadiso', 'Albergue Milpés', 'PRIVATE', 15, 25),
  a('ribadiso', 'Albergue Miraiso', 'PRIVATE', 15, 12),

  // ── 아르수아 (갈리시아 — Xunta) ──
  a('arzua', 'Albergue de peregrinos de Arzúa', 'XUNTA', 10, 56),
  a('arzua', 'Albergue de Camino', 'PRIVATE', 16, 46),
  a('arzua', 'Albergue Don Quijote', 'PRIVATE', 16, 50),
  a('arzua', 'Albergue Vía Láctea', 'PRIVATE', 16, 130),
  a('arzua', 'Albergue Ultreia', 'PRIVATE', 16, 28),
  a('arzua', 'Albergue Santiago Apóstol', 'PRIVATE', 16, 92),
  a('arzua', 'Albergue Los Caminantes II', 'PRIVATE', 14, 26),

  // ── 살세다 (갈리시아) ──
  a('salceda', 'Albergue-Hotel Rural Salceda', 'PRIVATE', 18, 8),
  a('salceda', 'Albergue-Pensión Alborada', 'PRIVATE', 18, 10),
  a('salceda', 'Albergue La Corona', 'PRIVATE', 18, 6),

  // ── 오 페드로우소 (갈리시아 — Xunta) ──
  a('o-pedrouzo', 'Albergue de peregrinos de Arca - O Pino', 'XUNTA', 10, 150),
  a('o-pedrouzo', 'Albergue Mirador de Pedrouzo', 'PRIVATE', 15, 62),
  a('o-pedrouzo', 'Albergue Otero', 'PRIVATE', 14, 34),
  a('o-pedrouzo', 'Albergue O Trisquel', 'PRIVATE', 14, 78),
  a('o-pedrouzo', 'Albergue Porta de Santiago', 'PRIVATE', 14, 54),

  // ── 몬테 도 고소 (갈리시아 — Xunta) ──
  a('monte-do-gozo', 'Albergue de peregrinos del Monte do Gozo', 'XUNTA', 10, 500),
  a('monte-do-gozo', 'Albergue Monte do Gozo', 'PRIVATE', 14, 620),

  // ── 산티아고 데 콤포스텔라 ──
  a('santiago-de-compostela', 'Residencia de peregrinos San Lázaro', 'MUNICIPAL', 10, 80),
  a('santiago-de-compostela', 'Albergue Seminario Menor', 'PARISH', 20, 169),
  a('santiago-de-compostela', 'Albergue parroquial Fin del Camino', 'PARISH', 16, 112),
  a('santiago-de-compostela', 'Albergue Mundoalbergue', 'PRIVATE', 22, 34),
  a('santiago-de-compostela', 'Albergue The Last Stamp', 'PRIVATE', 22, 62),
  a('santiago-de-compostela', 'Albergue La Estación', 'PRIVATE', 20, 30),
  a('santiago-de-compostela', 'Albergue Porta Real', 'PRIVATE', 21, 20),
  a('santiago-de-compostela', 'Albergue Azabache', 'PRIVATE', 20, 20),
]
