import { Crown, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { MemberTooltip } from './MemberTooltip';

const DISPLAY_ORDER = [3, 1, 0, 2, 4];
const BASE_HEIGHTS = ['h-24', 'h-36', 'h-48', 'h-36', 'h-24'];
const MEDAL_COLORS = ['#FACC15', '#CBD5E1', '#D97706'];

export function OverviewPanel({ rankingData }) {
  const topFive = rankingData.slice(0, 5);
  const nextFive = rankingData.slice(5, 10);

  return <div className="w-full max-w-6xl mx-auto space-y-4">
    <section className="panel px-4 pt-5 sm:px-8 sm:pt-7 overflow-hidden"><div className="flex items-start justify-between"><div><p className="text-[10px] uppercase tracking-[0.24em] font-black text-blue-400">Ranking geral</p><h2 className="text-xl sm:text-2xl font-black text-white mt-1">Top 5 da Sprint</h2></div><span className="hidden sm:block text-[10px] uppercase tracking-widest text-gray-600 font-bold">Passe o mouse para detalhes</span></div>
      <div className="overflow-x-auto mt-6 pb-0"><div className="grid grid-cols-5 gap-3 items-end min-h-[370px] min-w-[650px]">{DISPLAY_ORDER.map((index, displayIndex) => { const member = topFive[index]; return member ? <PodiumSlot key={member.memberKey} member={member} baseHeight={BASE_HEIGHTS[displayIndex]} /> : <div key={index} />; })}</div></div>
    </section>
    {nextFive.length > 0 && <section className="panel overflow-hidden"><div className="px-5 pt-5 pb-3"><p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500">Na cola do pódio</p></div><div className="grid sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.05]">{nextFive.map(member => <div key={member.memberKey} className="px-4 py-3"><div className="flex items-center justify-between"><span className="text-xs font-black text-gray-500">{member.rank}º</span><Trend trend={member.trend} /></div><p className="text-sm font-bold text-white truncate mt-2">{member.formattedName}</p><p className="text-blue-400 font-black mt-1">{member.points}<span className="ml-1 text-[9px] text-gray-600">PTS</span></p></div>)}</div></section>}
  </div>;
}

function PodiumSlot({ member, baseHeight }) {
  const medal = MEDAL_COLORS[member.rank - 1] || '#3B82F6';
  return <div className="h-full flex flex-col justify-end min-w-0"><MemberTooltip member={member} accentColor={medal}><article className="relative z-10 rounded-2xl bg-[#151520] border border-white/[0.08] px-3 py-4 text-center shadow-2xl cursor-help hover:-translate-y-1 hover:border-white/20 transition-all"><div className="flex justify-center -mt-8 mb-2"><div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm border-4 border-[#151520]" style={{ background: medal, color: member.rank <= 3 ? '#09090b' : '#fff' }}>{member.rank === 1 && <Crown className="absolute -mt-9 w-5 h-5 text-yellow-300" />}{member.rank}º</div></div><h3 className="font-black text-white text-sm uppercase leading-tight truncate">{member.formattedName}</h3><div className="mt-2"><strong className="text-2xl text-white">{member.points}</strong><span className="ml-1 text-[9px] font-bold" style={{ color: medal }}>PTS</span></div><Progress value={member.points} color={medal} /></article></MemberTooltip><div className={`${baseHeight} rounded-t-2xl mt-[-1px] flex items-end justify-center pb-3`} style={{ background: `linear-gradient(180deg, ${medal}55, ${medal}18)`, borderTop: `1px solid ${medal}70` }}><span className="text-5xl font-black opacity-20" style={{ color: medal }}>{member.rank}</span></div></div>;
}

function Progress({ value, color }) { return <div className="h-1 w-full rounded-full bg-white/[0.08] mt-2 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min(100, (value / 85) * 100)}%`, background: color }} /></div>; }
function Trend({ trend }) { return trend === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : trend === 'down' ? <TrendingDown className="w-4 h-4 text-rose-400" /> : trend === 'flat' ? <Minus className="w-4 h-4 text-gray-500" /> : null; }
