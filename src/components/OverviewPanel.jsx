import { Crown, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { MemberTooltip } from './MemberTooltip';

const PODIUM_ORDER = [3, 1, 0, 2, 4];
const PODIUM_HEIGHTS = ['72%', '86%', '100%', '86%', '72%'];
const MEDAL_STYLES = [
  'from-yellow-300 to-amber-500 text-black', 'from-gray-100 to-gray-400 text-black', 'from-orange-300 to-amber-700 text-black',
];

export function OverviewPanel({ rankingData }) {
  const topFive = rankingData.slice(0, 5);
  const podium = PODIUM_ORDER.map(index => topFive[index]).filter(Boolean);
  const nextFive = rankingData.slice(5, 10);

  return <div className="w-full max-w-6xl mx-auto space-y-4">
    <section className="panel p-4 sm:p-6 overflow-hidden"><div className="flex items-center justify-between mb-5"><div><p className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-400">Ranking geral</p><h2 className="text-xl sm:text-2xl font-black text-white">Pódio individual</h2></div><p className="text-xs text-gray-500">Atualizado pela planilha</p></div>
      <div className="hidden md:flex items-end justify-center gap-3 lg:gap-5 min-h-[390px]">{podium.map((member, position) => <PodiumCard key={member.memberKey} member={member} height={PODIUM_HEIGHTS[position]} />)}</div>
      <div className="md:hidden flex flex-col gap-2">{topFive.map(member => <MobilePodiumRow key={member.memberKey} member={member} />)}</div>
    </section>
    {nextFive.length > 0 && <section className="panel overflow-hidden"><div className="px-5 pt-5 pb-3"><p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500">Na cola do pódio</p><h2 className="font-black text-white">Posições 6 a 10</h2></div><div className="grid sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.05]">{nextFive.map(member => <div key={member.memberKey} className="px-4 py-3"><div className="flex items-center justify-between gap-2"><span className="text-xs font-black text-gray-500">{member.rank}º</span><Trend trend={member.trend} /></div><p className="text-sm font-bold text-white truncate mt-2">{member.formattedName}</p><div className="flex items-baseline gap-1 mt-1"><strong className="text-lg text-blue-400">{member.points}</strong><span className="text-[9px] font-bold text-gray-500">PTS</span></div><Progress value={member.points} /></div>)}</div></section>}
  </div>;
}

function PodiumCard({ member, height }) {
  const medal = member.rank <= 3 ? MEDAL_STYLES[member.rank - 1] : 'bg-blue-500/15 text-blue-300 border border-blue-400/30';
  return <MemberTooltip member={member} accentColor="#3B82F6"><article className="relative w-[18%] min-w-[130px] flex flex-col justify-end cursor-help group" style={{ height }}><div className="absolute inset-0 rounded-t-2xl border border-blue-400/20 border-t-2 border-t-blue-400 bg-gradient-to-b from-blue-500/15 to-[#0e0e16] shadow-xl group-hover:from-blue-500/25 transition-colors" /><div className="relative flex flex-col items-center text-center px-3 py-5"><div className={`w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center font-black text-sm mb-3 ${medal}`}>{member.rank === 1 && <Crown className="absolute -mt-10 w-5 h-5 text-yellow-300" />}{member.rank}º</div><h3 className="text-sm font-black text-white uppercase leading-tight line-clamp-2 min-h-10 flex items-center">{member.formattedName}</h3><div className="mt-3"><strong className="text-3xl font-black text-white">{member.points}</strong><span className="ml-1 text-[10px] font-bold text-blue-400">PTS</span></div><Progress value={member.points} /><div className="mt-3"><Trend trend={member.trend} /></div></div></article></MemberTooltip>;
}

function MobilePodiumRow({ member }) { return <MemberTooltip member={member} accentColor="#3B82F6"><div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] cursor-help"><span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${member.rank <= 3 ? `bg-gradient-to-br ${MEDAL_STYLES[member.rank - 1]}` : 'bg-blue-500/15 text-blue-300'}`}>{member.rank}º</span><span className="flex-1 text-sm font-bold text-white">{member.formattedName}</span><Trend trend={member.trend} /><strong className="text-lg text-white">{member.points}</strong></div></MemberTooltip>; }
function Progress({ value }) { return <div className="h-1.5 w-full rounded-full bg-white/[0.08] mt-2 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-blue-700 to-cyan-400" style={{ width: `${Math.min(100, Math.max(0, (value / 85) * 100))}%` }} /></div>; }
function Trend({ trend }) { return trend === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-400" aria-label="Em alta" /> : trend === 'down' ? <TrendingDown className="w-4 h-4 text-rose-400" aria-label="Em queda" /> : trend === 'flat' ? <Minus className="w-4 h-4 text-gray-500" aria-label="Estável" /> : null; }
