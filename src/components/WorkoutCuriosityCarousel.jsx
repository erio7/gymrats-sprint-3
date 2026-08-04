import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock3, Flame, Lightbulb, Route, Timer } from 'lucide-react';
import { getWorkoutCuriosities } from '../lib/workoutInsights';

const FACT_ICONS = {
  calories: Flame,
  distance: Route,
  duration: Timer,
  time: Clock3,
};

export function WorkoutCuriosityCarousel({ datasetData, compact = false }) {
  const facts = useMemo(() => getWorkoutCuriosities(datasetData), [datasetData]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (activeIndex >= facts.length) setActiveIndex(0);
  }, [activeIndex, facts.length]);

  useEffect(() => {
    if (paused || facts.length < 2) return undefined;
    const intervalId = window.setInterval(() => {
      setActiveIndex(index => (index + 1) % facts.length);
    }, 8_000);
    return () => window.clearInterval(intervalId);
  }, [facts.length, paused]);

  const move = direction => setActiveIndex(index => (index + direction + facts.length) % facts.length);
  const fact = facts[activeIndex];
  const FactIcon = fact ? FACT_ICONS[fact.type] || Lightbulb : Lightbulb;

  return <article
    className={`relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#251044] via-[#40108C] to-brand text-white shadow-lg ${compact ? 'workout-curiosity-compact min-h-[250px] p-4' : 'min-h-[280px] p-4 min-[1700px]:p-5'}`}
    onMouseEnter={() => setPaused(true)}
    onMouseLeave={() => setPaused(false)}
  >
    <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full bg-brand-300/30 blur-[55px]" />
    <div className="absolute -left-16 -bottom-20 w-48 h-48 rounded-full bg-accent/20 blur-[55px]" />
    <span className="absolute -right-3 -bottom-10 text-[150px] font-black leading-none text-white/[0.045] select-none">{activeIndex + 1}</span>

    <div className="relative h-full flex flex-col">
      <div className="curiosity-header flex items-center justify-between gap-3 min-[1280px]:max-[1699px]:flex-col min-[1280px]:max-[1699px]:items-stretch">
        <div className="flex items-center gap-2">
          <span className="curiosity-icon w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center"><Lightbulb className="w-4 h-4 text-accent" /></span>
          <div><p className="text-[9px] uppercase tracking-[0.2em] font-black text-accent">Curiosidades da Sprint</p><p className="text-[10px] text-white/50 font-bold mt-0.5">Treinos individuais válidos</p></div>
        </div>
        {facts.length > 1 && <div className="curiosity-controls flex gap-1 min-[1280px]:max-[1699px]:self-end">
          <CarouselButton label="Curiosidade anterior" onClick={() => move(-1)}><ChevronLeft className="w-3.5 h-3.5" /></CarouselButton>
          <CarouselButton label="Próxima curiosidade" onClick={() => move(1)}><ChevronRight className="w-3.5 h-3.5" /></CarouselButton>
        </div>}
      </div>

      {fact ? <div key={fact.id} className={`curiosity-fact relative flex-1 flex flex-col justify-center animate-fade-in ${compact ? 'py-3' : 'py-5'}`} aria-live="polite">
        <div className="flex items-center gap-2 text-accent">
          <FactIcon className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-[0.18em] font-black">{fact.eyebrow}</span>
        </div>
        <strong className={`curiosity-value ${compact ? 'text-3xl' : 'text-3xl min-[1700px]:text-4xl'} font-black tracking-tight mt-2`}>{fact.value}</strong>
        <h3 className="curiosity-title text-base font-black mt-2">{fact.title}</h3>
        <p className="curiosity-description text-xs leading-relaxed text-white/65 mt-1.5 max-w-sm">{fact.description}</p>
      </div> : <div className="flex-1 flex flex-col justify-center py-6">
        <p className="text-lg font-black">As curiosidades chegam com os treinos.</p>
        <p className="text-xs text-white/60 mt-2">Quando o Dataset tiver registros válidos, os destaques individuais aparecerão aqui.</p>
      </div>}

      {facts.length > 1 && <div className="curiosity-pagination relative flex items-center gap-1.5" aria-label={`${activeIndex + 1} de ${facts.length}`}>
        {facts.map((item, index) => <button
          key={item.id}
          type="button"
          onClick={() => setActiveIndex(index)}
          aria-label={`Ver ${item.eyebrow}`}
          className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-7 bg-accent' : 'w-1.5 bg-white/25 hover:bg-white/45'}`}
        />)}
        <span className="ml-auto text-[9px] font-black text-white/45 tabular-nums">{activeIndex + 1}/{facts.length}</span>
      </div>}
    </div>
  </article>;
}

function CarouselButton({ label, onClick, children }) {
  return <button type="button" onClick={onClick} aria-label={label} title={label} className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.08] flex items-center justify-center text-white/70 hover:bg-white/[0.15] hover:text-white transition-colors">
    {children}
  </button>;
}
