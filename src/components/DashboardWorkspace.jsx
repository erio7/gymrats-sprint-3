import { CHALLENGE_END, CHALLENGE_START } from '../config';
import { SprintJourney } from './SprintJourney';
import { WorkoutCuriosityCarousel } from './WorkoutCuriosityCarousel';

export function DashboardWorkspace({ children, datasetData = [] }) {
  return <div className="relative w-full max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch min-[1280px]:left-1/2 min-[1280px]:h-full min-[1280px]:w-[calc(100vw-2rem)] min-[1280px]:max-w-[1880px] min-[1280px]:-translate-x-1/2 min-[1280px]:grid-cols-[clamp(200px,15vw,270px)_minmax(0,1fr)_clamp(230px,18vw,320px)]">
    <aside className="order-2 min-w-0 min-[1280px]:order-1 min-[1280px]:min-h-0">
      <WorkoutCuriosityCarousel datasetData={datasetData} />
    </aside>

    <div className="order-1 min-w-0 lg:col-span-2 min-[1280px]:order-2 min-[1280px]:col-span-1 min-[1280px]:min-h-0 min-[1280px]:overflow-y-auto min-[1280px]:overscroll-contain min-[1280px]:scrollbar-thin">
      {children}
    </div>

    <aside className="order-3 min-w-0 min-[1280px]:min-h-0">
      <SprintJourney startDate={CHALLENGE_START} endDate={CHALLENGE_END} />
    </aside>
  </div>;
}
