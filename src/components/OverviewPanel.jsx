import { Crown, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { MemberTooltip } from './MemberTooltip';

const DISPLAY_ORDER = [3, 1, 0, 2, 4];
const CARD_OFFSETS = [48, 22, 0, 22, 48];
const MEDAL_COLORS = ['#A66B00', '#64748B', '#A85D28'];

export function OverviewPanel({ rankingData }) {
  const topFive = rankingData.slice(0, 5);
  const nextFive = rankingData.slice(5, 10);

  return <div className="w-full max-w-[1500px] mx-auto space-y-4">
    <section className="panel relative px-4 pt-5 sm:px-7 sm:pt-6 overflow-hidden">
      <div className="absolute left-1/2 top-12 -translate-x-1/2 w-80 h-64 rounded-full bg-brand-100/70 blur-[80px] pointer-events-none" />
      <div className="relative flex items-start justify-between"><div><p className="text-[10px] uppercase tracking-[0.24em] font-black text-brand">Ranking geral</p><h2 className="text-xl sm:text-2xl font-black text-[#17131F] mt-1">Top 5 da Sprint</h2></div><span className="hidden sm:block text-[10px] uppercase tracking-widest text-[#8A8194] font-bold">85 pontos possíveis</span></div>
      <div className="relative overflow-x-auto mt-5"><div className="min-w-[880px] min-h-[250px] flex items-start gap-3 lg:gap-4 px-2 pb-5">{DISPLAY_ORDER.map((index, displayIndex) => { const member = topFive[index]; return member ? <PodiumCard key={member.memberKey} member={member} offset={CARD_OFFSETS[displayIndex]} /> : <div key={index} className="flex-1" />; })}</div></div>
    </section>
    {nextFive.length > 0 && <section className="panel overflow-hidden"><div className="px-5 pt-4 pb-2"><p className="text-[10px] uppercase tracking-[0.2em] font-black text-[#81778D]">Na cola do pódio</p></div><div className="grid sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#EDE9F2]">{nextFive.map(member => <div key={member.memberKey} className="px-4 py-3 hover:bg-brand-50/60 transition-colors"><div className="flex items-center justify-between"><span className="text-xs font-black text-[#8A8194]">{member.rank}º</span><Trend trend={member.trend} /></div><p className="text-sm font-bold text-[#241D2D] truncate mt-2">{member.formattedName}</p><p className="text-brand font-black mt-1">{member.points}<span className="ml-1 text-[9px] text-[#8A8194]">PTS</span></p></div>)}</div></section>}
  </div>;
}

function PodiumCard({ member, offset }) {
  const winner = member.rank === 1;
  const medal = MEDAL_COLORS[member.rank - 1] || '#742CFF';
  const cardHeight = winner ? 192 : member.rank <= 3 ? 184 : 176;
  const flexSize = winner ? 1.16 : member.rank <= 3 ? 1.04 : 0.92;
  const percent = Math.round(Math.min(100, Math.max(0, member.points / 85 * 100)));

  return <div className="min-w-0" style={{ marginTop: offset, flex: flexSize, zIndex: winner ? 2 : 1 }}><MemberTooltip member={member} accentColor={medal}><article className="relative rounded-2xl overflow-hidden border px-4 py-4 flex flex-col cursor-help transition-all duration-200 hover:-translate-y-1" style={{ height: cardHeight, background: winner ? 'linear-gradient(145deg, rgba(246,201,69,.15), #FFFFFF 54%)' : 'linear-gradient(145deg, rgba(116,44,255,.07), #FFFFFF 60%)', borderColor: winner ? 'rgba(215,164,0,.38)' : 'rgba(116,44,255,.14)', boxShadow: winner ? '0 18px 42px rgba(177,132,0,.13)' : '0 12px 28px rgba(69,45,91,.09)' }}>
    <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${medal}, transparent)` }} />
    <span className="absolute -right-1 -bottom-5 text-8xl font-black opacity-[0.06] select-none" style={{ color: medal }}>{member.rank}</span>
    <div className="relative flex items-center justify-between"><span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] font-black" style={{ color: medal }}>{winner && <Crown className="w-3.5 h-3.5" />}{winner ? 'Líder atual' : `${member.rank}º lugar`}</span><Trend trend={member.trend} /></div>
    <div className="relative mt-6"><h3 className={`font-black text-[#17131F] uppercase leading-tight break-words ${winner ? 'text-base' : 'text-sm'}`}>{member.formattedName}</h3><div className="flex items-baseline mt-2"><strong className={`${winner ? 'text-4xl' : 'text-3xl'} font-black text-[#17131F] tracking-tight`}>{member.points}</strong><span className="ml-1.5 text-[9px] font-black tracking-widest" style={{ color: medal }}>PONTOS</span></div></div>
    <div className="relative mt-auto"><div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-bold"><span className="text-[#91889B]">Progresso</span><span style={{ color: medal }}>{percent}%</span></div><Progress value={percent} color={medal} /></div>
  </article></MemberTooltip></div>;
}

function Progress({ value, color }) { return <div className="h-1.5 w-full rounded-full bg-[#EEEAF2] mt-2 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}90, ${color})` }} /></div>; }
function Trend({ trend }) { return trend === 'up' ? <TrendingUp className="w-4 h-4 text-emerald-400" aria-label="Em alta" /> : trend === 'down' ? <TrendingDown className="w-4 h-4 text-rose-400" aria-label="Em queda" /> : trend === 'flat' ? <Minus className="w-4 h-4 text-gray-500" aria-label="Estável" /> : null; }
