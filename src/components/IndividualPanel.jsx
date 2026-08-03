import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Minus, Search, TrendingDown, TrendingUp } from 'lucide-react';
import { MemberTooltip } from './MemberTooltip';

const ACCENT = '#742CFF';
const WEEK_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];
const CHALLENGE_KEYS = ['d1', 'd2', 'd3', 'd4', 'd5', 'dr', 'gincana'];

export function IndividualPanel({ rankingData }) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState({ field: 'points', dir: 'desc' });
  const [scoreRange, setScoreRange] = useState('all');

  const members = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rankingData.filter(member => {
      const matchesQuery = !q || member.name.toLowerCase().includes(q) || member.formattedName.toLowerCase().includes(q);
      const matchesRange = scoreRange === 'all' || (scoreRange === '0-25' && member.points <= 25) || (scoreRange === '26-50' && member.points >= 26 && member.points <= 50) || (scoreRange === '51-84' && member.points >= 51 && member.points < 85) || (scoreRange === '85' && member.points >= 85);
      return matchesQuery && matchesRange;
    }).sort((a, b) => {
      const direction = sortBy.dir === 'desc' ? -1 : 1;
      return (sortBy.field === 'name' ? a.formattedName.localeCompare(b.formattedName) : a.points - b.points) * direction;
    });
  }, [query, rankingData, scoreRange, sortBy]);

  const totalPoints = members.reduce((total, member) => total + member.points, 0);
  const setSort = field => setSortBy(previous => ({ field, dir: previous.field === field ? (previous.dir === 'desc' ? 'asc' : 'desc') : field === 'name' ? 'asc' : 'desc' }));

  return <div className="w-full max-w-[1500px] mx-auto bg-white border border-[#E8E5EF] rounded-2xl shadow-lg overflow-hidden flex flex-col md:max-h-full">
    <div className="p-4 border-b border-[#ECE8F1] flex flex-col sm:flex-row sm:items-center gap-3"><div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#81778D]" /><input type="text" placeholder="Buscar competidor..." value={query} onChange={event => setQuery(event.target.value)} className="w-full bg-[#FAF9FC] border border-[#E5E0EA] rounded-lg pl-9 pr-3 py-2 text-sm text-[#241D2D] placeholder-[#9A92A3] focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100" /></div><select value={scoreRange} onChange={event => setScoreRange(event.target.value)} className="bg-[#FAF9FC] border border-[#E5E0EA] rounded-lg px-3 py-2 text-xs text-[#504759] focus:outline-none focus:border-brand-300"><option value="all">Todos os pontos</option><option value="0-25">0–25 pontos</option><option value="26-50">26–50 pontos</option><option value="51-84">51–84 pontos</option><option value="85">85 pontos</option></select><span className="text-[10px] text-[#81778D] uppercase tracking-widest font-bold hidden lg:block">Ranking individual</span></div>

    <div className="hidden lg:block overflow-y-auto overflow-x-hidden flex-1 min-h-0 scrollbar-thin"><table className="w-full table-fixed border-collapse"><colgroup><col className="w-10" /><col className="w-[180px]" />{Array.from({ length: 14 }).map((_, index) => <col key={index} />)}<col className="w-20" /></colgroup><thead className="sticky top-0 bg-[#F3F0F6] z-10"><tr className="text-[9px] uppercase tracking-widest text-[#746B80] font-bold border-b border-[#E4DFE9]"><th className="px-1 py-3 text-center">#</th><SortableHeader field="name" label="Nome" sortBy={sortBy} setSort={setSort} />{[1, 2, 3, 4, 5, 6, 7].map(week => <th key={week} className="px-1 py-3 text-center leading-tight">Sem<br />{week}</th>)}{[1, 2, 3, 4, 5].map(challenge => <th key={challenge} className="px-1 py-3 text-center leading-tight">D{challenge}</th>)}<th className="px-1 py-3 text-center leading-tight">Relâm.</th><th className="px-1 py-3 text-center leading-tight">Gincana</th><SortableHeader field="points" label="Pontos" sortBy={sortBy} setSort={setSort} className="text-center" /></tr></thead>
      <tbody>{members.map(member => <tr key={member.memberKey} className="border-t border-[#F0EDF3] hover:bg-brand-50/45 even:bg-[#FCFBFD] transition-colors"><td className="px-1 py-2.5 text-center text-[#81778D] font-mono text-xs">{member.rank}</td><td className="px-2 py-2.5 min-w-0"><MemberTooltip member={member} accentColor={ACCENT}><div className="flex items-center gap-1.5 cursor-help min-w-0"><span className="text-[#241D2D] text-sm font-semibold truncate">{member.formattedName}</span><Trend trend={member.trend} />{member.extraPoints !== '0' && <span className="text-[10px] font-black text-[#008C66]">+{member.extraPoints}</span>}</div></MemberTooltip></td>{WEEK_KEYS.map(key => <ValueCell key={key} value={member.weeks[key]} />)}{CHALLENGE_KEYS.map(key => <ValueCell key={key} value={member.challenges[key]} />)}<td className="px-1 py-2.5 text-center text-brand text-sm font-black">{member.points}</td></tr>)}</tbody>
      <tfoot className="sticky bottom-0 bg-[#F3F0F6] z-20 border-t-2 border-[#DED8E4]"><tr className="text-[10px] uppercase tracking-wider text-[#746B80] font-bold"><td className="px-1 py-3 text-center">Total</td><td className="px-2 py-3">Soma exibida</td><td colSpan="14" /><td className="px-1 py-3 text-center font-mono font-black text-[#008C66] text-sm">{formatTotal(totalPoints)}</td></tr></tfoot></table></div>

    <div className="lg:hidden divide-y divide-[#ECE8F1]">{members.map(member => <MobileMemberCard key={member.memberKey} member={member} />)}</div>
    {!members.length && <div className="text-center py-12 text-[#81778D] text-sm">Nenhum competidor encontrado.</div>}
    <div className="px-4 py-2.5 border-t border-[#ECE8F1] text-[10px] uppercase tracking-widest text-[#81778D] font-bold">{members.length} {members.length === 1 ? 'competidor' : 'competidores'}</div>
  </div>;
}

function MobileMemberCard({ member }) {
  const metrics = [...WEEK_KEYS.map((key, index) => [`S${index + 1}`, member.weeks[key]]), ...[['D1', 'd1'], ['D2', 'd2'], ['D3', 'd3'], ['D4', 'd4'], ['D5', 'd5'], ['Relâm.', 'dr'], ['Ginc.', 'gincana']].map(([label, key]) => [label, member.challenges[key]])];
  return <details className="group px-4 py-3"><summary className="list-none cursor-pointer flex items-center gap-3"><span className="w-8 text-sm font-black text-brand">{member.rank}º</span><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="font-bold text-[#241D2D] truncate">{member.formattedName}</span><Trend trend={member.trend} /></div><div className="h-1.5 bg-[#EEEAF2] rounded-full mt-2 overflow-hidden"><div className="h-full bg-brand rounded-full" style={{ width: `${Math.min(100, member.points / 85 * 100)}%` }} /></div></div><span className="text-xl font-black text-brand">{member.points}</span></summary><div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-[#ECE8F1]">{metrics.map(([label, value]) => <div key={label} className="rounded-lg bg-[#F7F4FA] px-2 py-2 text-center"><div className="text-[9px] uppercase font-bold text-[#81778D]">{label}</div><div className="text-sm font-black text-brand mt-0.5">{value || 0}</div></div>)}</div></details>;
}

const ValueCell = ({ value }) => <td className="px-1 py-2.5 text-center font-mono text-xs"><span className="font-bold" style={{ color: !value || value === '0' || value === '0,0' ? '#A39AAE' : ACCENT }}>{value || '0'}</span></td>;
const formatTotal = value => Number.isInteger(value) ? value : value.toFixed(1).replace('.', ',');
const Trend = ({ trend }) => trend === 'up' ? <TrendingUp className="w-3 h-3 text-[#00A97A] shrink-0" /> : trend === 'down' ? <TrendingDown className="w-3 h-3 text-rose-400 shrink-0" /> : trend === 'flat' ? <Minus className="w-3 h-3 text-[#91889B] shrink-0" /> : null;

function SortableHeader({ field, label, sortBy, setSort, className = '' }) {
  const active = sortBy.field === field;
  const Icon = !active ? ArrowUpDown : sortBy.dir === 'desc' ? ArrowDown : ArrowUp;
  return <th className={`px-2 py-3 text-left cursor-pointer select-none hover:text-brand ${className}`} onClick={() => setSort(field)}><div className={`flex items-center gap-1 ${field === 'points' ? 'justify-center' : ''}`}><span>{label}</span><Icon className={`w-3 h-3 shrink-0 ${active ? 'text-brand' : 'opacity-40'}`} /></div></th>;
}
