import { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { CalendarDays, Flag, Trophy } from 'lucide-react';
import { buildDailyLeaderboard } from '../lib/dailyLeaderboard';
import { buildSprintJourney, getSaoPauloDateId } from '../lib/sprintJourney';

const WEEKDAYS = ['S', 'D', 'S', 'T', 'Q', 'Q', 'S'];

const toDateId = date => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

const formatDate = dateId => new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  timeZone: 'UTC',
}).format(new Date(`${dateId}T12:00:00Z`)).replace('.', '');

export function SprintJourney({ startDate, endDate, datasetData = [], compact = false }) {
  const [todayDateId, setTodayDateId] = useState(() => getSaoPauloDateId());
  const startDateId = toDateId(startDate);
  const endDateId = toDateId(endDate);
  const journey = useMemo(() => buildSprintJourney(startDateId, endDateId, todayDateId), [endDateId, startDateId, todayDateId]);
  const leaderboardByDate = useMemo(() => buildDailyLeaderboard(datasetData, startDateId, endDateId), [datasetData, endDateId, startDateId]);
  const weeks = Array.from({ length: Math.ceil(journey.totalDays / 7) }, (_, index) => journey.days.slice(index * 7, index * 7 + 7));

  useEffect(() => {
    const intervalId = window.setInterval(() => setTodayDateId(getSaoPauloDateId()), 60 * 60 * 1_000);
    return () => window.clearInterval(intervalId);
  }, []);

  return <article className={`panel w-full h-full min-h-[280px] overflow-hidden flex flex-col ${compact ? 'sprint-journey-compact p-3' : 'p-4 min-[1700px]:p-5'}`}>
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-brand">
        <CalendarDays className="w-4 h-4 shrink-0" />
        <p className="text-[9px] uppercase tracking-[0.2em] font-black">Calendário da Sprint</p>
      </div>
      <strong className="text-base font-black text-[#17131F] tabular-nums">{journey.elapsedDays}<span className="text-[9px] text-[#91889B]">/{journey.totalDays}</span></strong>
    </div>

    <div className={`journey-progress ${compact ? 'mt-2' : 'mt-3.5'}`}>
      <div className="flex items-center justify-between gap-3 mb-1.5"><span className="text-[9px] uppercase tracking-wider font-black text-[#81778D]">Percurso concluído</span><span className="text-[10px] font-black text-brand">{Math.round(journey.progress)}%</span></div>
      <div className={`${compact ? 'h-1.5' : 'h-2'} rounded-full bg-[#EEEAF2] overflow-hidden`}><div className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-[width] duration-700" style={{ width: `${journey.progress}%` }} /></div>
    </div>

    <div className={`journey-grid flex-1 content-evenly ${compact ? 'mt-2 gap-y-1' : 'mt-4 gap-y-1.5'} grid grid-cols-[14px_repeat(7,minmax(0,1fr))] gap-x-1 items-center`}>
      <span />
      {WEEKDAYS.map((day, index) => <span key={`${day}-${index}`} className="text-center text-[7px] sm:text-[8px] uppercase font-black text-[#91889B]">{day}</span>)}
      {weeks.map((week, weekIndex) => <JourneyWeek key={weekIndex} week={week} weekIndex={weekIndex} totalDays={journey.totalDays} compact={compact} leaderboardByDate={leaderboardByDate} />)}
    </div>

  </article>;
}

function JourneyWeek({ week, weekIndex, totalDays, compact, leaderboardByDate }) {
  const cells = [...week, ...Array.from({ length: 7 - week.length }, () => null)];
  return <>
    <span className="text-[8px] font-black text-[#81778D]">S{weekIndex + 1}</span>
    {cells.map((day, index) => day ? <JourneyDayTooltip key={day.dateId} day={day} ranking={leaderboardByDate[day.dateId] || []}>
      <span
        aria-label={`Dia ${day.sprintDay} da Sprint, ${formatDate(day.dateId)}. Passe o mouse para ver o ranking acumulado.`}
        className={`journey-day relative ${compact ? 'w-[22px] h-5 text-[8px]' : 'h-6 sm:h-7 text-[8px] sm:text-[9px]'} rounded-md flex items-center justify-center font-black border transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-md hover:shadow-brand/15 ${day.status === 'today' ? 'bg-brand border-brand text-white shadow-md shadow-brand/20' : day.status === 'complete' ? 'bg-brand-50 border-brand-100 text-brand' : 'bg-[#FAF9FC] border-[#EEEAF2] text-[#AAA2B2]'} ${day.sprintDay === totalDays ? 'ring-1 ring-[#00A97A]/40' : ''}`}
      >
        {day.sprintDay}
        {day.sprintDay === totalDays && <Flag className="absolute right-0 top-0 w-2 h-2 text-[#00A97A] fill-white" />}
      </span>
    </JourneyDayTooltip> : <span key={`empty-${weekIndex}-${index}`} />)}
  </>;
}

function JourneyDayTooltip({ day, ranking, children }) {
  const [tooltip, setTooltip] = useState(null);
  const [pinned, setPinned] = useState(false);
  const triggerRef = useRef(null);

  const showTooltip = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = Math.min(264, window.innerWidth - 24);
    const estimatedHeight = ranking.length ? 224 : 118;
    const placeAbove = rect.top >= estimatedHeight + 12;
    const x = Math.min(window.innerWidth - width / 2 - 12, Math.max(width / 2 + 12, rect.left + rect.width / 2));
    setTooltip({ x, y: placeAbove ? rect.top - 8 : rect.bottom + 8, width, placeAbove });
  };

  const closeTooltip = () => {
    setPinned(false);
    setTooltip(null);
  };

  useEffect(() => {
    if (!pinned) return undefined;
    const handlePointerDown = event => {
      if (!triggerRef.current?.contains(event.target)) closeTooltip();
    };
    const handleKeyDown = event => {
      if (event.key === 'Escape') closeTooltip();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', closeTooltip, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', closeTooltip, true);
    };
  }, [pinned]);

  const togglePinned = () => {
    setPinned(wasPinned => {
      const nextPinned = !wasPinned;
      if (nextPinned) showTooltip();
      else setTooltip(null);
      return nextPinned;
    });
  };

  return <>
    <span ref={triggerRef} className="justify-self-center" onMouseEnter={showTooltip} onMouseLeave={() => { if (!pinned) setTooltip(null); }} onClick={togglePinned}>
      {children}
    </span>
    {tooltip && ReactDOM.createPortal(<div className="fixed z-[9999] pointer-events-none" style={{ left: tooltip.x, top: tooltip.y, width: tooltip.width, transform: tooltip.placeAbove ? 'translate(-50%, -100%)' : 'translateX(-50%)' }}>
      <div className="rounded-2xl border border-brand-100 bg-white/95 backdrop-blur-xl p-3.5 shadow-2xl" style={{ boxShadow: '0 20px 48px rgba(55, 28, 82, .20), 0 0 0 1px rgba(116, 44, 255, .05)' }}>
        <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-[#ECE8F1]">
          <div><p className="text-[9px] uppercase tracking-[0.18em] font-black text-brand">Dia {day.sprintDay} · {formatDate(day.dateId)}</p><p className="text-[11px] font-bold text-[#31293B] mt-0.5">Top 5 acumulado</p></div>
          <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand flex items-center justify-center shrink-0"><Trophy className="w-4 h-4" /></span>
        </div>
        {day.status === 'future' ? <p className="py-4 text-[11px] leading-relaxed text-[#81778D]">O ranking deste dia aparecerá quando os check-ins forem registrados.</p> : ranking.length ? <div className="mt-2 space-y-1">
          {ranking.map(member => <div key={member.memberKey} className="h-7 grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-2 rounded-lg bg-[#F8F6FA] px-2">
            <span className="text-[9px] font-black text-brand">{member.rank}º</span><span className="truncate text-[10px] font-bold text-[#31293B]">{member.formattedName}</span><span className="text-[11px] font-black text-[#17131F]">{member.points}<small className="ml-1 text-[7px] uppercase text-[#91889B]">pts</small></span>
          </div>)}
        </div> : <p className="py-4 text-[11px] leading-relaxed text-[#81778D]">Ainda não havia check-ins válidos acumulados.</p>}
        <p className="mt-2.5 pt-2 border-t border-[#ECE8F1] text-[8px] leading-relaxed text-[#91889B]">Pontos por dias ativos válidos, com limite de 6 por semana.</p>
      </div>
    </div>, document.body)}
  </>;
}
