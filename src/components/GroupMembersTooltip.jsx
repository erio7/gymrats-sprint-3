import { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Users } from 'lucide-react';

export function GroupMembersTooltip({ members, rank, points, accent, children }) {
  const [tooltip, setTooltip] = useState(null);
  const triggerRef = useRef(null);

  const showTooltip = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const columns = members.length > 12 ? 3 : 2;
    const width = Math.min(columns === 3 ? 520 : 380, viewportWidth - 24);
    const estimatedHeight = 76 + Math.ceil(members.length / columns) * 30;
    const placeAbove = rect.top >= estimatedHeight + 12;
    const x = Math.min(viewportWidth - width / 2 - 12, Math.max(width / 2 + 12, rect.left + rect.width / 2));
    setTooltip({ x, y: placeAbove ? rect.top - 8 : rect.bottom + 8, width, placeAbove });
  };

  return <>
    <div ref={triggerRef} className="min-w-0" onMouseEnter={showTooltip} onMouseLeave={() => setTooltip(null)}>
      {children}
    </div>
    {tooltip && ReactDOM.createPortal(
      <div
        className="fixed z-[9999] pointer-events-none"
        style={{
          left: tooltip.x,
          top: tooltip.y,
          width: tooltip.width,
          transform: tooltip.placeAbove ? 'translate(-50%, -100%)' : 'translateX(-50%)',
        }}
      >
        <div className="rounded-2xl border border-[#E6E0EC] bg-white/95 backdrop-blur-xl p-3.5 shadow-2xl" style={{ boxShadow: `0 20px 50px rgba(40, 22, 58, .20), 0 0 0 1px ${accent}14` }}>
          <div className="flex items-center justify-between gap-3 pb-2.5 mb-2.5 border-b border-[#ECE8F1]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${accent}16`, color: accent }}><Users className="w-3.5 h-3.5" /></span>
              <div className="min-w-0"><p className="text-[10px] uppercase tracking-[0.16em] font-black text-[#31293B]">Grupo do {rank}º lugar</p><p className="text-[9px] text-[#81778D] font-bold mt-0.5">{members.length} competidores empatados</p></div>
            </div>
            <div className="text-right shrink-0"><strong className="text-lg text-[#17131F]">{points}</strong><span className="text-[8px] ml-1 font-black text-[#91889B]">PTS</span></div>
          </div>
          <div className={`grid ${members.length > 12 ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5`}>
            {members.map(member => <div key={member.memberKey} className="h-7 min-w-0 flex items-center gap-2 rounded-lg bg-[#F8F6FA] px-2">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accent }} />
              <span className="truncate text-[10px] font-bold text-[#31293B]">{member.formattedName}</span>
            </div>)}
          </div>
        </div>
      </div>,
      document.body,
    )}
  </>;
}
