const DAY_MS = 86_400_000;

const parseDateId = (dateId) => {
  const [year, month, day] = dateId.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const formatDateId = date => [
  date.getUTCFullYear(),
  String(date.getUTCMonth() + 1).padStart(2, '0'),
  String(date.getUTCDate()).padStart(2, '0'),
].join('-');

export const getSaoPauloDateId = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

export const buildSprintJourney = (startDateId, endDateId, todayDateId = getSaoPauloDateId()) => {
  const start = parseDateId(startDateId);
  const end = parseDateId(endDateId);
  const today = parseDateId(todayDateId);
  const totalDays = Math.round((end - start) / DAY_MS) + 1;
  const elapsedDays = Math.max(0, Math.min(totalDays, Math.round((today - start) / DAY_MS) + 1));
  const days = Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(start.getTime() + index * DAY_MS);
    const dateId = formatDateId(date);
    return {
      dateId,
      dayOfMonth: date.getUTCDate(),
      sprintDay: index + 1,
      week: Math.floor(index / 7) + 1,
      status: dateId === todayDateId ? 'today' : date < today ? 'complete' : 'future',
    };
  });

  return {
    days,
    totalDays,
    elapsedDays,
    progress: totalDays ? elapsedDays / totalDays * 100 : 0,
  };
};
