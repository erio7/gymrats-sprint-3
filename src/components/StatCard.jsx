import { AnimatedNumber } from './AnimatedNumber';

export function StatCard({ icon: Icon, color, value, label }) {
  return (
    <div className="bg-[#FAF9FC] px-4 py-2 rounded-xl border border-[#E8E5EF] flex flex-col justify-center min-w-[130px]">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-lg font-black text-[#17131F]"><AnimatedNumber value={value} /></span>
      </div>
      <span className="text-[9px] uppercase tracking-widest text-[#81778D] font-bold mt-0.5">{label}</span>
    </div>
  );
}
