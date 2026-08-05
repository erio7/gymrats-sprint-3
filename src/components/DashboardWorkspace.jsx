import { CHALLENGE_END, CHALLENGE_START } from '../config';
import { SprintJourney } from './SprintJourney';
import { WorkoutCuriosityCarousel } from './WorkoutCuriosityCarousel';

export function DashboardWorkspace({ children, datasetData = [] }) {
  return <div className="dashboard-workspace w-full grid grid-cols-1 gap-3 items-start min-[1600px]:grid-cols-[minmax(0,1fr)_clamp(280px,16vw,310px)]">
    <div className="dashboard-main order-1 min-w-0">
      {children}
    </div>

    <aside className="dashboard-insights order-2 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-3 min-[1600px]:sticky min-[1600px]:top-[72px] min-[1600px]:self-start min-[1600px]:grid-cols-1 min-[1600px]:grid-rows-[minmax(280px,auto)_minmax(250px,auto)]">
      <SprintJourney startDate={CHALLENGE_START} endDate={CHALLENGE_END} datasetData={datasetData} compact />
      <WorkoutCuriosityCarousel datasetData={datasetData} compact />
    </aside>
  </div>;
}
