import { Crown, Medal, Minus, TrendingDown, TrendingUp } from 'lucide-react';

const podiumColors = ['text-yellow-300', 'text-gray-300', 'text-amber-600'];

export function OverviewPanel({ rankingData }) {
  const topTen = rankingData.slice(0, 10);
  const leader = topTen[0];
  const average = rankingData.length ? rankingData.reduce((sum, member) => sum + member.points, 0) / rankingData.length : 0;

  return <div className="w-full max-w-6xl mx-auto grid gap-4 lg:grid-cols-[1.1fr_1.9fr]">
    <section className="panel p-5 flex flex-col justify-between min-h-[220px]"><div><div className="flex items-center gap-2 text-yellow-300"><Crown className="w-5 h-5" /><span className="text-[10px] uppercase tracking-widest font-black">Líder geral</span></div><h2 className="text-3xl font-black text-white mt-6 leading-tight">{leader?.formattedName || '—'}</h2><p className="text-gray-500 text-sm mt-1">{leader ? `Posição ${leader.rank} no ranking` : 'Aguardando dados'}</p></div><div className="mt-7"><div className="flex items-end gap-2"><strong className="text-4xl font-black text-white">{leader?.points || 0}</strong><span className="text-xs font-bold text-blue-400 mb-1">/ 85 pontos</span></div><Progress value={leader?.points || 0} color="from-yellow-500 to-amber-300" /></div></section>
    <section className="panel overflow-hidden"><div className="flex items-center justify-between px-5 pt-5 pb-3"><div><div className="flex items-center gap-2 text-blue-400"><Medal className="w-4 h-4" /><h2 className="font-black text-white">Top 10 geral</h2></div><p className="text-xs text-gray-500 mt-1">Ranking por pontos consolidados</p></div><span className="text-xs text-gray-500">Média: <b className="text-gray-300">{average.toFixed(1)}</b></span></div><ol className="divide-y divide-white/[0.05]">{topTen.map((member, index) => <li key={member.memberKey} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors"><span className={`font-black text-center ${podiumColors[index] || 'text-gray-500'}`}>{member.rank}º</span><div className="min-w-0"><div className="flex items-center gap-2"><span className="text-sm font-bold text-white truncate">{member.formattedName}</span><Trend trend={member.trend} /></div><Progress value={member.points} /></div><div className="text-right"><span className="text-lg font-black text-white">{member.points}</span><span className="ml-1 text-[10px] text-gray-500 font-bold">PTS</span></div></li>)}</ol></section>
  </div>;
}

function Progress({ value, color = 'from-blue-700 to-cyan-400' }) { return <div className="h-1.5 w-full rounded-full bg-white/[0.06] mt-2 overflow-hidden"><div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${Math.min(100, Math.max(0, (value / 85) * 100))}%` }} /></div>; }
function Trend({ trend }) { return trend === 'up' ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-label="Em alta" /> : trend === 'down' ? <TrendingDown className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-label="Em queda" /> : trend === 'flat' ? <Minus className="w-3.5 h-3.5 text-gray-500 shrink-0" aria-label="Estável" /> : null; }
