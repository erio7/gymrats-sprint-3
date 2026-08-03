import { Crown, Layers3, Minus, Sparkles, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { MemberTooltip } from './MemberTooltip';

const GROUP_STYLES = [
  { accent: '#D89A00', soft: '#FFF7D6', bar: 'linear-gradient(90deg, #F1C232, #D89A00)' },
  { accent: '#742CFF', soft: '#F3EEFF', bar: 'linear-gradient(90deg, #A580FF, #742CFF)' },
  { accent: '#008C66', soft: '#E8FBF5', bar: 'linear-gradient(90deg, #29BECE, #00A97A)' },
];

const FALLBACK_STYLE = { accent: '#746B80', soft: '#F4F2F6', bar: 'linear-gradient(90deg, #B5ADBE, #746B80)' };

export function groupRankingByPoints(rankingData) {
  return rankingData.reduce((groups, member) => {
    const current = groups.at(-1);
    if (current && current.points === member.points) {
      current.members.push(member);
      return groups;
    }

    groups.push({
      rank: member.rank,
      points: member.points,
      members: [member],
    });
    return groups;
  }, []);
}

export function GroupedOverviewPanel({ rankingData }) {
  const scoreGroups = groupRankingByPoints(rankingData);
  const featuredGroups = scoreGroups.slice(0, 3);
  const leaderGroup = scoreGroups[0];
  const leaderPoints = leaderGroup?.points || 0;
  const secondGroup = scoreGroups[1];
  const onePointRace = rankingData.filter(member => leaderPoints - member.points <= 1).length;
  const biggestTie = scoreGroups.reduce((largest, group) => group.members.length > largest.members.length ? group : largest, leaderGroup);
  const gridColumns = featuredGroups.length === 1 ? 'lg:grid-cols-1' : featuredGroups.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3';

  return <div className="w-full max-w-[1500px] mx-auto space-y-4">
    <section className="panel relative overflow-hidden px-4 py-5 sm:px-7 sm:py-6">
      <div className="absolute -top-28 -right-20 w-80 h-80 rounded-full bg-brand-100/70 blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-36 left-1/4 w-72 h-72 rounded-full bg-accent-100/60 blur-[100px] pointer-events-none" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand">
            <Layers3 className="w-4 h-4" />
            <p className="text-[10px] uppercase tracking-[0.24em] font-black">Ranking agrupado</p>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#17131F] tracking-tight mt-1">Pelotões da Sprint</h2>
          <p className="text-sm text-[#746B80] mt-1">Quem tem a mesma pontuação aparece junto na mesma faixa.</p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <SummaryMetric value={leaderPoints} label="Pontos na liderança" />
          <SummaryMetric value={leaderGroup?.members.length || 0} label="Líderes empatados" />
          <SummaryMetric value={onePointRace} label="A até 1 ponto" />
        </div>
      </div>

      <div className={`relative grid grid-cols-1 ${gridColumns} gap-3 sm:gap-4 mt-6`}>
        {featuredGroups.map((group, index) => <ScoreGroupCard key={`${group.rank}-${group.points}`} group={group} index={index} />)}
      </div>
    </section>

    <section className="grid grid-cols-1 lg:grid-cols-[1.5fr_.7fr] gap-4">
      <div className="panel px-4 py-5 sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-brand">Mapa da disputa</p>
            <h3 className="text-lg font-black text-[#17131F] mt-1">Distância da liderança</h3>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 text-brand text-[10px] font-black uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" /> {rankingData.length} competidores
          </span>
        </div>

        <div className="space-y-3 mt-5">
          {scoreGroups.slice(0, 6).map((group, index) => {
            const style = GROUP_STYLES[index] || FALLBACK_STYLE;
            const progress = leaderPoints > 0 ? Math.max(group.points > 0 ? 7 : 2, group.points / leaderPoints * 100) : 100;
            return <div key={`${group.rank}-${group.points}`} className="grid grid-cols-[48px_1fr_auto] sm:grid-cols-[62px_1fr_auto] gap-3 items-center">
              <span className="text-xs font-black text-[#746B80]">{group.rank}º</span>
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <span className="text-xs font-bold text-[#31293B] truncate">{group.members.length} {group.members.length === 1 ? 'competidor' : 'competidores'}</span>
                  <span className="text-[10px] font-bold text-[#91889B]">{Math.max(0, leaderPoints - group.points)} atrás</span>
                </div>
                <div className="h-2.5 rounded-full bg-[#EEEAF2] overflow-hidden">
                  <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${progress}%`, background: style.bar }} />
                </div>
              </div>
              <div className="w-12 text-right"><strong className="text-base text-[#17131F]">{group.points}</strong><span className="text-[8px] ml-1 font-black text-[#91889B]">PTS</span></div>
            </div>;
          })}
        </div>
      </div>

      <aside className="relative overflow-hidden rounded-2xl bg-[#251044] text-white px-5 py-5 sm:px-6 shadow-lg">
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-brand opacity-40 blur-[55px]" />
        <div className="absolute -left-16 -bottom-20 w-44 h-44 rounded-full bg-accent opacity-20 blur-[55px]" />
        <div className="relative">
          <span className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center"><Sparkles className="w-4 h-4 text-accent" /></span>
          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-accent mt-5">Leitura rápida</p>
          <h3 className="text-xl font-black mt-1 leading-tight">A disputa começou embolada.</h3>
          <p className="text-sm text-white/65 mt-2 leading-relaxed">{onePointRace} competidores estão a no máximo um ponto do topo. Cada check-in ainda muda bastante o desenho do ranking.</p>
          <div className="grid grid-cols-2 gap-2 mt-5">
            <QuickFact value={biggestTie?.members.length || 0} label="Maior empate" />
            <QuickFact value={secondGroup ? leaderPoints - secondGroup.points : 0} label="Gap do 1º pelotão" suffix="pt" />
          </div>
        </div>
      </aside>
    </section>
  </div>;
}

function SummaryMetric({ value, label }) {
  return <div className="min-w-0 rounded-xl border border-[#E6E0EC] bg-white/80 backdrop-blur-sm px-2.5 py-2.5 sm:px-4 sm:py-3 shadow-sm">
    <strong className="block text-lg sm:text-xl font-black text-[#17131F] leading-none">{value}</strong>
    <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider font-bold text-[#81778D] mt-1.5 leading-tight">{label}</span>
  </div>;
}

function ScoreGroupCard({ group, index }) {
  const isLeader = index === 0;
  const style = GROUP_STYLES[index] || FALLBACK_STYLE;
  const visibleLimit = isLeader ? 8 : 6;
  const visibleMembers = group.members.slice(0, visibleLimit);
  const hiddenCount = group.members.length - visibleMembers.length;

  return <article className={`relative min-w-0 overflow-hidden rounded-2xl border p-4 sm:p-5 transition-transform duration-200 hover:-translate-y-0.5 ${isLeader ? 'border-brand-700 bg-gradient-to-br from-[#251044] via-brand-800 to-brand text-white shadow-xl shadow-brand/20' : 'border-[#E6E0EC] bg-white/90 shadow-md'}`}>
    <span className={`absolute -right-3 -bottom-10 text-[150px] font-black leading-none select-none ${isLeader ? 'text-white/[0.055]' : 'text-brand/[0.04]'}`}>{group.rank}</span>
    <div className="relative flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black" style={{ background: isLeader ? 'rgba(255,255,255,.12)' : style.soft, color: isLeader ? '#FFD34E' : style.accent }}>{isLeader ? <Crown className="w-4 h-4" /> : `${group.rank}º`}</span>
          <div><p className={`text-[9px] uppercase tracking-[0.18em] font-black ${isLeader ? 'text-accent' : 'text-[#81778D]'}`}>{isLeader ? 'Liderança compartilhada' : `${group.rank}º lugar`}</p><p className={`text-xs font-bold mt-0.5 ${isLeader ? 'text-white/65' : 'text-[#746B80]'}`}>{group.members.length} {group.members.length === 1 ? 'competidor' : 'competidores empatados'}</p></div>
        </div>
      </div>
      <div className="text-right shrink-0"><strong className={`text-4xl font-black tracking-tight ${isLeader ? 'text-white' : 'text-[#17131F]'}`}>{group.points}</strong><span className="block text-[8px] font-black uppercase tracking-[0.18em]" style={{ color: isLeader ? '#00FFB6' : style.accent }}>pontos</span></div>
    </div>

    <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 mt-5">
      {visibleMembers.map(member => <MemberPill key={member.memberKey} member={member} accent={style.accent} inverted={isLeader} />)}
      {hiddenCount > 0 && <div className={`h-10 flex items-center justify-center rounded-xl border border-dashed text-[10px] font-black uppercase tracking-wider ${isLeader ? 'border-white/20 bg-white/[0.07] text-white/70' : 'border-brand-200 bg-brand-50 text-brand'}`}>+{hiddenCount} no mesmo pelotão</div>}
    </div>
  </article>;
}

function MemberPill({ member, accent, inverted }) {
  const initials = member.formattedName.split(' ').map(part => part[0]).slice(0, 2).join('');
  return <MemberTooltip member={member} accentColor={accent} style={{ minWidth: 0 }}>
    <div className={`h-10 min-w-0 flex items-center gap-2 rounded-xl border px-2.5 cursor-help transition-colors ${inverted ? 'border-white/10 bg-white/[0.09] hover:bg-white/[0.14]' : 'border-[#ECE8F1] bg-[#FAF9FC] hover:border-brand-200 hover:bg-brand-50/60'}`}>
      <span className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-[8px] font-black ${inverted ? 'bg-white text-brand' : 'bg-brand-100 text-brand'}`}>{initials}</span>
      <span className={`min-w-0 flex-1 truncate text-[11px] font-bold ${inverted ? 'text-white' : 'text-[#31293B]'}`}>{member.formattedName}</span>
      <Trend trend={member.trend} />
    </div>
  </MemberTooltip>;
}

function QuickFact({ value, label, suffix = '' }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.08] px-3 py-3">
    <div className="flex items-baseline gap-1"><strong className="text-xl font-black">{value}</strong>{suffix && <span className="text-[9px] uppercase font-black text-accent">{suffix}</span>}</div>
    <span className="block text-[8px] uppercase tracking-wider text-white/50 font-bold mt-1">{label}</span>
  </div>;
}

function Trend({ trend }) {
  return trend === 'up' ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-label="Em alta" /> : trend === 'down' ? <TrendingDown className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-label="Em queda" /> : trend === 'flat' ? <Minus className="w-3.5 h-3.5 text-[#91889B] shrink-0" aria-label="Estável" /> : null;
}
