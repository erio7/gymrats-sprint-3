import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Flag, TimerReset } from 'lucide-react';
import { buildSprintJourney, getSaoPauloDateId } from '../lib/sprintJourney';

const WEEKDAYS = ['Sáb', 'Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

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
  const currentDay = journey.days.find(day => day.status === 'today');

  useEffect(() => {
    const intervalId = window.setInterval(() => setTodayDateId(getSaoPauloDateId()), 60 * 60 * 1_000);
    return () => window.clearInterval(intervalId);
  }, []);

  return <article className={`panel h-full min-h-[280px] overflow-hidden ${compact ? 'p-3' : 'p-4 min-[1700px]:p-5'}`}>
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-2.5">
        <span className={`${compact ? 'w-7 h-7' : 'w-8 h-8'} rounded-lg bg-brand-50 text-brand flex items-center justify-center shrink-0`}><CalendarDays className="w-4 h-4" /></span>
        <div><p className="text-[9px] uppercase tracking-[0.2em] font-black text-brand">Calendário da Sprint</p><h3 className={`${compact ? 'text-sm' : 'text-base'} font-black text-[#17131F] mt-0.5`}>Rumo ao dia 45</h3></div>
      </div>
      <div className="text-right shrink-0"><strong className="text-xl font-black text-[#17131F]">{journey.elapsedDays}</strong><span className="text-[9px] font-black text-[#91889B]"> / {journey.totalDays}</span><p className="text-[8px] uppercase tracking-wider font-bold text-[#91889B] mt-0.5">dias</p></div>
    </div>

    <div className={compact ? 'mt-2' : 'mt-3.5'}>
      <div className="flex items-center justify-between gap-3 mb-1.5"><span className="text-[9px] uppercase tracking-wider font-black text-[#81778D]">Percurso concluído</span><span className="text-[10px] font-black text-brand">{Math.round(journey.progress)}%</span></div>
      <div className={`${compact ? 'h-1.5' : 'h-2'} rounded-full bg-[#EEEAF2] overflow-hidden`}><div className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-[width] duration-700" style={{ width: `${journey.progress}%` }} /></div>
    </div>

    <div className={`${compact ? 'mt-2.5 gap-y-1' : 'mt-4 gap-y-1.5'} grid grid-cols-[26px_repeat(7,minmax(0,1fr))] gap-x-1 items-center`}>
      <span />
      {WEEKDAYS.map(day => <span key={day} className="text-center text-[7px] sm:text-[8px] uppercase font-black text-[#91889B]">{day}</span>)}
      {weeks.map((week, weekIndex) => <JourneyWeek key={weekIndex} week={week} weekIndex={weekIndex} totalDays={journey.totalDays} compact={compact} />)}
    </div>

    <div className={`flex items-center justify-between gap-3 border-t border-[#ECE8F1] ${compact ? 'mt-2 pt-2' : 'mt-4 pt-3'}`}>
      <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-[#81778D]"><TimerReset className="w-3 h-3 text-brand" />{currentDay ? `Hoje: dia ${currentDay.sprintDay}` : journey.elapsedDays === 0 ? 'A Sprint ainda vai começar' : 'Percurso finalizado'}</span>
      <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-[#31293B]"><Flag className="w-3 h-3 text-[#00A97A]" />14 set</span>
    </div>
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
      className={`relative ${compact ? 'h-5 text-[8px]' : 'h-6 sm:h-7 text-[8px] sm:text-[9px]'} rounded-md flex items-center justify-center font-black border transition-colors ${day.status === 'today' ? 'bg-brand border-brand text-white shadow-md shadow-brand/20' : day.status === 'complete' ? 'bg-brand-50 border-brand-100 text-brand' : 'bg-[#FAF9FC] border-[#EEEAF2] text-[#AAA2B2]'} ${day.sprintDay === totalDays ? 'ring-1 ring-[#00A97A]/40' : ''}`}
    >
      {day.sprintDay}
      {day.sprintDay === totalDays && <Flag className="absolute -right-1 -top-1 w-2.5 h-2.5 text-[#00A97A] fill-white" />}
    </span> : <span key={`empty-${weekIndex}-${index}`} />)}
  </>;
}
