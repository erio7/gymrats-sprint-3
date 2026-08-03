import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export function MediaItem({ url }) {
  const [loaded, setLoaded] = useState(false);
  const isVideo = url.match(/\.(mp4|mov|webm)$/i);

  return (
    <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-[#E2DDEA] bg-white shrink-0 group transition-all duration-300 hover:scale-105 hover:z-20 hover:border-brand-300 cursor-pointer shadow-sm">
      {!loaded && (
        <div className="absolute inset-0 bg-[#F0EDF5] animate-pulse flex items-center justify-center z-0">
          <Loader2 className="w-5 h-5 text-brand-300 animate-spin" />
        </div>
      )}

      {isVideo ? (
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
          alt="Atividade compartilhada no Gym Rats"
          className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-90 group-hover:opacity-100' : 'opacity-0'}`}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
