import React, { useState, useMemo } from "react";

/* ────────────────────────────────────────────────────────────
   길동무 · Camino Companion
   한국인 순례자를 위한 프랑스 길 동반 앱 (프로토타입)
   ──────────────────────────────────────────────────────────── */

/* 마을 데이터: km = 생장피드포르 기준 누적거리, el = 고도(m), beds = 침대 수(0이면 숙소 없음)
   sv = 서비스 (w 식수 · b 바/식당 · s 상점 · p 약국 · a ATM · x 배낭배송) */
const TOWNS = [
  { es: "Saint-Jean-Pied-de-Port", ko: "생장피드포르", km: 0, el: 170, beds: 240, sv: "wbspax" },
  { es: "Orisson", ko: "오리송", km: 7.9, el: 790, beds: 28, sv: "wb" },
  { es: "Roncesvalles", ko: "론세스바예스", km: 25.7, el: 950, beds: 183, sv: "wbx" },
  { es: "Zubiri", ko: "수비리", km: 47.1, el: 520, beds: 120, sv: "wbsax" },
  { es: "Larrasoaña", ko: "라라소아냐", km: 52.6, el: 500, beds: 60, sv: "wb" },
  { es: "Pamplona", ko: "팜플로나", km: 67.5, el: 450, beds: 400, sv: "wbspax" },
  { es: "Cizur Menor", ko: "시수르 메노르", km: 72.5, el: 480, beds: 50, sv: "wbs" },
  { es: "Uterga", ko: "우테르가", km: 82.6, el: 490, beds: 30, sv: "wb" },
  { es: "Obanos", ko: "오바노스", km: 88.6, el: 415, beds: 36, sv: "wbs" },
  { es: "Puente la Reina", ko: "푸엔테 라 레이나", km: 91.4, el: 350, beds: 190, sv: "wbspax" },
  { es: "Cirauqui", ko: "시라우키", km: 97.6, el: 490, beds: 40, sv: "wbs" },
  { es: "Villatuerta", ko: "비야투에르타", km: 108.0, el: 460, beds: 40, sv: "wbs" },
  { es: "Estella", ko: "에스테야", km: 113.3, el: 425, beds: 200, sv: "wbspax" },
  { es: "Ayegui", ko: "아예기 (이라체)", km: 116.3, el: 460, beds: 70, sv: "wbs" },
  { es: "Villamayor de Monjardín", ko: "비야마요르 데 몬하르딘", km: 122.9, el: 650, beds: 40, sv: "wb" },
  { es: "Los Arcos", ko: "로스 아르코스", km: 134.6, el: 450, beds: 180, sv: "wbspa" },
  { es: "Torres del Río", ko: "토레스 델 리오", km: 142.5, el: 480, beds: 60, sv: "wbs" },
  { es: "Viana", ko: "비아나", km: 153.4, el: 470, beds: 90, sv: "wbspa" },
  { es: "Logroño", ko: "로그로뇨", km: 162.2, el: 380, beds: 260, sv: "wbspax" },
  { es: "Navarrete", ko: "나바레테", km: 174.0, el: 510, beds: 90, sv: "wbspa" },
  { es: "Ventosa", ko: "벤토사", km: 180.0, el: 660, beds: 50, sv: "wbs" },
  { es: "Nájera", ko: "나헤라", km: 191.2, el: 480, beds: 150, sv: "wbspax" },
  { es: "Azofra", ko: "아소프라", km: 197.0, el: 560, beds: 60, sv: "wbs" },
  { es: "Cirueña", ko: "시루에냐", km: 206.0, el: 750, beds: 30, sv: "wb" },
  { es: "Santo Domingo de la Calzada", ko: "산토 도밍고 데 라 칼사다", km: 212.2, el: 640, beds: 220, sv: "wbspax" },
  { es: "Grañón", ko: "그라뇽", km: 218.7, el: 720, beds: 40, sv: "wb" },
  { es: "Redecilla del Camino", ko: "레데시야 델 카미노", km: 222.5, el: 745, beds: 50, sv: "wbs" },
  { es: "Belorado", ko: "벨로라도", km: 234.9, el: 770, beds: 160, sv: "wbspa" },
  { es: "Tosantos", ko: "토산토스", km: 239.7, el: 820, beds: 30, sv: "wb" },
  { es: "Villafranca Montes de Oca", ko: "비야프랑카 몬테스 데 오카", km: 246.5, el: 950, beds: 70, sv: "wb" },
  { es: "San Juan de Ortega", ko: "산 후안 데 오르테가", km: 259.1, el: 1000, beds: 70, sv: "wb" },
  { es: "Agés", ko: "아헤스", km: 262.7, el: 970, beds: 60, sv: "wbs" },
  { es: "Atapuerca", ko: "아타푸에르카", km: 265.2, el: 960, beds: 60, sv: "wbs" },
  { es: "Burgos", ko: "부르고스", km: 284.9, el: 860, beds: 350, sv: "wbspax" },
  { es: "Tardajos", ko: "타르다호스", km: 295.0, el: 830, beds: 40, sv: "wbs" },
  { es: "Hornillos del Camino", ko: "오르니요스 델 카미노", km: 305.9, el: 825, beds: 70, sv: "wb" },
  { es: "Hontanas", ko: "온타나스", km: 316.3, el: 870, beds: 80, sv: "wb" },
  { es: "Castrojeriz", ko: "카스트로헤리스", km: 326.0, el: 810, beds: 140, sv: "wbspa" },
  { es: "Boadilla del Camino", ko: "보아디야 델 카미노", km: 345.2, el: 780, beds: 70, sv: "wb" },
  { es: "Frómista", ko: "프로미스타", km: 351.2, el: 780, beds: 120, sv: "wbspa" },
  { es: "Población de Campos", ko: "포블라시온 데 캄포스", km: 355.6, el: 790, beds: 40, sv: "wb" },
  { es: "Villalcázar de Sirga", ko: "비얄카사르 데 시르가", km: 364.6, el: 810, beds: 50, sv: "wbs" },
  { es: "Carrión de los Condes", ko: "카리온 데 로스 콘데스", km: 370.5, el: 830, beds: 170, sv: "wbspax" },
  { es: "Calzadilla de la Cueza", ko: "칼사디야 데 라 쿠에사", km: 387.6, el: 860, beds: 40, sv: "wb" },
  { es: "Terradillos de los Templarios", ko: "테라디요스", km: 397.3, el: 880, beds: 70, sv: "wb" },
  { es: "Sahagún", ko: "사아군", km: 410.3, el: 810, beds: 120, sv: "wbspax" },
  { es: "Bercianos del Real Camino", ko: "베르시아노스", km: 420.5, el: 850, beds: 60, sv: "wb" },
  { es: "El Burgo Ranero", ko: "엘 부르고 라네로", km: 427.9, el: 880, beds: 80, sv: "wbs" },
  { es: "Reliegos", ko: "렐리에고스", km: 440.0, el: 830, beds: 70, sv: "wbs" },
  { es: "Mansilla de las Mulas", ko: "만시야 데 라스 물라스", km: 446.9, el: 800, beds: 110, sv: "wbspa" },
  { es: "León", ko: "레온", km: 465.5, el: 830, beds: 380, sv: "wbspax" },
  { es: "Villadangos del Páramo", ko: "비야당고스 델 파라모", km: 485.0, el: 890, beds: 80, sv: "wbs" },
  { es: "San Martín del Camino", ko: "산 마르틴 델 카미노", km: 490.1, el: 880, beds: 90, sv: "wbs" },
  { es: "Hospital de Órbigo", ko: "오스피탈 데 오르비고", km: 496.6, el: 820, beds: 130, sv: "wbspa" },
  { es: "Santibáñez de Valdeiglesias", ko: "산티바녜스", km: 501.5, el: 870, beds: 40, sv: "wb" },
  { es: "Astorga", ko: "아스토르가", km: 513.8, el: 870, beds: 200, sv: "wbspax" },
  { es: "Rabanal del Camino", ko: "라바날 델 카미노", km: 533.0, el: 1150, beds: 90, sv: "wb" },
  { es: "Foncebadón", ko: "폰세바돈", km: 539.7, el: 1430, beds: 80, sv: "wb" },
  { es: "El Acebo", ko: "엘 아세보", km: 549.0, el: 1145, beds: 70, sv: "wb" },
  { es: "Molinaseca", ko: "몰리나세카", km: 556.0, el: 595, beds: 90, sv: "wbsa" },
  { es: "Ponferrada", ko: "폰페라다", km: 567.1, el: 540, beds: 280, sv: "wbspax" },
  { es: "Cacabelos", ko: "카카벨로스", km: 583.0, el: 480, beds: 100, sv: "wbspa" },
  { es: "Villafranca del Bierzo", ko: "비야프랑카 델 비에르소", km: 591.3, el: 510, beds: 170, sv: "wbspax" },
  { es: "Trabadelo", ko: "트라바델로", km: 601.5, el: 580, beds: 70, sv: "wbs" },
  { es: "La Faba", ko: "라 파바", km: 611.5, el: 920, beds: 40, sv: "wb" },
  { es: "O Cebreiro", ko: "오 세브레이로", km: 619.7, el: 1300, beds: 110, sv: "wbsa" },
  { es: "Fonfría", ko: "폰프리아", km: 628.0, el: 1280, beds: 60, sv: "wb" },
  { es: "Triacastela", ko: "트리아카스텔라", km: 640.5, el: 665, beds: 130, sv: "wbspa" },
  { es: "Sarria", ko: "사리아", km: 658.9, el: 450, beds: 480, sv: "wbspax" },
  { es: "Barbadelo", ko: "바르바델로", km: 663.5, el: 580, beds: 70, sv: "wb" },
  { es: "Ferreiros", ko: "페레이로스", km: 671.0, el: 640, beds: 50, sv: "wb" },
  { es: "Portomarín", ko: "포르토마린", km: 681.1, el: 350, beds: 260, sv: "wbspax" },
  { es: "Gonzar", ko: "곤사르", km: 689.0, el: 570, beds: 50, sv: "wb" },
  { es: "Ventas de Narón", ko: "벤타스 데 나론", km: 693.5, el: 690, beds: 40, sv: "wb" },
  { es: "Palas de Rei", ko: "팔라스 데 레이", km: 705.9, el: 565, beds: 240, sv: "wbspax" },
  { es: "Melide", ko: "멜리데", km: 720.0, el: 455, beds: 220, sv: "wbspax" },
  { es: "Ribadiso", ko: "리바디소", km: 731.0, el: 320, beds: 70, sv: "wb" },
  { es: "Arzúa", ko: "아르수아", km: 734.4, el: 390, beds: 300, sv: "wbspax" },
  { es: "Salceda", ko: "살세다", km: 744.0, el: 370, beds: 40, sv: "wb" },
  { es: "O Pedrouzo", ko: "오 페드로우소", km: 753.7, el: 285, beds: 260, sv: "wbspax" },
  { es: "Monte do Gozo", ko: "몬테 도 고소", km: 768.5, el: 370, beds: 400, sv: "wbs" },
  { es: "Santiago de Compostela", ko: "산티아고 데 콤포스텔라", km: 773.1, el: 260, beds: 900, sv: "wbspax" },
];

const END = TOWNS.length - 1;
const idxOf = (es) => TOWNS.findIndex((t) => t.es === es);

const ROUTES = [
  { key: "full", label: "프랑스 길 전 구간", from: 0, sub: "생장피드포르 → 산티아고" },
  { key: "leon", label: "레온에서 출발", from: idxOf("León"), sub: "레온 → 산티아고" },
  { key: "sarria", label: "사리아 100km", from: idxOf("Sarria"), sub: "사리아 → 산티아고" },
];

/* 알베르게 샘플 데이터 — verified 표시는 널리 알려진 실제 숙소 */
const ALBERGUES = {
  Roncesvalles: [
    { n: "Albergue de Peregrinos de Roncesvalles", t: "공립", beds: 183, price: 14, book: true, v: true, memo: "수도원 부속. 저녁 순례자 미사와 강복 있음." },
  ],
  Orisson: [
    { n: "Refuge Orisson", t: "사립", beds: 28, price: 45, book: true, v: true, memo: "석식·조식 포함. 피레네 중턱, 몇 달 전 예약 필수." },
  ],
  Pamplona: [
    { n: "Albergue Jesús y María", t: "공립", beds: 112, price: 12, book: false, v: true, memo: "구시가 성당 건물. 선착순." },
    { n: "Casa Ibarrola", t: "사립", beds: 22, price: 20, book: true, v: false, memo: "캡슐형 침대, 조용한 편." },
  ],
  "Puente la Reina": [
    { n: "Albergue Padres Reparadores", t: "수도원", beds: 100, price: 8, book: false, v: true, memo: "다리 초입. 넓은 마당." },
  ],
  Grañón: [
    { n: "San Juan Bautista", t: "기부제", beds: 40, price: 0, book: false, v: true, memo: "성당 다락. 공동 식사와 저녁 나눔이 유명." },
  ],
  "Carrión de los Condes": [
    { n: "Albergue Santa María", t: "수도원", beds: 50, price: 10, book: false, v: true, memo: "수녀님들이 저녁에 노래를 불러줌." },
  ],
  Burgos: [
    { n: "Albergue Municipal de Burgos", t: "공립", beds: 150, price: 10, book: false, v: true, memo: "대성당 바로 옆. 시설 깨끗." },
  ],
  León: [
    { n: "Monasterio Santa María de Carbajal", t: "수도원", beds: 130, price: 8, book: false, v: true, memo: "베네딕토 수녀원. 저녁 기도 참여 가능." },
  ],
  Foncebadón: [
    { n: "Domus Dei", t: "기부제", beds: 18, price: 0, book: false, v: true, memo: "본당 운영. 다음 날 철의 십자가까지 2km." },
  ],
  Ponferrada: [
    { n: "San Nicolás de Flüe", t: "기부제", beds: 186, price: 0, book: false, v: true, memo: "규모가 커서 자리 걱정이 적음." },
  ],
  "O Cebreiro": [
    { n: "Albergue de O Cebreiro (Xunta)", t: "공립", beds: 104, price: 10, book: false, v: true, memo: "갈리시아 주 운영. 안개 자주 낌, 여름에도 쌀쌀." },
  ],
  Sarria: [
    { n: "Albergue de Sarria (Xunta)", t: "공립", beds: 40, price: 10, book: false, v: true, memo: "100km 시작점이라 오후엔 만석." },
    { n: "Casa Peltre", t: "사립", beds: 22, price: 15, book: true, v: false, memo: "예약 가능. 짐 배송 접수 대행." },
  ],
  Portomarín: [
    { n: "Albergue de Portomarín (Xunta)", t: "공립", beds: 110, price: 10, book: false, v: true, memo: "미뇨 강 전망. 계단 오르막 뒤 도착." },
  ],
  "Monte do Gozo": [
    { n: "Albergue Monte do Gozo (Xunta)", t: "공립", beds: 400, price: 10, book: false, v: true, memo: "산티아고 4.6km 전. 대성당 첨탑이 보이는 언덕." },
  ],
  "Santiago de Compostela": [
    { n: "Seminario Menor", t: "사립", beds: 177, price: 17, book: true, v: true, memo: "구시가 도보 15분. 도착 후 며칠 묵기 좋음." },
  ],
};

const SV_LABEL = { w: "식수", b: "바·식당", s: "상점", p: "약국", a: "ATM", x: "배낭배송" };

/* 목표 거리에 맞춰 숙소 있는 마을로 구간을 나눔 */
function planStages(startIdx, targetKm) {
  const stages = [];
  let cur = startIdx;
  let guard = 0;
  while (cur < END && guard++ < 100) {
    const target = TOWNS[cur].km + targetKm;
    let best = -1;
    let bestDiff = Infinity;
    for (let i = cur + 1; i <= END; i++) {
      if (TOWNS[i].beds <= 0 && i !== END) continue;
      const diff = Math.abs(TOWNS[i].km - target);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = i;
      }
    }
    if (best < 0) best = END;
    stages.push({ from: cur, to: best });
    cur = best;
  }
  // 마지막 날이 너무 짧으면 앞 구간에 합침
  if (stages.length > 1) {
    const last = stages[stages.length - 1];
    if (TOWNS[last.to].km - TOWNS[last.from].km < 6) {
      stages[stages.length - 2].to = last.to;
      stages.pop();
    }
  }
  return stages.map((s, i) => ({
    ...s,
    day: i + 1,
    dist: +(TOWNS[s.to].km - TOWNS[s.from].km).toFixed(1),
    gain: Math.max(0, TOWNS[s.to].el - TOWNS[s.from].el),
  }));
}

/* ── 조가비 표식 (산티아고 공식 표지의 방사형 부채꼴) ── */
function Shell({ size = 24, color = "var(--flecha)", rays = 9 }) {
  const lines = [];
  for (let i = 0; i < rays; i++) {
    const a = Math.PI + (Math.PI * (i + 0.5)) / rays;
    lines.push(
      <line key={i} x1="32" y1="52" x2={32 + Math.cos(a) * 30} y2={52 + Math.sin(a) * 30} />
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <g stroke={color} strokeWidth="5" strokeLinecap="round">
        {lines}
      </g>
    </svg>
  );
}

/* ── 고도 단면도 ── */
function Elevation({ fromIdx, toIdx, marks = [], height = 130 }) {
  const slice = TOWNS.slice(fromIdx, toIdx + 1);
  const kmA = slice[0].km;
  const kmB = slice[slice.length - 1].km;
  const span = Math.max(kmB - kmA, 0.1);
  const els = slice.map((t) => t.el);
  const lo = Math.min(...els) - 60;
  const hi = Math.max(...els) + 60;
  const W = 1000;
  const H = height;
  const x = (km) => ((km - kmA) / span) * W;
  const y = (el) => H - ((el - lo) / (hi - lo)) * (H - 18) - 8;
  const pts = slice.map((t) => `${x(t.km).toFixed(1)},${y(t.el).toFixed(1)}`).join(" ");
  const area = `0,${H} ${pts} ${W},${H}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="elev" preserveAspectRatio="none" role="img" aria-label="고도 단면도">
      <polygon points={area} fill="var(--ridge-fill)" />
      <polyline points={pts} fill="none" stroke="var(--ridge)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
      {marks.map((m, i) => (
        <g key={i}>
          <line x1={x(m.km)} y1="0" x2={x(m.km)} y2={H} stroke="var(--flecha)" strokeWidth="2" vectorEffect="non-scaling-stroke" opacity="0.7" />
        </g>
      ))}
    </svg>
  );
}

/* ── 세요(도장) ── */
function Sello({ town, day, tilt }) {
  const inks = ["var(--vino)", "var(--ink)", "var(--moss)"];
  const ink = inks[day % inks.length];
  const short = town.ko.split(" ")[0];
  return (
    <div className="sello" style={{ transform: `rotate(${tilt}deg)` }}>
      <svg viewBox="0 0 120 120" width="100%" height="100%">
        <circle cx="60" cy="60" r="52" fill="none" stroke={ink} strokeWidth="3" opacity="0.85" />
        <circle cx="60" cy="60" r="45" fill="none" stroke={ink} strokeWidth="1" strokeDasharray="3 4" opacity="0.7" />
        <g transform="translate(44,26) scale(0.5)" opacity="0.85">
          <g stroke={ink} strokeWidth="6" strokeLinecap="round">
            {Array.from({ length: 7 }).map((_, i) => {
              const a = Math.PI + (Math.PI * (i + 0.5)) / 7;
              return <line key={i} x1="32" y1="52" x2={32 + Math.cos(a) * 28} y2={52 + Math.sin(a) * 28} />;
            })}
          </g>
        </g>
        <text x="60" y="72" textAnchor="middle" fill={ink} className="sello-name">{short}</text>
        <text x="60" y="90" textAnchor="middle" fill={ink} className="sello-day">DÍA {String(day).padStart(2, "0")}</text>
      </svg>
    </div>
  );
}

export default function App() {
  const [routeKey, setRouteKey] = useState("full");
  const [targetKm, setTargetKm] = useState(24);
  const [tab, setTab] = useState("plan");
  const [selDay, setSelDay] = useState(1);
  const [journal, setJournal] = useState({});

  const route = ROUTES.find((r) => r.key === routeKey);
  const stages = useMemo(() => planStages(route.from, targetKm), [route.from, targetKm]);
  const total = +(TOWNS[END].km - TOWNS[route.from].km).toFixed(1);

  const doneStages = stages.filter((s) => journal[TOWNS[s.to].es]?.done);
  const walked = doneStages.reduce((a, s) => a + s.dist, 0);
  const lastIdx = doneStages.length ? Math.max(...doneStages.map((s) => s.to)) : route.from;
  const remaining = TOWNS[END].km - TOWNS[lastIdx].km;

  const stage = stages.find((s) => s.day === selDay) || stages[0];
  const sarriaKm = TOWNS[idxOf("Sarria")].km;

  const toggleDone = (es) =>
    setJournal((j) => ({ ...j, [es]: { ...(j[es] || { note: "" }), done: !j[es]?.done } }));
  const setNote = (es, note) =>
    setJournal((j) => ({ ...j, [es]: { ...(j[es] || { done: false }), note } }));

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=IBM+Plex+Sans+KR:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        :root{
          --ink:#12253F;        /* 사아코베오 코발트 */
          --ink-2:#1D3B5E;
          --granite:#E7E8E2;    /* 갈리시아 화강암 */
          --granite-2:#F2F2EE;
          --stone:#C6C8BE;
          --flecha:#F0B429;     /* 노란 화살표 — 길안내에만 사용 */
          --vino:#7A2E39;
          --moss:#3F5D4A;
          --ridge:#12253F;
          --ridge-fill:rgba(18,37,63,.12);
          --text:#1B2430;
          --muted:#6B7280;
        }
        *{box-sizing:border-box;}
        .app{
          font-family:'IBM Plex Sans KR',system-ui,sans-serif;
          color:var(--text); background:var(--granite);
          min-height:100vh; -webkit-font-smoothing:antialiased;
        }
        .mono{font-family:'IBM Plex Mono',monospace; font-variant-numeric:tabular-nums;}
        .serif{font-family:'Gowun Batang',serif;}

        /* ── 모호온(이정표) 헤더 ── */
        .mojon{background:var(--ink); color:#fff; padding:18px 20px 20px;}
        .mojon-top{display:flex; align-items:center; gap:10px; margin-bottom:14px;}
        .brand{font-family:'Gowun Batang',serif; font-size:19px; letter-spacing:.02em;}
        .brand span{color:var(--flecha);}
        .mojon-plate{
          border:2px solid rgba(240,180,41,.5); border-radius:4px;
          padding:12px 16px; display:flex; align-items:flex-end; justify-content:space-between; gap:12px;
        }
        .k-label{font-size:10px; letter-spacing:.28em; color:rgba(255,255,255,.6); margin-bottom:2px;}
        .k-num{font-family:'IBM Plex Mono',monospace; font-size:34px; font-weight:600; color:var(--flecha); line-height:1;}
        .k-unit{font-size:13px; color:rgba(255,255,255,.65); margin-left:6px;}
        .k-side{text-align:right; font-size:11px; color:rgba(255,255,255,.7); line-height:1.6;}
        .k-side b{font-family:'IBM Plex Mono',monospace; color:#fff; font-weight:500;}
        .bar{height:4px; background:rgba(255,255,255,.15); border-radius:2px; margin-top:12px; overflow:hidden;}
        .bar i{display:block; height:100%; background:var(--flecha);}

        /* ── 레이아웃 ── */
        .shell{max-width:1180px; margin:0 auto;}
        .body{padding:16px 16px 92px;}
        .nav{
          position:fixed; left:0; right:0; bottom:0; z-index:20;
          display:flex; background:#fff; border-top:1px solid var(--stone);
        }
        .nav button{
          flex:1; border:0; background:none; padding:10px 4px 14px; cursor:pointer;
          font-family:inherit; font-size:11px; color:var(--muted); display:flex;
          flex-direction:column; align-items:center; gap:5px; border-top:2px solid transparent; margin-top:-1px;
        }
        .nav button.on{color:var(--ink); border-top-color:var(--flecha); font-weight:600;}
        .nav i{font-style:normal; font-size:17px; line-height:1;}

        @media (min-width:860px){
          .shell{display:grid; grid-template-columns:250px 1fr; gap:0; align-items:start;}
          .mojon{grid-column:1/-1;}
          .nav{position:sticky; top:0; flex-direction:column; border-top:0; border-right:1px solid var(--stone);
               background:transparent; padding:20px 12px; height:auto;}
          .nav button{flex:none; flex-direction:row; justify-content:flex-start; gap:12px; font-size:14px;
                      padding:11px 14px; border-top:0; border-left:2px solid transparent; border-radius:0 6px 6px 0;}
          .nav button.on{background:#fff; border-left-color:var(--flecha);}
          .body{padding:22px 26px 60px;}
        }

        /* ── 공통 ── */
        h2.title{font-family:'Gowun Batang',serif; font-size:21px; margin:0 0 4px; font-weight:700;}
        .sub{font-size:13px; color:var(--muted); margin:0 0 18px;}
        .card{background:#fff; border:1px solid var(--stone); border-radius:8px; padding:14px 16px; margin-bottom:12px;}
        .eyebrow{font-size:10px; letter-spacing:.22em; color:var(--muted); text-transform:uppercase; margin-bottom:10px;}
        .row{display:flex; align-items:center; justify-content:space-between; gap:12px;}
        .chiprow{display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;}
        .chip{
          border:1px solid var(--stone); background:#fff; border-radius:999px; padding:8px 14px;
          font-family:inherit; font-size:13px; cursor:pointer; color:var(--text);
        }
        .chip.on{background:var(--ink); color:#fff; border-color:var(--ink);}
        .chip small{display:block; font-size:10px; opacity:.65;}
        input[type=range]{width:100%; accent-color:var(--ink); margin:10px 0 2px;}
        .slider-head{display:flex; align-items:baseline; justify-content:space-between;}
        .slider-val{font-family:'IBM Plex Mono',monospace; font-size:26px; font-weight:600;}
        .stat{display:flex; gap:22px; margin-top:14px; padding-top:14px; border-top:1px solid var(--stone);}
        .stat div{flex:1;}
        .stat b{display:block; font-family:'IBM Plex Mono',monospace; font-size:19px; font-weight:600;}
        .stat span{font-size:11px; color:var(--muted);}

        .elev{width:100%; height:110px; display:block;}

        /* ── 구간 목록 ── */
        .stage{
          display:flex; gap:14px; padding:13px 14px; background:#fff;
          border:1px solid var(--stone); border-radius:8px; margin-bottom:8px; cursor:pointer;
          text-align:left; width:100%; font-family:inherit; color:inherit;
        }
        .stage:hover{border-color:var(--ink);}
        .stage.on{border-color:var(--flecha); box-shadow:inset 3px 0 0 var(--flecha);}
        .stage.done{background:#FBFBF8;}
        .daynum{font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--muted); width:34px; flex:none; padding-top:2px;}
        .stage-main{flex:1; min-width:0;}
        .stage-to{font-weight:600; font-size:15px;}
        .stage-es{font-size:11px; color:var(--muted); margin-top:1px;}
        .stage-meta{font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--muted); margin-top:6px;}
        .stage-km{font-family:'IBM Plex Mono',monospace; font-weight:600; font-size:15px; flex:none; align-self:center;}

        /* ── 숙소 ── */
        .alb{border-bottom:1px solid var(--stone); padding:12px 0;}
        .alb:last-child{border-bottom:0; padding-bottom:0;}
        .alb-n{font-weight:600; font-size:14px;}
        .alb-memo{font-size:12.5px; color:var(--muted); margin-top:5px; line-height:1.55;}
        .tag{display:inline-block; font-size:10.5px; padding:2px 7px; border-radius:3px; margin-right:5px; letter-spacing:.02em;}
        .tag.pub{background:#E8EEF6; color:var(--ink);}
        .tag.don{background:#EDF1EC; color:var(--moss);}
        .tag.priv{background:#F6EFE4; color:#8A6420;}
        .tag.book{background:var(--flecha); color:var(--ink); font-weight:600;}
        .tag.sample{background:#F0F0EC; color:var(--muted);}
        .price{font-family:'IBM Plex Mono',monospace; font-weight:600;}

        .sv{display:flex; gap:6px; flex-wrap:wrap; margin-top:10px;}
        .sv span{font-size:11px; border:1px solid var(--stone); border-radius:3px; padding:2px 7px; color:var(--muted);}

        /* ── 기록 ── */
        .grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(96px,1fr)); gap:12px;}
        .sello{aspect-ratio:1; background:var(--granite-2); border-radius:4px; padding:4px;}
        .sello-name{font-family:'Gowun Batang',serif; font-size:19px; font-weight:700;}
        .sello-day{font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:.14em;}
        .empty-sello{aspect-ratio:1; border:1px dashed var(--stone); border-radius:4px; display:flex;
          align-items:center; justify-content:center; color:var(--stone); font-family:'IBM Plex Mono',monospace; font-size:11px;}
        textarea{
          width:100%; border:1px solid var(--stone); border-radius:6px; padding:10px; font-family:inherit;
          font-size:13.5px; resize:vertical; min-height:64px; color:var(--text); background:var(--granite-2);
        }
        textarea:focus, .chip:focus-visible, .stage:focus-visible, .nav button:focus-visible, button:focus-visible{
          outline:2px solid var(--flecha); outline-offset:2px;
        }
        .btn{
          border:1px solid var(--ink); background:#fff; color:var(--ink); border-radius:6px;
          padding:9px 15px; font-family:inherit; font-size:13px; cursor:pointer; font-weight:500;
        }
        .btn.on{background:var(--ink); color:#fff;}
        .notice{
          background:#FDF6E3; border:1px solid #E9D9A8; border-radius:6px; padding:11px 13px;
          font-size:12.5px; line-height:1.6; color:#6B5518; margin-bottom:14px;
        }
        .notice b{color:#4A3A0E;}
      `}</style>

      <div className="shell">
        {/* 이정표 헤더 */}
        <header className="mojon">
          <div className="mojon-top">
            <Shell size={26} />
            <div className="brand">길동무 <span>·</span> Camino</div>
          </div>
          <div className="mojon-plate">
            <div>
              <div className="k-label">SANTIAGO</div>
              <div>
                <span className="k-num">{remaining.toFixed(3).replace(".", ",")}</span>
                <span className="k-unit">km 남음</span>
              </div>
            </div>
            <div className="k-side">
              걸은 거리 <b>{walked.toFixed(1)}</b> km
              <br />
              전체 <b>{total}</b> km · <b>{stages.length}</b>일
            </div>
          </div>
          <div className="bar">
            <i style={{ width: `${Math.min(100, (walked / total) * 100)}%` }} />
          </div>
        </header>

        <nav className="nav">
          {[
            ["plan", "◷", "일정"],
            ["stay", "⌂", "숙소"],
            ["road", "◺", "길"],
            ["book", "◍", "기록"],
          ].map(([k, ic, label]) => (
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>
              <i>{ic}</i>
              {label}
            </button>
          ))}
        </nav>

        <main className="body">
          {/* ───────── 일정 ───────── */}
          {tab === "plan" && (
            <>
              <h2 className="title">일정 세우기</h2>
              <p className="sub">출발지와 하루 목표 거리를 정하면 숙소가 있는 마을 기준으로 구간을 나눕니다.</p>

              <div className="chiprow">
                {ROUTES.map((r) => (
                  <button
                    key={r.key}
                    className={`chip ${routeKey === r.key ? "on" : ""}`}
                    onClick={() => {
                      setRouteKey(r.key);
                      setSelDay(1);
                    }}
                  >
                    {r.label}
                    <small>{r.sub}</small>
                  </button>
                ))}
              </div>

              <div className="card">
                <div className="slider-head">
                  <div className="eyebrow" style={{ marginBottom: 0 }}>하루 목표 거리</div>
                  <div className="slider-val">{targetKm}<span style={{ fontSize: 13, color: "var(--muted)" }}> km</span></div>
                </div>
                <input
                  type="range"
                  min="14"
                  max="32"
                  value={targetKm}
                  onChange={(e) => {
                    setTargetKm(+e.target.value);
                    setSelDay(1);
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)" }}>
                  <span>천천히 14km</span>
                  <span>빠르게 32km</span>
                </div>
                <div className="stat">
                  <div><b>{stages.length}</b><span>필요한 날수</span></div>
                  <div><b>{total}</b><span>총 거리 (km)</span></div>
                  <div><b>{Math.round(total / stages.length)}</b><span>하루 평균 (km)</span></div>
                </div>
              </div>

              <div className="card">
                <div className="eyebrow">고도 · 노란 선이 하루 도착지</div>
                <Elevation
                  fromIdx={route.from}
                  toIdx={END}
                  marks={stages.map((s) => ({ km: TOWNS[s.to].km }))}
                />
                <div className="row mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
                  <span>{TOWNS[route.from].ko}</span>
                  <span>산티아고</span>
                </div>
              </div>

              {total >= 100 && (
                <div className="notice">
                  <b>콤포스텔라 발급 요건 충족.</b> 도보 100km 이상 구간입니다. 사리아 이후부터는 하루에 도장을 <b>2개씩</b> 받아야 하니, 카페나 성당에서 꼭 챙기세요.
                </div>
              )}

              <div className="eyebrow">구간</div>
              {stages.map((s) => {
                const done = journal[TOWNS[s.to].es]?.done;
                return (
                  <button
                    key={s.day}
                    className={`stage ${selDay === s.day ? "on" : ""} ${done ? "done" : ""}`}
                    onClick={() => {
                      setSelDay(s.day);
                      setTab("road");
                    }}
                  >
                    <div className="daynum">{done ? "✓" : String(s.day).padStart(2, "0")}</div>
                    <div className="stage-main">
                      <div className="stage-to">{TOWNS[s.to].ko}</div>
                      <div className="stage-es">{TOWNS[s.to].es}</div>
                      <div className="stage-meta">
                        {TOWNS[s.from].ko} 출발 · 오르막 {s.gain}m · 침대 {TOWNS[s.to].beds}
                      </div>
                    </div>
                    <div className="stage-km">{s.dist}<span style={{ fontSize: 11, color: "var(--muted)" }}> km</span></div>
                  </button>
                );
              })}
            </>
          )}

          {/* ───────── 숙소 ───────── */}
          {tab === "stay" && (
            <>
              <h2 className="title">묵을 곳</h2>
              <p className="sub">계획한 도착 마을의 알베르게입니다. 예약 표시가 없으면 선착순이라 오후 2시 전 도착이 안전합니다.</p>

              <div className="notice">
                아래 숙소 정보는 <b>프로토타입용 샘플</b>입니다. 실제 서비스에서는 침대 수·요금·개방 기간이 매년 바뀌므로 외부 데이터 연동이 필요합니다.
              </div>

              {stages.map((s) => {
                const t = TOWNS[s.to];
                const list = ALBERGUES[t.es];
                return (
                  <div className="card" key={s.day}>
                    <div className="row" style={{ marginBottom: 10 }}>
                      <div>
                        <div className="stage-to">{t.ko}</div>
                        <div className="stage-es">{s.day}일차 · {t.es}</div>
                      </div>
                      <div className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>침대 약 {t.beds}</div>
                    </div>

                    {list ? (
                      list.map((a) => (
                        <div className="alb" key={a.n}>
                          <div className="row">
                            <div className="alb-n">{a.n}</div>
                            <div className="price">{a.price === 0 ? "기부제" : `€${a.price}`}</div>
                          </div>
                          <div style={{ marginTop: 6 }}>
                            <span className={`tag ${a.t === "공립" ? "pub" : a.t === "기부제" ? "don" : "priv"}`}>{a.t}</span>
                            <span className="tag sample">{a.beds}침대</span>
                            {a.book ? <span className="tag book">예약 가능</span> : <span className="tag sample">선착순</span>}
                          </div>
                          <div className="alb-memo">{a.memo}</div>
                        </div>
                      ))
                    ) : (
                      <div className="alb-memo">
                        공립·사립 알베르게가 있는 마을입니다. 상세 정보는 데이터 연동 후 표시됩니다.
                      </div>
                    )}

                    <div className="sv">
                      {t.sv.split("").map((c) => (
                        <span key={c}>{SV_LABEL[c]}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {/* ───────── 길 ───────── */}
          {tab === "road" && stage && (
            <>
              <h2 className="title">{stage.day}일차 · {TOWNS[stage.to].ko}</h2>
              <p className="sub">{TOWNS[stage.from].ko} → {TOWNS[stage.to].ko} · {stage.dist} km</p>

              <div className="chiprow">
                {stages.map((s) => (
                  <button key={s.day} className={`chip ${s.day === stage.day ? "on" : ""}`} onClick={() => setSelDay(s.day)}>
                    {s.day}일차
                  </button>
                ))}
              </div>

              <div className="card">
                <div className="eyebrow">고도 단면</div>
                <Elevation fromIdx={stage.from} toIdx={stage.to} height={150} />
                <div className="stat">
                  <div><b>{stage.dist}</b><span>거리 (km)</span></div>
                  <div><b>+{stage.gain}</b><span>오르막 (m)</span></div>
                  <div><b>{Math.round((stage.dist / 4.2) * 60 + stage.gain / 8)}</b><span>예상 소요 (분)</span></div>
                </div>
              </div>

              <div className="eyebrow">지나가는 마을</div>
              {TOWNS.slice(stage.from, stage.to + 1).map((t, i) => (
                <div className="card" key={t.es} style={{ padding: "12px 14px" }}>
                  <div className="row">
                    <div>
                      <div className="stage-to" style={{ fontSize: 14 }}>
                        {t.ko}
                        {i === 0 && <span className="tag pub" style={{ marginLeft: 8 }}>출발</span>}
                        {t.es === TOWNS[stage.to].es && <span className="tag book" style={{ marginLeft: 8 }}>도착</span>}
                      </div>
                      <div className="stage-es">{t.es} · 해발 {t.el}m</div>
                    </div>
                    <div className="mono" style={{ fontSize: 13, color: "var(--muted)" }}>
                      +{(t.km - TOWNS[stage.from].km).toFixed(1)}km
                    </div>
                  </div>
                  <div className="sv">
                    {t.sv.split("").map((c) => (
                      <span key={c}>{SV_LABEL[c]}</span>
                    ))}
                  </div>
                </div>
              ))}

              <div className="notice">
                실제 앱에서는 이 구간의 GPX 트랙과 지도 타일을 미리 내려받아 <b>비행기 모드에서도</b> 화살표·갈림길·식수대 위치를 볼 수 있게 만듭니다. 메세타 구간처럼 통신이 끊기는 곳이 많습니다.
              </div>
            </>
          )}

          {/* ───────── 기록 ───────── */}
          {tab === "book" && (
            <>
              <h2 className="title">순례자 여권</h2>
              <p className="sub">하루를 마치면 도착 표시를 하세요. 도장이 여권에 찍힙니다.</p>

              <div className="card">
                <div className="stat" style={{ borderTop: 0, paddingTop: 0, marginTop: 0 }}>
                  <div><b>{doneStages.length}</b><span>마친 날</span></div>
                  <div><b>{walked.toFixed(1)}</b><span>걸은 거리 (km)</span></div>
                  <div><b>{Math.round((walked / total) * 100)}</b><span>진행률 (%)</span></div>
                </div>
              </div>

              <div className="eyebrow">모은 도장</div>
              <div className="grid" style={{ marginBottom: 22 }}>
                {stages.map((s) =>
                  journal[TOWNS[s.to].es]?.done ? (
                    <Sello key={s.day} town={TOWNS[s.to]} day={s.day} tilt={((s.day * 37) % 13) - 6} />
                  ) : (
                    <div className="empty-sello" key={s.day}>{String(s.day).padStart(2, "0")}</div>
                  )
                )}
              </div>

              <div className="eyebrow">하루 기록</div>
              {stages.map((s) => {
                const es = TOWNS[s.to].es;
                const e = journal[es] || {};
                return (
                  <div className="card" key={s.day}>
                    <div className="row" style={{ marginBottom: 10 }}>
                      <div>
                        <div className="stage-to">{s.day}일차 · {TOWNS[s.to].ko}</div>
                        <div className="stage-es">{s.dist} km · {TOWNS[s.from].ko}에서 출발</div>
                      </div>
                      <button className={`btn ${e.done ? "on" : ""}`} onClick={() => toggleDone(es)}>
                        {e.done ? "도착함" : "도착 표시"}
                      </button>
                    </div>
                    {e.done && (
                      <>
                        <textarea
                          value={e.note || ""}
                          placeholder="오늘 길에서 있었던 일을 적어두세요."
                          onChange={(ev) => setNote(es, ev.target.value)}
                        />
                        {TOWNS[s.to].km > sarriaKm && (
                          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 8 }}>
                            사리아 이후 구간 — 오늘 도장 2개를 받았는지 확인하세요.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
