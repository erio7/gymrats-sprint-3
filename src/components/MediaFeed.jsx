import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from './MediaItem';

const ANIMATION_DURATION_MS = 75_000;

export function MediaFeed({ feedData }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  if (!feedData || feedData.length === 0) return null;

  const moveCarousel = (direction) => {
    const animation = trackRef.current?.getAnimations()[0];
    const loopWidth = trackRef.current?.scrollWidth / 2;
    const visibleWidth = containerRef.current?.clientWidth;
    if (!animation || !loopWidth || !visibleWidth) return;

    const step = Math.min(visibleWidth * 0.7, loopWidth * 0.35);
    const timeShift = step / loopWidth * ANIMATION_DURATION_MS;
    const currentTime = Number(animation.currentTime) || 0;
    animation.currentTime = (currentTime + direction * timeShift + ANIMATION_DURATION_MS) % ANIMATION_DURATION_MS;
  };

  return (
    <div ref={containerRef} className="media-feed hidden md:block relative z-10 border-b border-[#E9E5F0] bg-white/65 py-2.5 overflow-hidden">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll ${ANIMATION_DURATION_MS}ms linear infinite;
          will-change: transform;
        }
        .media-feed:hover .animate-scroll {
          animation-play-state: paused;
        }
      `}</style>

      <div ref={trackRef} className="flex w-max animate-scroll">
        {[...feedData, ...feedData].map((url, idx) => (
          <MediaItem key={`${idx}-${url}`} url={url} />
        ))}
      </div>

      <CarouselEdge direction="left" onClick={() => moveCarousel(-1)} />
      <CarouselEdge direction="right" onClick={() => moveCarousel(1)} />
    </div>
  );
}

function CarouselEdge({ direction, onClick }) {
  const isLeft = direction === 'left';
  const Icon = isLeft ? ChevronLeft : ChevronRight;

  return (
    <div className={`group/edge absolute inset-y-0 z-30 flex w-20 items-center ${isLeft ? 'left-0 justify-start bg-gradient-to-r' : 'right-0 justify-end bg-gradient-to-l'} from-[#F7F7FB] via-[#F7F7FB]/75 to-transparent`}>
      <button
        type="button"
        onClick={onClick}
        aria-label={isLeft ? 'Ver fotos anteriores' : 'Ver próximas fotos'}
        title={isLeft ? 'Fotos anteriores' : 'Próximas fotos'}
        className={`flex h-10 w-10 items-center justify-center rounded-full border border-[#DED7E8] bg-white/95 text-brand opacity-0 shadow-lg transition-all duration-200 group-hover/edge:opacity-100 hover:scale-105 hover:border-brand-300 hover:bg-brand hover:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 ${isLeft ? 'ml-3' : 'mr-3'}`}
      >
        <Icon className="h-5 w-5" strokeWidth={2.5} />
      </button>
    </div>
  );
}
