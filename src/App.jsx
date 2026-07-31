import { useMemo } from 'react';
import { AlertCircle, Clock, Loader2, Route, Trophy, Users } from 'lucide-react';
import TD_LOGO_URL from './tdbusiness_logo.jpg';
import { CHALLENGE_END, CHALLENGE_START, CSV_URL, FEED_CSV_URL, REFRESH_INTERVAL_MS } from './config';
import { IndividualPanel } from './components/IndividualPanel';
import { ChallengeCountdown } from './components/ChallengeCountdown';
import { MediaFeed } from './components/MediaFeed';
import { StatCard } from './components/StatCard';
import { useGoogleSheetsData } from './hooks/useGoogleSheetsData';
import { computeRanking } from './lib/ranking';

export default function App() {
  const { data, feedData, loading, error } = useGoogleSheetsData({ rankingUrl: CSV_URL, feedUrl: FEED_CSV_URL, refreshIntervalMs: REFRESH_INTERVAL_MS });
  const { rankingData, totalKm, totalMembers, lastUpdate } = useMemo(() => computeRanking(data), [data]);
  const totalPoints = rankingData.reduce((sum, member) => sum + member.points, 0);

  if (loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><div className="flex flex-col items-center gap-4"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /><p className="text-gray-500 font-medium tracking-widest uppercase">Carregando Gym Rats...</p></div></div>;
  if (error) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6"><div className="bg-[#12121a] p-8 rounded-2xl shadow-xl border border-red-900/30 max-w-md w-full text-center"><AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" /><h2 className="text-xl font-bold text-white mb-2">Erro de Conexão</h2><p className="text-gray-400 mb-6">{error}</p><button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold">Tentar novamente</button></div></div>;

  return <div className="h-screen bg-[#030305] text-gray-200 font-sans flex flex-col relative overflow-hidden">
    <div className="fixed inset-0 pointer-events-none z-0"><div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[90vw] h-[60vw] rounded-full filter blur-[140px] opacity-20" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.35) 0%, rgba(0,0,0,0) 70%)' }} /><div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, transparent 30%, rgba(3,3,5,0.6) 100%)' }} /></div>
    <header className="relative z-10 border-b border-white/[0.04] bg-[#0a0a0f]/70 backdrop-blur-sm"><div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3"><img src={TD_LOGO_URL} alt="TD Business" className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover bg-[#12121a]" /><div><h1 className="text-base sm:text-xl font-black text-white tracking-tight uppercase">GYM RATS <span className="text-blue-500">SPRINT</span></h1><p className="text-[10px] sm:text-[11px] text-gray-500 font-medium uppercase tracking-wider flex items-center gap-1.5 flex-wrap mt-0.5"><Users className="w-3 h-3" /> {totalMembers} Competidores{lastUpdate && <><span className="opacity-30">·</span><Clock className="w-3 h-3" /> {lastUpdate}</>}</p></div></div>
      <div className="flex items-stretch justify-center gap-2 sm:gap-3 pb-0.5 w-full sm:w-auto"><div className="hidden md:flex items-stretch gap-2"><StatCard icon={Route} color="text-green-500" value={totalKm} label="Km Percorridos" /><StatCard icon={Trophy} color="text-blue-500" value={totalPoints} label="Total de Pontos" /></div><ChallengeCountdown startDate={CHALLENGE_START} endDate={CHALLENGE_END} /></div>
    </div></header>
    <MediaFeed feedData={feedData} />
    <main className="relative z-10 flex-1 overflow-y-auto md:overflow-hidden w-full flex justify-center"><div className="w-full max-w-[1600px] px-2 sm:px-6 lg:px-12 pt-4 sm:pt-6 pb-4 md:pb-0 md:h-full flex flex-col md:h-full">{rankingData.length ? <IndividualPanel rankingData={rankingData} /> : <div className="text-gray-500 w-full text-center py-20">Sem dados suficientes para listar competidores.</div>}</div></main>
  </div>;
}
