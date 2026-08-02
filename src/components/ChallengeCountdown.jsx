import { Timer } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';

export function ChallengeCountdown({ startDate, endDate }) {
  const { timeLeft, progress } = useCountdown(startDate, endDate);
  const format = (num) => num.toString().padStart(2, '0');

  return (
    <div className="w-full sm:w-auto sm:min-w-[300px] bg-gradient-to-br from-brand-50 to-white px-3 sm:px-5 py-2.5 rounded-2xl border border-brand-100 flex flex-col justify-center shadow-sm">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] uppercase tracking-widest text-[#746B80] font-bold">Desafio 45 Dias</span>
        <span className="text-[10px] font-bold text-brand bg-white px-2 py-0.5 rounded-lg border border-brand-100">
          Dia {progress.currentDay} <span className="text-[#91889B] font-normal">/ 45</span>
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <Timer className="w-4 h-4 text-[#00A97A]" />
        <div className="flex items-baseline gap-0.5 text-[#17131F] font-black text-base sm:gap-1 sm:text-xl tracking-tight">
          {format(timeLeft.days)}<span className="text-[10px] text-[#81778D] font-bold tracking-widest uppercase mr-1">d</span>:
          <span className="ml-1">{format(timeLeft.hours)}</span><span className="text-[10px] text-[#81778D] font-bold tracking-widest uppercase mr-1">h</span>:
          <span className="ml-1">{format(timeLeft.minutes)}</span><span className="text-[10px] text-[#81778D] font-bold tracking-widest uppercase mr-1">m</span>:
          <span className="ml-1">{format(timeLeft.seconds)}</span><span className="text-[10px] text-[#81778D] font-bold tracking-widest uppercase">s</span>
        </div>
      </div>
    </div>
  );
}
