import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Loader2 } from 'lucide-react';

export function MediaItem({ url }) {
  const [loaded, setLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [preview, setPreview] = useState(null);
  const itemRef = useRef(null);
  const isVideo = url.match(/\.(mp4|mov|webm)$/i);

  useEffect(() => {
    const item = itemRef.current;
    if (!item) return undefined;

    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setShouldLoad(true);
      observer.disconnect();
    }, { rootMargin: '280px' });

    observer.observe(item);
    return () => observer.disconnect();
  }, [url]);

  const showPreview = () => {
    if (!itemRef.current || !loaded) return;
    const rect = itemRef.current.getBoundingClientRect();
    const size = Math.max(220, Math.min(340, window.innerWidth - 24, window.innerHeight * 0.55));
    const placeBelow = rect.bottom + size + 12 <= window.innerHeight;
    const x = Math.min(window.innerWidth - size / 2 - 12, Math.max(size / 2 + 12, rect.left + rect.width / 2));
    setPreview({ x, y: placeBelow ? rect.bottom + 10 : rect.top - 10, size, placeBelow });
  };

  return (
    <>
    <div
      ref={itemRef}
      tabIndex={0}
      onMouseEnter={showPreview}
      onMouseLeave={() => setPreview(null)}
      onFocus={showPreview}
      onBlur={() => setPreview(null)}
      className="relative w-32 h-32 rounded-xl overflow-hidden border border-[#E2DDEA] bg-white shrink-0 group transition-all duration-300 hover:scale-[1.03] hover:z-20 hover:border-brand-300 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200 cursor-zoom-in shadow-sm"
    >
      {!loaded && (
        <div className="absolute inset-0 bg-[#F0EDF5] animate-pulse flex items-center justify-center z-0">
          <Loader2 className="w-5 h-5 text-brand-300 animate-spin" />
        </div>
      )}

      {isVideo ? (
        <video
          src={shouldLoad ? url : undefined}
          className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-90 group-hover:opacity-100' : 'opacity-0'}`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setLoaded(true)}
        />
      ) : (
        <img
          src={shouldLoad ? url : undefined}
          alt="Atividade compartilhada no Gym Rats"
          className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-90 group-hover:opacity-100' : 'opacity-0'}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
    {preview && ReactDOM.createPortal(
      <div
        className="fixed z-[9999] pointer-events-none media-preview-enter"
        style={{
          left: preview.x,
          top: preview.y,
          width: preview.size,
          height: preview.size,
          transform: preview.placeBelow ? 'translateX(-50%)' : 'translate(-50%, -100%)',
        }}
      >
        <div className="w-full h-full rounded-2xl border border-white/80 bg-white p-1.5 shadow-2xl shadow-[#241D2D]/25">
          {isVideo ? <video src={url} className="w-full h-full rounded-xl bg-[#17131F] object-contain" autoPlay muted loop playsInline /> : <img src={url} alt="Prévia ampliada da atividade" className="w-full h-full rounded-xl bg-[#17131F] object-contain" />}
        </div>
      </div>,
      document.body,
    )}
    </>
  );
}
