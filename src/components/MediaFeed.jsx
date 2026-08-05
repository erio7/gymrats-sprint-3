import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from './MediaItem';

const ITEM_STEP_PX = 140;
const ITEM_TRAVEL_TIME_MS = 5_000;
const MANUAL_MOVE_TIME_MS = 850;

const easeInOutCubic = progress => progress < 0.5
  ? 4 * progress * progress * progress
  : 1 - Math.pow(-2 * progress + 2, 3) / 2;

export function MediaFeed({ feedData }) {
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const manualQueueRef = useRef(0);
  const itemCount = feedData?.length || 0;

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !itemCount) return undefined;

    const loopWidth = itemCount * ITEM_STEP_PX;
    const automaticSpeed = ITEM_STEP_PX / ITEM_TRAVEL_TIME_MS;
    let animationFrameId;
    let lastFrameTime = performance.now();
    let manualMove = null;

    offsetRef.current = loopWidth;
    track.style.transform = `translate3d(-${offsetRef.current}px, 0, 0)`;

    const animate = (now) => {
      const elapsed = Math.min(now - lastFrameTime, 64);
      lastFrameTime = now;
      let nextOffset = offsetRef.current + elapsed * automaticSpeed;

      if (!manualMove && Math.abs(manualQueueRef.current) >= ITEM_STEP_PX) {
        const direction = Math.sign(manualQueueRef.current);
        manualQueueRef.current -= direction * ITEM_STEP_PX;
        manualMove = { startedAt: now, distance: direction * ITEM_STEP_PX, applied: 0 };
      }

      if (manualMove) {
        const progress = Math.min(1, (now - manualMove.startedAt) / MANUAL_MOVE_TIME_MS);
        const desiredDistance = manualMove.distance * easeInOutCubic(progress);
        nextOffset += desiredDistance - manualMove.applied;
        manualMove.applied = desiredDistance;
        if (progress === 1) manualMove = null;
      }

      if (nextOffset >= loopWidth * 2) nextOffset -= loopWidth;
      if (nextOffset < loopWidth) nextOffset += loopWidth;

      offsetRef.current = nextOffset;
      track.style.transform = `translate3d(-${nextOffset}px, 0, 0)`;
      animationFrameId = window.requestAnimationFrame(animate);
    };

    animationFrameId = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [itemCount]);

  if (!itemCount) return null;

  const moveCarousel = (direction) => {
    manualQueueRef.current += direction * ITEM_STEP_PX;
  };

  const carouselItems = [...feedData, ...feedData, ...feedData];

  return (
    <div className="hidden md:block relative z-30 shrink-0 border-b border-[#E9E5F0] bg-white/65 py-2.5 overflow-hidden">
      <div
        ref={trackRef}
        className="flex w-max gap-3 will-change-transform [backface-visibility:hidden]"
        style={{ transform: `translate3d(-${itemCount * ITEM_STEP_PX}px, 0, 0)` }}
      >
        {carouselItems.map((url, idx) => (
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
