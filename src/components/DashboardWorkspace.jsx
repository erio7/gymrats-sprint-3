import { CHALLENGE_END, CHALLENGE_START } from '../config';
import { SprintJourney } from './SprintJourney';
import { WorkoutCuriosityCarousel } from './WorkoutCuriosityCarousel';

export function DashboardWorkspace({ children, datasetData = [] }) {
  return <div className="dashboard-workspace w-full grid grid-cols-1 gap-3 items-stretch min-[1280px]:h-full min-[1280px]:grid-cols-[minmax(0,1fr)_clamp(260px,18vw,300px)]">
    <div className="dashboard-main order-1 min-w-0 min-[1280px]:min-h-0 min-[1280px]:overflow-y-auto min-[1280px]:overscroll-contain min-[1280px]:scrollbar-thin">
      {children}
    </div>

    <aside className="dashboard-insights order-2 min-w-0 grid grid-cols-1 lg:grid-cols-2 gap-3 min-[1280px]:min-h-0 min-[1280px]:grid-cols-1 min-[1280px]:grid-rows-[minmax(280px,1.1fr)_minmax(250px,0.9fr)]">
      <SprintJourney startDate={CHALLENGE_START} endDate={CHALLENGE_END} datasetData={datasetData} compact />
      <WorkoutCuriosityCarousel datasetData={datasetData} compact />
    </aside>
  </div>;
}
