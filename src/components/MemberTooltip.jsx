import { useState, useRef } from 'react';
import ReactDOM from 'react-dom';

export function MemberTooltip({ member, accentColor, children, style }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ x: rect.left + rect.width / 2, y: rect.top });
    }
    setShow(true);
  };

  const weeks = member.weeks || {};
  const weekData = [
    { label: 'Sem 1', value: weeks.s1 },
    { label: 'Sem 2', value: weeks.s2 },
    { label: 'Sem 3', value: weeks.s3 },
    { label: 'Sem 4', value: weeks.s4 },
    { label: 'Sem 5', value: weeks.s5 },
    { label: 'Sem 6', value: weeks.s6 },
    { label: 'Sem 7', value: weeks.s7 },
  ];
  const challenges = member.challenges || {};
  const challengeData = [
    { label: 'Desafio 1', value: challenges.d1 }, { label: 'Desafio 2', value: challenges.d2 },
    { label: 'Desafio 3', value: challenges.d3 }, { label: 'Desafio 4', value: challenges.d4 },
    { label: 'Desafio 5', value: challenges.d5 }, { label: 'Relâmpago', value: challenges.dr },
    { label: 'Gincana', value: challenges.gincana },
  ];

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShow(false)}
        style={style}
      >
        {children}
      </div>
      {show && ReactDOM.createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: pos.x,
            top: pos.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div
            className="relative mb-2 px-4 py-3 rounded-xl border shadow-2xl min-w-[220px]"
            style={{
              background: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderColor: `${accentColor}50`,
              boxShadow: `0 0 24px ${accentColor}18, 0 18px 38px rgba(69,45,91,0.16)`,
            }}
          >
            <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-[#ECE8F1]">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
              <span className="font-bold text-[#241D2D] text-[13px] truncate">{member.formattedName}</span>
            </div>

            <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
              {weekData.map((w) => (
                <div key={w.label} className="flex items-baseline justify-between gap-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-[#81778D] font-bold">{w.label}</span>
                  <span className="text-[12px] font-black" style={{ color: (w.value && w.value !== '0') ? accentColor : '#AAA2B2' }}>
                    {w.value || '0'}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2.5 pt-2 border-t border-[#ECE8F1]">
              {challengeData.map((challenge) => (
                <div key={challenge.label} className="flex items-baseline justify-between gap-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-[#81778D] font-bold">{challenge.label}</span>
                  <span className="text-[12px] font-black" style={{ color: (challenge.value && challenge.value !== '0') ? accentColor : '#AAA2B2' }}>{challenge.value || '0'}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#ECE8F1]">
              {member.extraPoints && member.extraPoints !== '0' && (
                <div className="flex items-baseline gap-1">
                  <span className="text-[9px] uppercase tracking-wider text-[#81778D] font-bold">Extras</span>
                  <span className="text-[12px] font-black text-[#008C66]">+{member.extraPoints}</span>
                </div>
              )}
              <div className="flex items-baseline gap-1 ml-auto">
                <span className="text-[9px] uppercase tracking-wider text-[#81778D] font-bold">Total</span>
                <span className="text-[14px] font-black" style={{ color: accentColor }}>{member.points}</span>
                <span className="text-[9px] text-[#91889B] font-bold">pts</span>
              </div>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 -bottom-[6px] w-3 h-3 rotate-45" style={{ background: 'rgba(255,255,255,0.98)', borderRight: `1px solid ${accentColor}50`, borderBottom: `1px solid ${accentColor}50` }} />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
