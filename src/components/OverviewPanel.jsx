import { Crown, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { MemberTooltip } from './MemberTooltip';

const DISPLAY_ORDER = [3, 1, 0, 2, 4];
const CARD_OFFSETS = [96, 48, 0, 48, 96];
const MEDAL_COLORS = ['#FACC15', '#CBD5E1', '#D97706'];
const WEEK_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];

export function OverviewPanel({ rankingData }) {
  const topFive = rankingData.slice(0, 5);
  const nextFive = rankingData.slice(5, 10);

  return <div className="w-full max-w-6xl mx-auto space-y-4">
    <section className="panel relative px-4 pt-5 sm:px-7 sm:pt-6 overflow-hidden">
      <div className="absolute left-1/2 top-20 -translate-x-1/2 w-72 h-72 rounded-full bg-blue-500/10 blur-[80px] pointer-events-none" />
      <div className="relative flex items-start justify-between"><div><p className="text-[10px] uppercase tracking-[0.24em] font-black text-blue-400">Ranking geral</p><h2 className="text-xl sm:text-2xl font-black text-white mt-1">Top 5 da Sprint</h2></div><span className="hidden sm:block text-[10px] uppercase tracking-widest text-gray-600 font-bold">Passe o mouse para detalhes</span></div>
      <div className="relative overflow-x-auto mt-5"><div className="min-w-[840px] min-h-[350px] flex items-start gap-3 lg:gap-4 px-2 pb-7">{DISPLAY_ORDER.map((index, displayIndex) => { const member = topFive[index]; return member ? <PodiumCard key={member.memberKey} member={member} offset={CARD_OFFSETS[displayIndex]} /> : <div key={index} className="flex-1" />; })}</div></div>
    </section>
    {nextFive.length > 0 && <section className="panel overflow-hidden"><div className="px-5 pt-4 pb-2"><p className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-500">Na cola do pódio</p></div><div className="grid sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.05]">{nextFive.map(member => <div key={member.memberKey} className="px-4 py-3"><div className="flex items-center justify-between"><span className="text-xs font-black text-gray-500">{member.rank}º</span><Trend trend={member.trend} /></div><p className="text-sm font-bold text-white truncate mt-2">{member.formattedName}</p><p className="text-blue-400 font-black mt-1">{member.points}<span className="ml-1 text-[9px] text-gray-600">PTS</span></p></div>)}</div></section>}
  </div>;
}

function PodiumCard({ member, offset }) {
  const winner = member.rank === 1;
  const medal = MEDAL_COLORS[member.rank - 1] || '#3B82F6';
  const latestWeek = getLatestWeek(member);

  return <div className="flex-1 min-w-0" style={{ marginTop: offset, transform: winner ? 'scale(1.045)' : undefined, zIndex: winner ? 2 : 1 }}><MemberTooltip member={member} accentColor={medal}><article className="relative h-[210px] rounded-2xl border px-4 py-4 flex flex-col text-center cursor-help transition-all duration-200 hover:-translate-y-1" style={{ background: winner ? 'linear-gradient(160deg, rgba(250,204,21,.13), rgba(18,18,26,.96) 45%)' : 'linear-gradient(160deg, rgba(59,130,246,.09), rgba(18,18,26,.96) 50%)', borderColor: winner ? 'rgba(250,204,21,.45)' : `${medal}45`, boxShadow: winner ? '0 20px 45px rgba(250,204,21,.10)' : '0 16px 35px rgba(0,0,0,.28)' }}>
    {winner && <Crown className="absolute -top-5 left-1/2 -translate-x-1/2 w-7 h-7 text-yellow-300 drop-shadow-lg" />}
    <div className="flex items-center justify-between"><span className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black border" style={{ color: medal, borderColor: `${medal}60`, background: `${medal}15` }}>{member.rank}º</span><Trend trend={member.trend} /></div>
    <div className="flex-1 flex flex-col items-center justify-center min-w-0"><h3 className="font-black text-white text-sm uppercase leading-tight w-full break-words">{member.formattedName}</h3><div className="mt-3 flex items-baseline"><strong className="text-3xl font-black text-white">{member.points}</strong><span className="ml-1 text-[9px] font-black tracking-wider" style={{ color: medal }}>PTS</span></div></div>
    <div><div className="flex justify-between text-[9px] uppercase tracking-wider font-bold text-gray-600"><span>{latestWeek ? `Semana ${latestWeek.index}` : 'Sem atividade'}</span><span>{Math.round(Math.min(100, member.points / 85 * 100))}%</span></div><Progress value={member.points} color={medal} /></div>
  </article></MemberTooltip></div>;
}

function getLatestWeek(member) { for (let index = WEEK_KEYS.length - 1; index >= 0; index--) { const value = parseFloat(member.weeks?.[WEEK_KEYS[index]]?.toString().replace(',', '.')) || 0; if (value > 0) return { index: index + 1, value }; } return null; }
function Progress({ value, color }) { return <div className="h-1.5 w-full rounded-full bg-white/[0.08] mt-2 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, value / 85 * 100))}%`, background: color }} /></div>; }
function Trend({ trend }) { return trend === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-400" aria-label="Em alta" /> : trend === 'down' ? <TrendingDown className="w-4 h-4 text-rose-400" aria-label="Em queda" /> : trend === 'flat' ? <Minus className="w-4 h-4 text-gray-500" aria-label="Estável" /> : null; }
