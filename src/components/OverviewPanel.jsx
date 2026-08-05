import { Crown, Flame, Minus, TrendingDown, TrendingUp, Trophy, Users } from 'lucide-react';
import { MemberTooltip } from './MemberTooltip';

const DISPLAY_ORDER = [3, 1, 0, 2, 4];
const CARD_OFFSETS = [42, 18, 0, 18, 42];
const MEDAL_COLORS = ['#C18400', '#64748B', '#A85D28'];

export function OverviewPanel({ rankingData }) {
  const topFive = rankingData.slice(0, 5);
  const nextFive = rankingData.slice(5, 10);
  const rankCounts = rankingData.reduce((counts, member) => counts.set(member.rank, (counts.get(member.rank) || 0) + 1), new Map());

  return <div className="w-full flex flex-col gap-2.5">
    <section className="panel relative overflow-hidden px-4 pt-4 sm:px-5 sm:pt-4 min-[1100px]:h-[312px] min-[1100px]:min-h-0 min-[1100px]:flex-none">
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[34rem] h-72 rounded-full bg-brand-100/75 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-80 h-72 rounded-full bg-accent-100/50 blur-[100px] pointer-events-none" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand"><Trophy className="w-4 h-4" /><p className="text-[10px] uppercase tracking-[0.24em] font-black">Pódio da Sprint</p></div>
          <p className="text-xs text-[#746B80] mt-1">Os cinco melhores colocados, preservando empates individuais.</p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-brand"><Users className="w-3 h-3" /> Top 5 individual</span>
      </div>

      <div className="relative hidden min-[1100px]:flex min-h-[215px] items-start gap-2 lg:gap-3 px-0 lg:px-1 pb-3 mt-3">
        {DISPLAY_ORDER.map((index, displayIndex) => {
          const member = topFive[index];
          return member ? <PodiumCard key={member.memberKey} member={member} offset={CARD_OFFSETS[displayIndex]} tieCount={rankCounts.get(member.rank) || 1} /> : <div key={index} className="flex-1" />;
        })}
      </div>

      <div className="relative min-[1100px]:hidden grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 pb-4">
        {topFive.map((member, index) => <MobilePodiumCard key={member.memberKey} member={member} tieCount={rankCounts.get(member.rank) || 1} featured={index === 0} />)}
      </div>
    </section>

    {nextFive.length > 0 && <section className="panel overflow-hidden flex flex-col">
      <div className="px-4 pt-3 pb-2"><div className="flex items-center gap-2 text-brand"><Flame className="w-4 h-4" /><p className="text-[10px] uppercase tracking-[0.2em] font-black">Na cola do pódio</p></div><p className="text-xs text-[#746B80] mt-1">Quem está mais perto de entrar no Top 5.</p></div>
      <div className="grid md:grid-cols-2 min-[1100px]:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#EDE9F2]">{nextFive.map(member => <ChaserCard key={member.memberKey} member={member} />)}</div>
    </section>}
  </div>;
}

function PodiumCard({ member, offset, tieCount }) {
  const featured = offset === 0;
  const medal = MEDAL_COLORS[member.rank - 1] || '#742CFF';
  const cardHeight = featured ? 190 : offset <= 18 ? 178 : 166;
  const flexSize = featured ? 1.14 : offset <= 18 ? 1.03 : 0.92;
  const percent = Math.round(Math.min(100, Math.max(0, member.points / 85 * 100)));
  const label = getPositionLabel(member.rank, tieCount);

  return <div className="min-w-0" style={{ marginTop: offset, flex: flexSize, zIndex: featured ? 2 : 1 }}><MemberTooltip member={member} accentColor={featured ? '#00FFB6' : medal}><article className={`relative rounded-2xl overflow-hidden border px-3 py-3.5 lg:px-4 flex flex-col cursor-help transition-all duration-200 hover:-translate-y-1 ${featured ? 'border-brand-700 bg-gradient-to-br from-[#251044] via-brand-800 to-brand text-white shadow-xl shadow-brand/25' : 'bg-white/95 shadow-lg'}`} style={{ height: cardHeight, borderColor: featured ? undefined : `${medal}55` }}>
    <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${featured ? '#00FFB6' : medal}, transparent)` }} />
    <div className="relative flex items-start justify-between gap-1.5"><span className="inline-flex items-center gap-1 text-[8px] lg:text-[9px] uppercase tracking-[0.12em] lg:tracking-[0.16em] font-black" style={{ color: featured ? '#00FFB6' : medal }}>{member.rank === 1 && <Crown className="w-3 h-3 lg:w-3.5 lg:h-3.5 shrink-0" />}{label}</span><Trend trend={member.trend} /></div>
    <div className="relative mt-4 lg:mt-5"><h3 className={`font-black uppercase leading-tight break-words ${featured ? 'text-white text-sm lg:text-base' : 'text-[#17131F] text-xs lg:text-sm'}`}>{member.formattedName}</h3><div className="flex items-baseline mt-1.5"><strong className={`${featured ? 'text-3xl lg:text-4xl text-white' : 'text-2xl lg:text-3xl text-[#17131F]'} font-black tracking-tight`}>{member.points}</strong><span className="ml-1 lg:ml-1.5 text-[8px] font-black tracking-widest" style={{ color: featured ? '#00FFB6' : medal }}>PONTOS</span></div></div>
    <div className="relative mt-auto"><div className={`flex justify-between items-center text-[8px] uppercase tracking-wider font-bold ${featured ? 'text-white/55' : 'text-[#91889B]'}`}><span>Progresso</span><span style={{ color: featured ? '#00FFB6' : medal }}>{percent}%</span></div><Progress value={percent} color={featured ? '#00FFB6' : medal} dark={featured} /></div>
  </article></MemberTooltip></div>;
}

function getPositionLabel(rank, tieCount) {
  if (rank === 1) return tieCount > 1 ? 'Empate na liderança' : 'Líder atual';
  return tieCount > 1 ? `Empate no ${rank}º` : `${rank}º lugar`;
}

function Progress({ value, color, dark = false }) {
  return <div className={`h-1.5 w-full rounded-full mt-1.5 overflow-hidden ${dark ? 'bg-white/15' : 'bg-[#EEEAF2]'}`}><div className="h-full rounded-full" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}90, ${color})` }} /></div>;
}

function ChaserCard({ member }) {
  const percent = Math.round(Math.min(100, Math.max(0, member.points / 85 * 100)));
  return <MemberTooltip member={member} accentColor="#742CFF" style={{ height: '100%' }}><article className="h-full min-h-[116px] px-3.5 py-3 lg:px-4 hover:bg-brand-50/60 transition-colors cursor-help flex flex-col">
    <div className="flex items-center justify-between"><span className="text-[9px] uppercase tracking-[0.16em] font-black text-brand">{member.rank}º lugar</span><Trend trend={member.trend} /></div>
    <div className="mt-4 lg:mt-5"><h3 className="text-xs lg:text-sm font-black uppercase leading-tight text-[#17131F] truncate">{member.formattedName}</h3><div className="flex items-baseline mt-1.5"><strong className="text-2xl lg:text-3xl font-black tracking-tight text-[#17131F]">{member.points}</strong><span className="ml-1 lg:ml-1.5 text-[8px] font-black tracking-widest text-brand">PONTOS</span></div></div>
    <div className="mt-auto pt-2"><div className="flex items-center justify-between text-[8px] uppercase tracking-wider font-bold text-[#91889B]"><span>Progresso</span><span className="text-brand">{percent}%</span></div><Progress value={percent} color="#742CFF" /></div>
  </article></MemberTooltip>;
}

function Trend({ trend, compact = false }) {
  const size = compact ? 'w-3 h-3' : 'w-3.5 h-3.5';
  return trend === 'up' ? <TrendingUp className={`${size} text-emerald-400 shrink-0`} aria-label="Em alta" /> : trend === 'down' ? <TrendingDown className={`${size} text-rose-400 shrink-0`} aria-label="Em queda" /> : trend === 'flat' ? <Minus className={`${size} text-[#91889B] shrink-0`} aria-label="Estável" /> : null;
}

function MobilePodiumCard({ member, tieCount, featured }) {
  const medal = MEDAL_COLORS[member.rank - 1] || '#742CFF';
  const percent = Math.round(Math.min(100, Math.max(0, member.points / 85 * 100)));
  return <MemberTooltip member={member} accentColor={featured ? '#00FFB6' : medal}><article className={`relative min-w-0 rounded-xl border p-4 shadow-sm ${featured ? 'border-brand-700 bg-gradient-to-br from-[#251044] to-brand text-white' : 'bg-white'}`} style={{ borderColor: featured ? undefined : `${medal}55` }}><div className="flex items-start gap-3"><span className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-black ${featured ? 'bg-white/10' : ''}`} style={{ background: featured ? undefined : `${medal}18`, color: featured ? '#00FFB6' : medal }}>{member.rank}º</span><div className="min-w-0 flex-1"><p className="text-[9px] uppercase tracking-wider font-black" style={{ color: featured ? '#00FFB6' : medal }}>{getPositionLabel(member.rank, tieCount)}</p><h3 className={`font-black truncate mt-1 ${featured ? 'text-white' : 'text-[#17131F]'}`}>{member.formattedName}</h3><div className="flex items-baseline gap-1 mt-1"><strong className="text-2xl">{member.points}</strong><span className="text-[9px] font-black" style={{ color: featured ? '#00FFB6' : medal }}>PONTOS</span></div></div><Trend trend={member.trend} /></div><div className={`mt-3 flex justify-between text-[9px] uppercase font-bold ${featured ? 'text-white/55' : 'text-[#81778D]'}`}><span>Progresso</span><span style={{ color: featured ? '#00FFB6' : medal }}>{percent}%</span></div><Progress value={percent} color={featured ? '#00FFB6' : medal} dark={featured} /></article></MemberTooltip>;
}
