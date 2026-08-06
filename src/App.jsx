import { useMemo, useState } from 'react';
import { AlertCircle, ClipboardList, Clock, LayoutDashboard, Loader2, Route, Trophy, Users } from 'lucide-react';
import TD_LOGO_URL from './tdbusiness_logo.jpg';
import { CHALLENGE_END, CHALLENGE_START, CSV_URL, DATASET_CSV_URL, FEED_CSV_URL, REFRESH_INTERVAL_MS } from './config';
import { ChallengeCountdown } from './components/ChallengeCountdown';
import { DashboardWorkspace } from './components/DashboardWorkspace';
import { IndividualPanel } from './components/IndividualPanel';
import { MediaFeed } from './components/MediaFeed';
import { GroupedOverviewPanel } from './components/GroupedOverviewPanel';
import { OverviewPanel } from './components/OverviewPanel';
import { StatCard } from './components/StatCard';
import { useGoogleSheetsData } from './hooks/useGoogleSheetsData';
import { computeRanking } from './lib/ranking';

const NAV_ITEMS = [['overview', LayoutDashboard, 'Resumo'], ['podium', Trophy, 'Pódio'], ['ranking', ClipboardList, 'Ranking completo']];

export default function App() {
  const { data, feedData, datasetData, totalKm, loading, error } = useGoogleSheetsData({ rankingUrl: CSV_URL, feedUrl: FEED_CSV_URL, datasetUrl: DATASET_CSV_URL, refreshIntervalMs: REFRESH_INTERVAL_MS });
  const { rankingData, totalMembers, lastUpdate } = useMemo(() => computeRanking(data), [data]);
  const totalPoints = rankingData.reduce((sum, member) => sum + member.points, 0);
  const [page, setPage] = useState('overview');

  const content = loading ? <div className="min-h-[320px] rounded-2xl border border-[#E8E5EF] bg-white flex flex-col items-center justify-center gap-3"><Loader2 className="w-8 h-8 animate-spin text-brand" /><p className="text-[11px] text-[#746B80] font-bold tracking-widest uppercase">Sincronizando ranking...</p></div>
    : error && !rankingData.length ? <div className="min-h-[320px] rounded-2xl border border-red-200 bg-white flex items-center justify-center p-6"><div className="max-w-md w-full text-center"><AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" /><h2 className="text-xl font-bold text-[#17131F] mb-2">Erro de conexão</h2><p className="text-[#746B80] mb-5">{error}</p><button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-brand hover:bg-brand-700 text-white rounded-xl font-semibold">Tentar novamente</button></div></div>
      : !rankingData.length ? <div className="text-gray-500 w-full text-center py-20">Sem dados suficientes para listar competidores.</div>
        : page === 'overview' ? <GroupedOverviewPanel rankingData={rankingData} /> : page === 'podium' ? <OverviewPanel rankingData={rankingData} /> : <IndividualPanel rankingData={rankingData} />;

  return <div className="dashboard-shell h-screen h-[100dvh] overflow-hidden bg-[#F7F7FB] text-[#17131F] font-sans flex flex-col relative">
    <div className="fixed inset-0 pointer-events-none z-0"><div className="absolute -top-40 left-1/3 w-[48rem] h-[32rem] rounded-full blur-[140px] opacity-30 bg-brand-100" /><div className="absolute -bottom-40 right-0 w-[36rem] h-[28rem] rounded-full blur-[140px] opacity-30 bg-accent-100" /></div>
    <header className="relative z-40 shrink-0 border-b border-[#E9E5F0] bg-white/90 backdrop-blur-md shadow-sm">
      <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-6 lg:px-12 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-auto min-w-0 flex items-center gap-3">
          <img src={TD_LOGO_URL} alt="TD Business" className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shadow-sm shrink-0" />
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black text-[#17131F] tracking-tight uppercase truncate">GYM RATS <span className="text-brand">SPRINT 3</span></h1>
            <p className="text-[10px] sm:text-[11px] text-[#7B7286] font-medium uppercase tracking-wider flex items-center gap-1.5 flex-wrap mt-0.5">
              <Users className="w-3 h-3 text-brand" />
              {loading ? 'Sincronizando dados' : `${totalMembers} Competidores`}
              {lastUpdate && <><span className="opacity-30">·</span><Clock className="w-3 h-3" /> {lastUpdate}</>}
            </p>
          </div>
        </div>
        <div className="flex items-stretch justify-center gap-2 sm:gap-3 pb-0.5 w-full sm:w-auto">
          <div className="hidden md:flex items-stretch gap-2">
            <StatCard icon={Route} color="text-[#00A97A]" value={totalKm ?? '-'} isFloat={totalKm !== null && !Number.isInteger(totalKm)} label="Km Percorridos" />
            <StatCard icon={Trophy} color="text-brand" value={loading ? '-' : totalPoints} label="Total de Pontos" />
          </div>
          <ChallengeCountdown startDate={CHALLENGE_START} endDate={CHALLENGE_END} />
        </div>
      </div>
    </header>
    <MediaFeed feedData={feedData} />
    <main className="relative z-10 flex-1 min-h-0 w-full flex justify-center overflow-hidden"><div className="w-full max-w-[1600px] min-w-0 h-full px-2 sm:px-6 lg:px-12 flex flex-col"><nav className="relative z-30 shrink-0 grid grid-cols-1 min-[320px]:grid-cols-2 sm:flex sm:min-h-[60px] items-center gap-2 py-2 sm:py-3 bg-[#F7F7FB]/95 backdrop-blur-md border-b border-[#E9E5F0]">{NAV_ITEMS.map(([id, Icon, label]) => <button key={id} onClick={() => setPage(id)} className={`min-w-0 h-9 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 rounded-xl border text-[9px] sm:text-xs font-black uppercase tracking-wider whitespace-nowrap transition-colors ${page === id ? 'bg-brand border-brand text-white shadow-md shadow-brand/20' : 'bg-white border-[#E8E5EF] text-[#746B80] hover:text-brand hover:border-brand-200'}`}><Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />{label}</button>)}</nav><div className="min-w-0 flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-thin py-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"><DashboardWorkspace datasetData={datasetData}>{content}</DashboardWorkspace></div></div></main>
  </div>;
}
