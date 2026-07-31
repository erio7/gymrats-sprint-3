import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Search, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { MemberTooltip } from './MemberTooltip';

const ACCENT = '#3B82F6';

export function IndividualPanel({ rankingData }) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState({ field: 'points', dir: 'desc' });

  const members = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rankingData
      .filter(member => !q || member.name.toLowerCase().includes(q) || member.formattedName.toLowerCase().includes(q))
      .sort((a, b) => {
        const direction = sortBy.dir === 'desc' ? -1 : 1;
        if (sortBy.field === 'name') return a.formattedName.localeCompare(b.formattedName) * direction;
        return (a.points - b.points) * direction;
      });
  }, [query, rankingData, sortBy]);

  const totalPoints = members.reduce((total, member) => total + member.points, 0);
  const setSort = (field) => setSortBy(previous => ({
    field,
    dir: previous.field === field ? (previous.dir === 'desc' ? 'asc' : 'desc') : field === 'name' ? 'asc' : 'desc',
  }));

  return (
    <div className="w-full max-w-6xl mx-auto bg-[#0e0e16]/85 backdrop-blur-md border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:max-h-full">
      <div className="p-4 border-b border-white/[0.06] flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Buscar competidor..." value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20" />
        </div>
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold hidden sm:block">Ranking individual</span>
      </div>

      <div className="overflow-auto flex-1 min-h-0 scrollbar-thin">
        <table className="w-full min-w-[1250px] border-collapse">
          <thead className="sticky top-0 bg-[#12121a] z-10">
            <tr className="text-[9px] uppercase tracking-widest text-gray-500 font-bold border-b border-white/[0.06]">
              <th className="px-4 py-3 text-left w-14 sticky left-0 bg-[#12121a] z-20">#</th>
              <SortableHeader field="name" label="Nome" sortBy={sortBy} setSort={setSort} className="sticky left-14 bg-[#12121a] z-20 min-w-[180px]" />
              {[1, 2, 3, 4, 5, 6, 7].map(week => <th key={week} className="px-3 py-3 text-center w-16">Sem {week}</th>)}
              <th className="px-3 py-3 text-center w-24">D1 - 100k</th><th className="px-3 py-3 text-center w-24">D2 - Conv</th><th className="px-3 py-3 text-center w-24">D3 - Equipe</th><th className="px-3 py-3 text-center w-24">D4 - Mãe</th><th className="px-3 py-3 text-center w-24">D5 - Extra</th><th className="px-3 py-3 text-center w-24">Relâmpago</th><th className="px-3 py-3 text-center w-20">Gincana</th>
              <SortableHeader field="points" label="Pontos" sortBy={sortBy} setSort={setSort} className="min-w-[90px] text-center" />
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.memberKey} className="border-t border-white/[0.03] hover:bg-white/[0.02] even:bg-white/[0.005] transition-colors group">
                <td className="px-4 py-2.5 text-gray-500 font-mono text-xs sticky left-0 bg-[#0e0e16] group-hover:bg-[#12121c] transition-colors z-10">{member.rank}</td>
                <td className="px-4 py-2.5 sticky left-14 bg-[#0e0e16] group-hover:bg-[#12121c] transition-colors z-10">
                  <MemberTooltip member={member} accentColor={ACCENT}>
                    <div className="flex items-center gap-2 cursor-help">
                      <span className="text-white text-sm font-semibold truncate">{member.formattedName}</span>
                      <Trend trend={member.trend} />
                      {member.extraPoints !== '0' && <span className="text-[10px] font-black text-emerald-400">+{member.extraPoints}</span>}
                    </div>
                  </MemberTooltip>
                </td>
                {['s1', 's2', 's3', 's4', 's5', 's6', 's7'].map(key => <ValueCell key={key} value={member.weeks[key]} />)}
                {['d1', 'd2', 'd3', 'd4', 'd5', 'dr', 'gincana'].map(key => <ValueCell key={key} value={member.challenges[key]} />)}
                <td className="px-4 py-2.5 text-center text-white text-sm font-black">{member.points}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="sticky bottom-0 bg-[#12121a] z-20 border-t-2 border-white/[0.08]">
            <tr className="text-[10px] uppercase tracking-wider text-gray-400 font-bold"><td className="px-4 py-3 sticky left-0 bg-[#12121a] z-30">TOTAL</td><td className="px-4 py-3 sticky left-14 bg-[#12121a] z-30">SOMA EXIBIDA</td><td colSpan="14" className="bg-[#12121a]" /><td className="px-4 py-3 text-center font-mono font-black text-emerald-400 text-sm bg-[#12121a]">{formatTotal(totalPoints)}</td></tr>
          </tfoot>
        </table>
        {members.length === 0 && <div className="text-center py-12 text-gray-500 text-sm">Nenhum competidor encontrado.</div>}
      </div>
      <div className="px-4 py-2.5 border-t border-white/[0.06] text-[10px] uppercase tracking-widest text-gray-500 font-bold">{members.length} {members.length === 1 ? 'competidor' : 'competidores'}</div>
    </div>
  );
}

const ValueCell = ({ value }) => <td className="px-3 py-2.5 text-center font-mono text-xs"><span className="font-bold" style={{ color: !value || value === '0' || value === '0,0' ? '#4B5563' : ACCENT }}>{value || '0'}</span></td>;
const formatTotal = value => Number.isInteger(value) ? value : value.toFixed(1).replace('.', ',');
const Trend = ({ trend }) => trend === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : trend === 'down' ? <TrendingDown className="w-3 h-3 text-rose-400" /> : trend === 'flat' ? <Minus className="w-3 h-3 text-gray-500" /> : null;

function SortableHeader({ field, label, sortBy, setSort, className = '' }) {
  const active = sortBy.field === field;
  const Icon = !active ? ArrowUpDown : sortBy.dir === 'desc' ? ArrowDown : ArrowUp;
  return <th className={`px-4 py-3 text-left cursor-pointer select-none hover:text-gray-300 ${className}`} onClick={() => setSort(field)}><div className="flex items-center gap-1.5"><span>{label}</span><Icon className={`w-3 h-3 ${active ? 'text-white' : 'opacity-40'}`} /></div></th>;
}
