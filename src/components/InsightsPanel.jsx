import { useMemo } from 'react';
import { Award, Crown, Flame, TrendingUp, Users } from 'lucide-react';

const WEEK_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];
const CHALLENGES = [
  ['d1', 'Desafio 1', '#F6C945'], ['d2', 'Desafio 2', '#60A5FA'],
  ['d3', 'Desafio 3', '#A78BFA'], ['d4', 'Desafio 4', '#F472B6'],
  ['d5', 'Desafio 5', '#34D399'], ['dr', 'Desafio relâmpago', '#FB923C'],
  ['gincana', 'Gincana', '#22D3EE'],
];
const valueOf = value => parseFloat(value?.toString().replace(',', '.')) || 0;

export function InsightsPanel({ rankingData, view }) {
  const data = useMemo(() => {
    const weeks = WEEK_KEYS.map((key, index) => ({ label: `Semana ${index + 1}`, value: rankingData.reduce((sum, member) => sum + valueOf(member.weeks[key]), 0) }));
    const currentWeek = [...weeks].reverse().find(week => week.value > 0);
    const weekIndex = currentWeek ? weeks.findIndex(week => week.label === currentWeek.label) : 0;
    const weeklyRanking = [...rankingData].sort((a, b) => valueOf(b.weeks[WEEK_KEYS[weekIndex]]) - valueOf(a.weeks[WEEK_KEYS[weekIndex]])).slice(0, 5);
    const highlights = CHALLENGES.map(([key, label, color]) => {
      const highest = Math.max(...rankingData.map(member => valueOf(member.challenges[key])), 0);
      const leaders = rankingData.filter(member => valueOf(member.challenges[key]) === highest && highest > 0);
      return { label, color, value: highest, leaders };
    });
    const biggestGain = weekIndex > 0 ? [...rankingData].map(member => ({ ...member, gain: valueOf(member.weeks[`s${weekIndex + 1}`]) - valueOf(member.weeks[`s${weekIndex}`]) })).sort((a, b) => b.gain - a.gain)[0] : null;
    return { weeks, currentWeek, weeklyRanking, highlights, biggestGain };
  }, [rankingData]);

  if (view === 'evolution') return <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-[1.4fr_0.9fr] gap-4">
    <section className="panel p-5"><SectionTitle icon={TrendingUp} title="Ritmo da Sprint" subtitle="Pontos consolidados por semana" /><WeeklyBars weeks={data.weeks} /></section>
    <section className="panel p-5"><SectionTitle icon={Crown} title={data.currentWeek ? `Ranking — ${data.currentWeek.label}` : 'Ranking semanal'} subtitle="Top 5 da semana mais recente" /><div className="space-y-2 mt-5">{data.weeklyRanking.map((member, index) => <div key={member.memberKey} className="flex items-center gap-3 bg-brand-50/55 border border-brand-100/70 rounded-xl px-3 py-2.5"><span className="w-5 text-center font-black text-brand">{index + 1}</span><span className="flex-1 text-sm font-semibold text-[#241D2D]">{member.formattedName}</span><span className="font-black text-[#17131F]">{member.weeks[`s${data.weeks.findIndex(week => week.label === data.currentWeek?.label) + 1}`] || 0} <small className="text-[#81778D]">pts</small></span></div>)}</div></section>
  </div>;

  return <div className="w-full max-w-6xl mx-auto space-y-4">
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{data.highlights.map(highlight => <HighlightCard key={highlight.label} highlight={highlight} />)}</div>
    {data.biggestGain?.gain > 0 && <div className="panel p-5"><SectionTitle icon={Flame} title="Virada da semana" subtitle="Maior crescimento comparado à semana anterior" /><div className="mt-3 flex items-baseline gap-2"><span className="text-xl font-black text-[#17131F]">{data.biggestGain.formattedName}</span><span className="text-[#008C66] font-black">+{data.biggestGain.gain} pontos</span></div></div>}
  </div>;
}

function HighlightCard({ highlight }) {
  const count = highlight.leaders.length;
  const preview = highlight.leaders.slice(0, 3);
  return <article className="panel relative min-h-[180px] p-5 overflow-hidden flex flex-col"><div className="absolute inset-x-0 top-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${highlight.color}, transparent)` }} /><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2" style={{ color: highlight.color }}><Award className="w-4 h-4" /><span className="text-[10px] uppercase tracking-widest font-black">{highlight.label}</span></div><span className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black" style={{ color: highlight.color, background: `${highlight.color}14`, border: `1px solid ${highlight.color}30` }}>{highlight.value ? `${highlight.value} pts` : '—'}</span></div>
    {!count ? <div className="flex-1 flex flex-col justify-center"><p className="text-base font-black text-[#504759]">Aguardando resultado</p><p className="text-xs text-[#91889B] mt-1">Ainda não há pontuação registrada.</p></div> : <div className="flex-1 flex flex-col justify-center mt-4"><div className="flex items-center gap-2 text-[#81778D]"><Users className="w-3.5 h-3.5" /><span className="text-[10px] uppercase tracking-wider font-bold">{count === 1 ? 'Líder' : `${count} participantes no topo`}</span></div>{count === 1 ? <p className="text-xl font-black text-[#17131F] mt-2 truncate">{preview[0].formattedName}</p> : <div className="flex items-center gap-2 mt-3 min-w-0">{preview.map(member => <span key={member.memberKey} className="min-w-0 max-w-[30%] truncate rounded-lg bg-[#F4F1F7] border border-[#E8E3ED] px-2.5 py-1.5 text-xs font-bold text-[#504759]">{member.formattedName}</span>)}{count > 3 && <span className="shrink-0 rounded-lg px-2 py-1.5 text-xs font-black" style={{ color: highlight.color, background: `${highlight.color}12` }}>+{count - 3}</span>}</div>}</div>}
  </article>;
}

function SectionTitle({ icon: Icon, title, subtitle }) { return <div><div className="flex items-center gap-2 text-brand"><Icon className="w-4 h-4" /><h2 className="font-black text-[#17131F]">{title}</h2></div><p className="text-xs text-[#81778D] mt-1">{subtitle}</p></div>; }
function WeeklyBars({ weeks }) {
  const max = Math.max(...weeks.map(week => week.value), 1);
  return <div className="mt-7 flex gap-2 h-52 border-b border-[#E8E3ED]">{weeks.map(week => {
    const barHeight = week.value > 0 ? Math.max(6, Math.round(week.value / max * 140)) : 4;
    return <div key={week.label} className="flex-1 h-full flex flex-col items-center justify-end"><div className="h-[168px] w-full flex flex-col items-center justify-end gap-2"><span className="text-xs text-[#241D2D] font-bold">{week.value || '—'}</span><div className="w-full max-w-14 shrink-0 rounded-t-lg bg-gradient-to-t from-brand-700 to-brand-400 shadow-sm shadow-brand/10" style={{ height: barHeight }} /></div><span className="h-8 pt-2 text-[10px] text-[#81778D] uppercase">{week.label.replace('Semana ', 'S')}</span></div>;
  })}</div>;
}
