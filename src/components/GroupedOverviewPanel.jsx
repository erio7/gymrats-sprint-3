import { Crown, Layers3, Minus, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { CHALLENGE_END, CHALLENGE_START } from '../config';
import { groupRankingByPoints } from '../lib/ranking';
import { GroupMembersTooltip } from './GroupMembersTooltip';
import { MemberTooltip } from './MemberTooltip';
import { SprintJourney } from './SprintJourney';
import { WorkoutCuriosityCarousel } from './WorkoutCuriosityCarousel';

const GROUP_STYLES = [
  { accent: '#D89A00', soft: '#FFF7D6', bar: 'linear-gradient(90deg, #F1C232, #D89A00)' },
  { accent: '#742CFF', soft: '#F3EEFF', bar: 'linear-gradient(90deg, #A580FF, #742CFF)' },
  { accent: '#008C66', soft: '#E8FBF5', bar: 'linear-gradient(90deg, #29BECE, #00A97A)' },
];

const FALLBACK_STYLE = { accent: '#746B80', soft: '#F4F2F6', bar: 'linear-gradient(90deg, #B5ADBE, #746B80)' };

export function GroupedOverviewPanel({ rankingData, datasetData = [] }) {
  const scoreGroups = groupRankingByPoints(rankingData);
  const featuredGroups = scoreGroups.slice(0, 3);
  const leaderGroup = scoreGroups[0];
  const leaderPoints = leaderGroup?.points || 0;
  const featuredHasTie = featuredGroups.some(group => group.members.length > 1);
  const allTogether = scoreGroups.length === 1;
  const viewTitle = featuredHasTie ? 'Grupos da Sprint' : 'Corrida da Sprint';
  const viewDescription = allTogether
    ? rankingData.length === 1
      ? 'O primeiro competidor já inaugurou o ranking.'
      : `Todos os ${rankingData.length} competidores estão na mesma faixa de pontuação.`
    : featuredHasTie
      ? 'Quem tem a mesma pontuação aparece junto na mesma faixa.'
      : 'As maiores pontuações aparecem em destaque, sem empates no momento.';
  const gridColumns = featuredGroups.length === 1 ? 'lg:grid-cols-1' : featuredGroups.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3';

  return <div className="relative w-full max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch min-[1700px]:left-1/2 min-[1700px]:w-[calc(100vw-2rem)] min-[1700px]:max-w-[1880px] min-[1700px]:-translate-x-1/2 min-[1700px]:grid-cols-[270px_minmax(0,1fr)_320px]">
    <aside className="order-2 min-w-0 min-[1700px]:order-1">
      <WorkoutCuriosityCarousel datasetData={datasetData} />
    </aside>

    <div className="order-1 min-w-0 space-y-2.5 lg:col-span-2 min-[1700px]:order-2 min-[1700px]:col-span-1">
      <section className="panel relative overflow-hidden px-4 py-3.5 sm:px-4 sm:py-4">
        <div className="absolute -top-28 -right-20 w-80 h-80 rounded-full bg-brand-100/70 blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-36 left-1/4 w-72 h-72 rounded-full bg-accent-100/60 blur-[100px] pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-2 text-brand">
            <Layers3 className="w-4 h-4" />
            <p className="text-[10px] uppercase tracking-[0.24em] font-black">Ranking agrupado</p>
          </div>
          <h2 className="text-xl font-black text-[#17131F] tracking-tight mt-0.5">{viewTitle}</h2>
          <p className="text-xs text-[#746B80] mt-1">{viewDescription}</p>
        </div>

        <div className={`relative grid grid-cols-1 ${gridColumns} gap-2.5 mt-3`}>
          {featuredGroups.map((group, index) => <ScoreGroupCard key={`${group.rank}-${group.points}`} group={group} index={index} />)}
        </div>
      </section>

      <section className="panel px-4 py-3 sm:px-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-brand">Mapa da disputa</p>
              <h3 className="text-base font-black text-[#17131F] mt-1">Distribuição da disputa</h3>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 text-brand text-[9px] font-black uppercase tracking-wider">
              <Users className="w-3 h-3" /> {rankingData.length} competidores
            </span>
          </div>

          <div className="space-y-2 mt-3">
            {scoreGroups.slice(0, 4).map((group, index) => {
              const style = GROUP_STYLES[index] || FALLBACK_STYLE;
              const progress = rankingData.length ? group.members.length / rankingData.length * 100 : 0;
              return <div key={`${group.rank}-${group.points}`} className="grid grid-cols-[42px_1fr_auto] sm:grid-cols-[52px_1fr_auto] gap-2.5 items-center">
                <span className="text-xs font-black text-[#746B80]">{group.rank}º</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-bold text-[#31293B] truncate">{group.members.length} de {rankingData.length} {rankingData.length === 1 ? 'competidor' : 'competidores'}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#EEEAF2] overflow-hidden">
                    <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${progress}%`, background: style.bar }} />
                  </div>
                </div>
                <div className="w-12 text-right"><strong className="text-base text-[#17131F]">{group.points}</strong><span className="text-[8px] ml-1 font-black text-[#91889B]">PTS</span></div>
              </div>;
            })}
          </div>
      </section>
    </div>

    <aside className="order-3 min-w-0 min-[1700px]:order-3">
      <SprintJourney startDate={CHALLENGE_START} endDate={CHALLENGE_END} />
    </aside>
  </div>;
}

function ScoreGroupCard({ group, index }) {
  const isLeader = index === 0;
  const sharedLead = isLeader && group.members.length > 1;
  const style = GROUP_STYLES[index] || FALLBACK_STYLE;
  const visibleLimit = isLeader ? 6 : 4;
  const visibleMembers = group.members.slice(0, visibleLimit);
  const hiddenCount = group.members.length - visibleMembers.length;

  return <article className={`relative min-w-0 overflow-hidden rounded-2xl border p-3 sm:p-3.5 transition-transform duration-200 hover:-translate-y-0.5 ${isLeader ? 'border-brand-700 bg-gradient-to-br from-[#251044] via-brand-800 to-brand text-white shadow-xl shadow-brand/20' : 'border-[#E6E0EC] bg-white/90 shadow-md'}`}>
    <span className={`absolute -right-3 -bottom-9 text-[120px] font-black leading-none select-none ${isLeader ? 'text-white/[0.055]' : 'text-brand/[0.04]'}`}>{group.rank}</span>
    <div className="relative flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: isLeader ? 'rgba(255,255,255,.12)' : style.soft, color: isLeader ? '#FFD34E' : style.accent }}>{isLeader ? <Crown className="w-3.5 h-3.5" /> : `${group.rank}º`}</span>
          <div><p className={`text-[9px] uppercase tracking-[0.18em] font-black ${isLeader ? 'text-accent' : 'text-[#81778D]'}`}>{isLeader ? (sharedLead ? 'Liderança compartilhada' : 'Líder atual') : `${group.rank}º lugar`}</p><p className={`text-xs font-bold mt-0.5 ${isLeader ? 'text-white/65' : 'text-[#746B80]'}`}>{group.members.length} {group.members.length === 1 ? 'competidor' : 'competidores empatados'}</p></div>
        </div>
      </div>
      <div className="text-right shrink-0"><strong className={`text-3xl font-black tracking-tight ${isLeader ? 'text-white' : 'text-[#17131F]'}`}>{group.points}</strong><span className="block text-[8px] font-black uppercase tracking-[0.18em]" style={{ color: isLeader ? '#00FFB6' : style.accent }}>pontos</span></div>
    </div>

    <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-1.5 mt-3">
      {visibleMembers.map(member => <MemberPill key={member.memberKey} member={member} accent={style.accent} inverted={isLeader} />)}
      {hiddenCount > 0 && <GroupMembersTooltip members={group.members} rank={group.rank} points={group.points} accent={style.accent}>
        <div className={`h-8 flex items-center justify-center rounded-lg border border-dashed text-[9px] font-black uppercase tracking-wider cursor-help transition-colors ${isLeader ? 'border-white/20 bg-white/[0.07] text-white/70 hover:bg-white/[0.13]' : 'border-brand-200 bg-brand-50 text-brand hover:bg-brand-100'}`}>+{hiddenCount} no mesmo grupo</div>
      </GroupMembersTooltip>}
    </div>
  </article>;
}

function MemberPill({ member, accent, inverted }) {
  const initials = member.formattedName.split(' ').map(part => part[0]).slice(0, 2).join('');
  return <MemberTooltip member={member} accentColor={accent} style={{ minWidth: 0 }}>
    <div className={`h-8 min-w-0 flex items-center gap-2 rounded-lg border px-2 cursor-help transition-colors ${inverted ? 'border-white/10 bg-white/[0.09] hover:bg-white/[0.14]' : 'border-[#ECE8F1] bg-[#FAF9FC] hover:border-brand-200 hover:bg-brand-50/60'}`}>
      <span className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-[8px] font-black ${inverted ? 'bg-white text-brand' : 'bg-brand-100 text-brand'}`}>{initials}</span>
      <span className={`min-w-0 flex-1 truncate text-[10px] font-bold ${inverted ? 'text-white' : 'text-[#31293B]'}`}>{member.formattedName}</span>
      <Trend trend={member.trend} />
    </div>
  </MemberTooltip>;
}

function Trend({ trend }) {
  return trend === 'up' ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-label="Em alta" /> : trend === 'down' ? <TrendingDown className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-label="Em queda" /> : trend === 'flat' ? <Minus className="w-3.5 h-3.5 text-[#91889B] shrink-0" aria-label="Estável" /> : null;
}
