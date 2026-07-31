import { useMemo } from 'react';
import { Award, Crown, Flame, TrendingUp } from 'lucide-react';

const WEEK_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];
const CHALLENGES = [
  ['d1', 'Desafio 100 km'], ['d2', 'Desafio convidado'], ['d3', 'Desafio em equipe'],
  ['d4', 'Desafio mãe'], ['d5', 'Desafio extra'], ['dr', 'Relâmpago'], ['gincana', 'Gincana'],
];
const valueOf = value => parseFloat(value?.toString().replace(',', '.')) || 0;

export function InsightsPanel({ rankingData, view }) {
  const data = useMemo(() => {
    const weeks = WEEK_KEYS.map((key, index) => ({ label: `Semana ${index + 1}`, value: rankingData.reduce((sum, member) => sum + valueOf(member.weeks[key]), 0) }));
    const currentWeek = [...weeks].reverse().find(week => week.value > 0);
    const weekIndex = currentWeek ? weeks.findIndex(week => week.label === currentWeek.label) : 0;
    const weeklyRanking = [...rankingData].sort((a, b) => valueOf(b.weeks[WEEK_KEYS[weekIndex]]) - valueOf(a.weeks[WEEK_KEYS[weekIndex]])).slice(0, 5);
    const highlights = CHALLENGES.map(([key, label]) => {
      const highest = Math.max(...rankingData.map(member => valueOf(member.challenges[key])), 0);
      const leaders = rankingData.filter(member => valueOf(member.challenges[key]) === highest && highest > 0);
      return { label, value: highest, leaders };
    });
    const biggestGain = [...rankingData].map(member => ({ ...member, gain: valueOf(member.weeks[`s${weekIndex + 1}`]) - valueOf(member.weeks[`s${weekIndex}`]) })).sort((a, b) => b.gain - a.gain)[0];
    return { weeks, currentWeek, weeklyRanking, highlights, biggestGain };
  }, [rankingData]);

  if (view === 'evolution') return <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-[1.4fr_0.9fr] gap-4">
    <section className="panel p-5"><SectionTitle icon={TrendingUp} title="Ritmo da Sprint" subtitle="Pontos consolidados por semana" /><WeeklyBars weeks={data.weeks} /></section>
    <section className="panel p-5"><SectionTitle icon={Crown} title={data.currentWeek ? `Ranking — ${data.currentWeek.label}` : 'Ranking semanal'} subtitle="Top 5 da semana mais recente" />
      <div className="space-y-2 mt-5">{data.weeklyRanking.map((member, index) => <div key={member.memberKey} className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-3 py-2.5"><span className="w-5 text-center font-black text-blue-400">{index + 1}</span><span className="flex-1 text-sm font-semibold text-white">{member.formattedName}</span><span className="font-black text-white">{member.weeks[`s${data.weeks.findIndex(w => w.label === data.currentWeek?.label) + 1}`] || 0} <small className="text-gray-500">pts</small></span></div>)}</div>
    </section>
  </div>;

  return <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 xl:grid-cols-3 gap-4">
    {data.highlights.map((highlight) => <div key={highlight.label} className="panel p-5"><div className="flex items-center gap-2 text-amber-300"><Award className="w-4 h-4" /><span className="text-[10px] uppercase tracking-widest font-bold">{highlight.label}</span></div><div className="mt-4 flex items-end justify-between gap-3"><div className="text-lg font-black text-white leading-tight">{highlight.leaders.length ? highlight.leaders.map(member => member.formattedName).join(', ') : 'Sem pontuação'}</div><div className="text-2xl font-black text-amber-300">{highlight.value}</div></div></div>)}
    {data.biggestGain && <div className="panel p-5 md:col-span-2 xl:col-span-3"><SectionTitle icon={Flame} title="Virada da semana" subtitle="Maior crescimento na semana mais recente" /><div className="mt-3 text-xl font-black text-white">{data.biggestGain.formattedName} <span className="text-emerald-400">+{Math.max(0, data.biggestGain.gain)} pontos</span></div></div>}
  </div>;
}

function SectionTitle({ icon: Icon, title, subtitle }) { return <div><div className="flex items-center gap-2 text-blue-400"><Icon className="w-4 h-4" /><h2 className="font-black text-white">{title}</h2></div><p className="text-xs text-gray-500 mt-1">{subtitle}</p></div>; }
function WeeklyBars({ weeks }) { const max = Math.max(...weeks.map(week => week.value), 1); return <div className="mt-7 flex items-end gap-2 h-52">{weeks.map(week => <div key={week.label} className="flex-1 h-full flex flex-col justify-end items-center gap-2"><span className="text-xs text-white font-bold">{week.value || '—'}</span><div className="w-full max-w-14 rounded-t-lg bg-gradient-to-t from-blue-700 to-cyan-400 min-h-[4px]" style={{ height: `${(week.value / max) * 100}%` }} /><span className="text-[10px] text-gray-500 uppercase">{week.label.replace('Semana ', 'S')}</span></div>)}</div>; }
