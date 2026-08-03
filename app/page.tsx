import { brand } from "@/config/brand";
import { CalculatorCTA } from "@/components/CalculatorCTA";
import { ToolGrid } from "@/components/ToolGrid";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-granite text-text">
      <header className="bg-ink text-white px-6 py-5">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <ShellIcon />
          <span className="font-display text-lg">{brand.nameKo}</span>
        </div>

        <div className="mx-auto mt-4 max-w-3xl rounded border border-flecha/40 px-4 py-3">
          <div className="text-[10px] tracking-[0.3em] text-white/60">
            SANTIAGO DE COMPOSTELA
          </div>
          <div className="font-mono text-3xl font-semibold tabular-nums text-flecha">
            773,1<span className="ml-2 text-sm text-white/70">km</span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-display text-2xl leading-snug text-balance">
          {brand.taglineKo}
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-muted">
          출국 90일 전 코스 선정부터 현지 도보, 귀국 후 기록까지 — 한국인
          순례자를 위한 카미노 데 산티아고 동반 서비스입니다.
        </p>

        <CalculatorCTA />

        <div className="mt-12">
          <h2 className="mb-1 font-display text-lg text-text">무료 도구·기록</h2>
          <p className="mb-4 text-[14px] text-muted">전부 가입 없이 바로 씁니다.</p>
          <ToolGrid />
        </div>
      </section>
    </main>
  );
}

function ShellIcon() {
  const rays = 9;
  const lines = Array.from({ length: rays }, (_, i) => {
    const angle = Math.PI + (Math.PI * (i + 0.5)) / rays;
    const x2 = 32 + Math.cos(angle) * 26;
    const y2 = 48 + Math.sin(angle) * 26;
    return <line key={i} x1={32} y1={48} x2={x2} y2={y2} />;
  });
  return (
    <svg width="22" height="22" viewBox="0 0 64 64" aria-hidden="true">
      <g stroke="currentColor" className="text-flecha" strokeWidth="5" strokeLinecap="round">
        {lines}
      </g>
    </svg>
  );
}
