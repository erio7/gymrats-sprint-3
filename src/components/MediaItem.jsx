import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

export function MediaItem({ url }) {
  const [loaded, setLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef(null);
  const isVideo = url.match(/\.(mp4|mov|webm)$/i);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '600px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative mx-1.5 w-32 h-32 rounded-xl overflow-hidden border border-[#E2DDEA] bg-white shrink-0 group transition-all duration-300 hover:scale-105 hover:z-20 hover:border-brand-300 cursor-pointer shadow-sm">
      {!loaded && (
        <div className="absolute inset-0 bg-[#F0EDF5] animate-pulse flex items-center justify-center z-0">
          <Loader2 className="w-5 h-5 text-brand-300 animate-spin" />
        </div>
      )}

      {shouldLoad && (
        isVideo ? (
          <video
            src={url}
            className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-90 group-hover:opacity-100' : 'opacity-0'}`}
            autoPlay
            muted
            loop
            playsInline
            onLoadedData={() => setLoaded(true)}
          />
        ) : (
          <img
            src={url}
            alt="Feed item"
            className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-90 group-hover:opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            loading="lazy"
          />
        )
      )}
    </div>
  );
}
