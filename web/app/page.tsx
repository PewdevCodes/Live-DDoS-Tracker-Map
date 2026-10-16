"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity, Bell, ChevronDown, CircleHelp, Crosshair, Eye, Filter, Gauge,
  Layers3, Menu, Radio, ShieldAlert, SlidersHorizontal, Zap,
} from "lucide-react";
import GlobeTest, { TEST_ROUTES } from "@/components/GlobeTest";

type LayerFilter = "ALL" | "L3" | "L7";

export default function Home() {
  const [layer, setLayer] = useState<LayerFilter>("ALL");
  const [autoRotate, setAutoRotate] = useState(true);
  const [intensity, setIntensity] = useState(0.72);
  const [selected, setSelected] = useState(TEST_ROUTES[0]);
  const [feedRoutes, setFeedRoutes] = useState(TEST_ROUTES.slice(0, 4));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFeedRoutes((current) => {
        const next = TEST_ROUTES.find((route) => !current.some((item) => item.order === route.order));
        return next ? [...current, next] : current;
      });
    }, 8000);
    return () => window.clearInterval(timer);
  }, []);

  const visibleRoutes = useMemo(
    () => feedRoutes.filter((route) => layer === "ALL" || route.layer === layer),
    [feedRoutes, layer],
  );
  const handleLayerChange = (nextLayer: LayerFilter) => {
    setLayer(nextLayer);
    const nextSelected = feedRoutes.find((route) => nextLayer === "ALL" || route.layer === nextLayer);
    if (nextSelected) setSelected(nextSelected);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070a0f] text-slate-200 xl:h-screen">
      <header className="border-b border-white/[0.08] bg-[#090d13]/95">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-cyan-400/40 bg-cyan-400/10 text-cyan-300"><ShieldAlert size={17} strokeWidth={1.8} /></div>
            <div className="min-w-0"><p className="truncate text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-300">Aegis / network watch</p><h1 className="truncate text-xs font-medium tracking-wide text-white">Global Threat Observatory</h1></div>
          </div>
          <nav className="hidden items-center gap-7 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 md:flex"><span className="text-slate-200">Overview</span><span>Routes</span><span>Methodology</span></nav>
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 border border-emerald-400/20 bg-emerald-400/[0.06] px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-emerald-300 sm:flex"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />Stream ready</div>
            <button aria-label="Notifications" className="border border-white/10 p-1.5 text-slate-400 hover:text-white"><Bell size={15} /></button>
            <button aria-label="Open menu" className="border border-white/10 p-1.5 text-slate-400 md:hidden"><Menu size={15} /></button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px] flex-col px-4 pb-4 pt-4 sm:px-6 lg:px-8 xl:h-[calc(100vh-3.5rem)] xl:min-h-0">
        <div className="mb-3 flex shrink-0 flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div><p className="mb-1.5 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.24em] text-cyan-300/80"><span className="h-1 w-1 bg-cyan-300" />Situation overview / 01</p><h2 className="text-xl font-medium tracking-tight text-white sm:text-2xl">Global route activity</h2><p className="mt-1 text-[11px] text-slate-500">A visual sample of aggregated attack patterns from Cloudflare Radar.</p></div>
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-slate-500"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />Updated moments ago<ChevronDown size={13} /></div>
        </div>

        <div className="grid gap-3 xl:min-h-0 xl:flex-1 xl:grid-cols-[220px_minmax(0,1fr)_250px]">
          <aside className="order-2 flex flex-col gap-3 xl:order-1 xl:min-h-0 xl:overflow-y-auto">
            <Panel eyebrow="Selected route" icon={<Crosshair size={14} />}>
              <button className="mt-4 flex items-center gap-2.5 text-left" onClick={() => setSelected(selected)} aria-label="Selected route">
                <div className="flex h-10 w-10 items-center justify-center border border-cyan-300/30 bg-cyan-300/10 font-mono text-xs text-cyan-200">{selected.origin}</div><div className="text-slate-600">→</div><div className="flex h-10 w-10 items-center justify-center border border-violet-300/30 bg-violet-300/10 font-mono text-xs text-violet-200">{selected.target}</div>
              </button>
              <p className="mt-3 text-[9px] uppercase tracking-[0.2em] text-slate-500">Simulated route sample</p><p className="mt-1 text-xs text-white">{selected.origin} <span className="text-slate-600">to</span> {selected.target}</p>
              <div className="mt-4 grid grid-cols-2 border-t border-white/[0.08] pt-3"><Metric label="Layer" value={selected.layer} /><Metric label="Class" value={selected.kind} /></div>
            </Panel>
            <Panel eyebrow="Signal notes" icon={<CircleHelp size={14} />}><p className="mt-3 text-[11px] leading-5 text-slate-400">Origin country can be spoofed and does not represent an attacker location.</p><div className="mt-3 flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-slate-500"><Eye size={12} />Centroid routes are illustrative</div></Panel>
          </aside>

          <section className="order-1 min-h-[420px] border border-white/[0.08] bg-[#080d14] xl:order-2 xl:min-h-0">
            <div className="relative h-[min(62vh,590px)] min-h-[420px] overflow-hidden xl:h-full xl:min-h-0">
              <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(125,211,252,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,.08)_1px,transparent_1px)] [background-size:44px_44px]" />
              <div className="absolute left-4 top-4 z-10 flex items-center gap-2 border border-white/10 bg-[#080d14]/80 px-2.5 py-1.5 text-[9px] uppercase tracking-[0.18em] text-slate-400 backdrop-blur-sm"><Layers3 size={12} className="text-cyan-300" />Route plane / simulated</div>
              <GlobeTest routes={visibleRoutes} autoRotate={autoRotate} intensity={intensity} />
              <div className="absolute bottom-4 left-4 z-10 flex items-center gap-4 text-[9px] uppercase tracking-[0.14em] text-slate-500"><span className="flex items-center gap-2"><i className="h-1.5 w-1.5 bg-cyan-300" />Layer 7</span><span className="flex items-center gap-2"><i className="h-1.5 w-1.5 bg-violet-300" />Layer 3</span></div>
            </div>
          </section>

          <aside className="order-3 flex flex-col gap-3 xl:min-h-0 xl:overflow-y-auto">
            <Panel eyebrow="Visualization controls" icon={<SlidersHorizontal size={14} />}>
              <div className="mt-4 space-y-3.5">
                <Control label="Layers"><span className="flex gap-1">{(["ALL", "L3", "L7"] as const).map((item) => <button key={item} onClick={() => handleLayerChange(item)} className={`border px-2 py-1 font-mono text-[9px] ${layer === item ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-200" : "border-white/10 text-slate-600"}`}>{item}</button>)}</span></Control>
                <Control label="Intensity"><input aria-label="Arc intensity" type="range" min="0.2" max="1" step="0.01" value={intensity} onChange={(event) => setIntensity(Number(event.target.value))} className="w-20 accent-cyan-300" /></Control>
                <Control label="Auto rotate"><button aria-pressed={autoRotate} aria-label="Toggle auto rotate" onClick={() => setAutoRotate((value) => !value)} className={`h-4 w-7 rounded-full p-0.5 transition ${autoRotate ? "bg-cyan-300/80" : "bg-slate-700"}`}><span className={`block h-3 w-3 rounded-full bg-[#071018] transition ${autoRotate ? "translate-x-3" : ""}`} /></button></Control>
              </div>
              <div className="mt-4 flex w-full items-center justify-center gap-2 border border-white/10 py-2 text-[9px] font-semibold uppercase tracking-[0.17em] text-slate-300"><Filter size={12} />{layer === "ALL" ? "All routes visible" : `${layer} routes visible`}</div>
            </Panel>
            <Panel eyebrow="Live event feed" icon={<Zap size={14} />}>
              <div className="mt-1 divide-y divide-white/[0.07]">{visibleRoutes.map((event) => <button key={event.order} onClick={() => setSelected(event)} className={`flex w-full items-center justify-between py-2.5 text-left transition hover:bg-white/[0.03] ${selected.order === event.order ? "bg-white/[0.03]" : ""}`}><div className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${event.layer === "L7" ? "bg-cyan-300" : "bg-violet-300"}`} /><span className="font-mono text-[10px] text-slate-300">{event.origin} → {event.target}</span><span className="text-[8px] uppercase text-slate-600">{event.layer}</span></div><span className="font-mono text-[9px] text-slate-600">{event.time}</span></button>)}</div>
              <div className="mt-1 border-t border-white/[0.07] pt-2 text-[9px] uppercase tracking-[0.15em] text-slate-500">Simulated feed / aggregated source</div>
            </Panel>
          </aside>
        </div>

        <div className="mt-3 grid shrink-0 gap-3 md:grid-cols-[minmax(0,1fr)_235px]">
          <section className="grid grid-cols-1 border border-white/[0.08] bg-[#090d13] sm:grid-cols-3">{[{ label: "Simulated events", value: feedRoutes.length.toString(), detail: "this session", icon: Activity }, { label: "Active routes", value: visibleRoutes.length.toString(), detail: "visualized now", icon: Radio }, { label: "Peak throughput", value: "—", detail: "not measured", icon: Gauge }].map(({ label, value, detail, icon: Icon }) => <div key={label} className="border-b border-white/[0.08] p-3 last:border-0 sm:border-b-0 sm:border-r sm:last:border-r-0"><div className="flex items-center justify-between"><span className="text-[9px] uppercase tracking-[0.16em] text-slate-500">{label}</span><Icon size={14} className="text-cyan-300/70" /></div><div className="mt-2 font-mono text-xl text-white">{value}</div><div className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-slate-600">{detail}</div></div>)}</section>
          <section className="border border-white/[0.08] bg-[#090d13] p-3"><p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">Data classification</p><div className="mt-2 flex items-center gap-2 text-[11px] text-cyan-200"><span className="h-2 w-2 bg-cyan-300" />Simulated live view</div><p className="mt-1.5 text-[9px] leading-4 text-slate-600">Events are generated from Cloudflare Radar aggregates, not individual attacks.</p></section>
        </div>
      </div>
    </main>
  );
}

function Panel({ eyebrow, icon, children }: { eyebrow: string; icon: ReactNode; children: ReactNode }) {
  return <section className="border border-white/[0.08] bg-[#090d13] p-3.5"><div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">{icon}<span>{eyebrow}</span></div>{children}</section>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[9px] uppercase tracking-[0.14em] text-slate-600">{label}</p><p className="mt-1 font-mono text-xs text-slate-200">{value}</p></div>;
}

function Control({ label, children }: { label: string; children: ReactNode }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-[11px] text-slate-400">{label}</span>{children}</div>;
}
