import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from './MediaItem';

const AUTOPLAY_INTERVAL_MS = 8_000;
const ITEM_GAP_PX = 12;

export function MediaFeed({ feedData }) {
  const trackRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [interactionVersion, setInteractionVersion] = useState(0);

  const moveCarousel = useCallback((direction) => {
    const track = trackRef.current;
    const firstItem = track?.firstElementChild;
    if (!track || !firstItem) return;

    const loopWidth = track.scrollWidth / 2;
    const step = firstItem.getBoundingClientRect().width + ITEM_GAP_PX;

    if (direction < 0 && track.scrollLeft <= 1) {
      track.scrollLeft = loopWidth;
    } else if (direction > 0 && track.scrollLeft >= loopWidth - 1) {
      track.scrollLeft -= loopWidth;
    }

    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isHovered || !feedData?.length) return undefined;
    const intervalId = window.setInterval(() => moveCarousel(1), AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [feedData, interactionVersion, isHovered, moveCarousel]);

  if (!feedData || feedData.length === 0) return null;

  const handleManualMove = (direction) => {
    moveCarousel(direction);
    setInteractionVersion(version => version + 1);
  };

  return (
    <div
      className="hidden md:block relative z-10 border-b border-[#E9E5F0] bg-white/65 py-2.5 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={trackRef}
        className="flex overflow-x-auto overflow-y-hidden scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {[...feedData, ...feedData].map((url, idx) => (
          <MediaItem key={`${idx}-${url}`} url={url} />
        ))}
      </div>

      <CarouselEdge direction="left" onClick={() => handleManualMove(-1)} />
      <CarouselEdge direction="right" onClick={() => handleManualMove(1)} />
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
