import { CHALLENGE_END, CHALLENGE_START } from '../config';
import { SprintJourney } from './SprintJourney';
import { WorkoutCuriosityCarousel } from './WorkoutCuriosityCarousel';

export function DashboardWorkspace({ children, datasetData = [] }) {
  return <div className="w-full grid grid-cols-1 gap-3 items-stretch min-[1280px]:h-full min-[1280px]:grid-cols-[minmax(0,1fr)_clamp(240px,19vw,320px)]">
    <div className="dashboard-main order-1 min-w-0 min-[1280px]:min-h-0 min-[1280px]:overflow-y-auto min-[1280px]:overscroll-contain min-[1280px]:scrollbar-thin">
      {children}
    </div>

    <aside className="order-2 min-w-0 grid grid-cols-1 lg:grid-cols-2 gap-3 min-[1280px]:min-h-0 min-[1280px]:grid-cols-1 min-[1280px]:grid-rows-[minmax(0,1.1fr)_minmax(0,0.9fr)] min-[1280px]:overflow-y-auto min-[1280px]:overscroll-contain min-[1280px]:scrollbar-thin">
      <SprintJourney startDate={CHALLENGE_START} endDate={CHALLENGE_END} compact />
      <WorkoutCuriosityCarousel datasetData={datasetData} compact />
    </aside>
  </div>;
}
