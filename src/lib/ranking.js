export const toTitleCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').filter(Boolean).slice(0, 2)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const parseValue = (value) => parseFloat(value?.toString().replace(',', '.')) || 0;
const WEEK_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7'];

const getCurrentWeekIdx = (members) => {
  for (let i = WEEK_KEYS.length - 1; i >= 0; i--) {
    if (members.some(member => parseValue(member.weeks[WEEK_KEYS[i]]) > 0)) return i + 1;
  }
  return 0;
};

const getTrend = (weeks, currentWeekIdx) => {
  if (currentWeekIdx < 2) return null;
  const current = parseValue(weeks[`s${currentWeekIdx}`]);
  const previous = parseValue(weeks[`s${currentWeekIdx - 1}`]);
  if (current === 0 && previous === 0) return null;
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'flat';
};

const getWeeks = (item) => Object.fromEntries(
  WEEK_KEYS.map((key, index) => [key, item[`SEMANA ${index + 1}`] || '0'])
);

const getChallenges = (item) => ({
  d1: item['DESAFIO 1 - 100KM'] || '0',
  d2: item['DESAFIO 2 - CONVIDADO'] || '0',
  d3: item['DESAFIO 3 - TREINO EM EQUIPE'] || '0',
  d4: item['DESAFIO 4 - MÃƒE'] || item['DESAFIO 4 - MÃE'] || '0',
  d5: item['DESAFIO 5 - EXTRA'] || '0',
  dr: item['DESAFIO RELAMPAGO - POSE'] || '0',
  gincana: item.GINCANA || '0',
});

export const computeRanking = (data) => {
  if (!data?.length) return { rankingData: [], totalKm: 0, totalMembers: 0, lastUpdate: '' };

  const members = new Map();
  let totalKm = 0;
  let lastUpdate = '';

  data.forEach((item) => {
    const name = item.NOME?.trim();
    const team = item.TIME?.trim();
    if (item.DATA && !lastUpdate) lastUpdate = item.DATA;

    // As linhas TOTAL pertencem ao formato anterior por equipes e não participam da Sprint individual.
    if (!name || name.toUpperCase() === 'TOTAL' || team?.toUpperCase().startsWith('TOTAL ')) return;

    const points = parseValue(item['CHECK-IN']);
    const km = parseValue(item.KM);
    const memberKey = name.toLowerCase();
    const existing = members.get(memberKey);

    if (existing) {
      existing.points += points;
      existing.km += km;
      existing.extraPoints = item['PTS EXTRAS'] || existing.extraPoints;
      existing.weeks = getWeeks(item);
      existing.challenges = getChallenges(item);
    } else {
      members.set(memberKey, {
        memberKey,
        name,
        formattedName: toTitleCase(name),
        points,
        km,
        extraPoints: item['PTS EXTRAS'] || '0',
        weeks: getWeeks(item),
        challenges: getChallenges(item),
      });
    }
    totalKm += km;
  });

  const rankingData = [...members.values()].sort((a, b) => b.points - a.points);
  const currentWeekIdx = getCurrentWeekIdx(rankingData);
  rankingData.forEach((member, index) => {
    member.trend = getTrend(member.weeks, currentWeekIdx);
    member.rank = index > 0 && member.points === rankingData[index - 1].points
      ? rankingData[index - 1].rank
      : index + 1;
  });

  return { rankingData, totalKm: Math.round(totalKm), totalMembers: rankingData.length, lastUpdate };
};
