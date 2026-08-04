import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Flag } from 'lucide-react';
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

export function SprintJourney({ startDate, endDate, compact = false }) {
  const [todayDateId, setTodayDateId] = useState(() => getSaoPauloDateId());
  const journey = useMemo(() => buildSprintJourney(toDateId(startDate), toDateId(endDate), todayDateId), [endDate, startDate, todayDateId]);
  const weeks = Array.from({ length: Math.ceil(journey.totalDays / 7) }, (_, index) => journey.days.slice(index * 7, index * 7 + 7));

  useEffect(() => {
    const intervalId = window.setInterval(() => setTodayDateId(getSaoPauloDateId()), 60 * 60 * 1_000);
    return () => window.clearInterval(intervalId);
  }, []);

  return <article className={`panel w-full h-full min-h-[280px] overflow-hidden ${compact ? 'sprint-journey-compact p-3' : 'p-4 min-[1700px]:p-5'}`}>
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

    <div className={`journey-grid ${compact ? 'mt-2 gap-y-1' : 'mt-4 gap-y-1.5'} grid grid-cols-[14px_repeat(7,22px)] justify-center gap-x-px items-center`}>
      <span />
      {WEEKDAYS.map((day, index) => <span key={`${day}-${index}`} className="text-center text-[7px] sm:text-[8px] uppercase font-black text-[#91889B]">{day}</span>)}
      {weeks.map((week, weekIndex) => <JourneyWeek key={weekIndex} week={week} weekIndex={weekIndex} totalDays={journey.totalDays} compact={compact} />)}
    </div>

    <div className={`journey-footer border-t border-[#ECE8F1] ${compact ? 'mt-1.5' : 'mt-4'}`} aria-hidden="true" />
  </article>;
}

function JourneyWeek({ week, weekIndex, totalDays, compact }) {
  const cells = [...week, ...Array.from({ length: 7 - week.length }, () => null)];
  return <>
    <span className="text-[8px] font-black text-[#81778D]">S{weekIndex + 1}</span>
    {cells.map((day, index) => day ? <span
      key={day.dateId}
      title={`Dia ${day.sprintDay} · ${formatDate(day.dateId)}`}
      aria-label={`Dia ${day.sprintDay} da Sprint, ${formatDate(day.dateId)}`}
      className={`journey-day relative ${compact ? 'h-5 text-[8px]' : 'h-6 sm:h-7 text-[8px] sm:text-[9px]'} rounded-md flex items-center justify-center font-black border transition-colors ${day.status === 'today' ? 'bg-brand border-brand text-white shadow-md shadow-brand/20' : day.status === 'complete' ? 'bg-brand-50 border-brand-100 text-brand' : 'bg-[#FAF9FC] border-[#EEEAF2] text-[#AAA2B2]'} ${day.sprintDay === totalDays ? 'ring-1 ring-[#00A97A]/40' : ''}`}
    >
      {day.sprintDay}
      {day.sprintDay === totalDays && <Flag className="absolute right-0 top-0 w-2 h-2 text-[#00A97A] fill-white" />}
    </span> : <span key={`empty-${weekIndex}-${index}`} />)}
  </>;
}
