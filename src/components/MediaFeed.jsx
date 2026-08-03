import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from './MediaItem';

const AUTOPLAY_INTERVAL_MS = 5_000;
const ITEM_STEP_PX = 140;

export function MediaFeed({ feedData }) {
  const itemCount = feedData?.length || 0;
  const [currentIndex, setCurrentIndex] = useState(itemCount);
  const [withTransition, setWithTransition] = useState(true);
  const [interactionVersion, setInteractionVersion] = useState(0);
  const resetFrameRef = useRef(null);

  const moveCarousel = useCallback((direction) => {
    setWithTransition(true);
    setCurrentIndex(index => index + direction);
  }, []);

  useEffect(() => {
    setWithTransition(false);
    setCurrentIndex(itemCount);
    const frameId = window.requestAnimationFrame(() => setWithTransition(true));
    return () => window.cancelAnimationFrame(frameId);
  }, [itemCount]);

  useEffect(() => {
    if (!itemCount) return undefined;
    const intervalId = window.setInterval(() => moveCarousel(1), AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [interactionVersion, itemCount, moveCarousel]);

  useEffect(() => () => {
    if (resetFrameRef.current) window.cancelAnimationFrame(resetFrameRef.current);
  }, []);

  if (!itemCount) return null;

  const handleManualMove = (direction) => {
    moveCarousel(direction);
    setInteractionVersion(version => version + 1);
  };

  const handleTransitionEnd = () => {
    let normalizedIndex = currentIndex;
    if (currentIndex >= itemCount * 2) normalizedIndex = currentIndex - itemCount;
    if (currentIndex < itemCount) normalizedIndex = currentIndex + itemCount;
    if (normalizedIndex === currentIndex) return;

    setWithTransition(false);
    setCurrentIndex(normalizedIndex);
    resetFrameRef.current = window.requestAnimationFrame(() => {
      resetFrameRef.current = window.requestAnimationFrame(() => setWithTransition(true));
    });
  };

  const carouselItems = [...feedData, ...feedData, ...feedData];

  return (
    <div className="hidden md:block relative z-10 border-b border-[#E9E5F0] bg-white/65 py-2.5 overflow-hidden">
      <div
        className={`flex w-max gap-3 will-change-transform ${withTransition ? 'transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]' : ''}`}
        style={{ transform: `translate3d(-${currentIndex * ITEM_STEP_PX}px, 0, 0)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {carouselItems.map((url, idx) => (
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
