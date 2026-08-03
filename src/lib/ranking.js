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
  d1: item['DESAFIO 1'] || '0',
  d2: item['DESAFIO 2'] || '0',
  d3: item['DESAFIO 3'] || '0',
  d4: item['DESAFIO 4'] || '0',
  d5: item['DESAFIO 5'] || '0',
  dr: item['DESAFIO RELÂMPAGO'] || item['DESAFIO RELAMPAGO'] || '0',
  gincana: item.GINCANA || '0',
});

const sumValues = (values) => values.reduce((sum, value) => sum + parseValue(value), 0);

export const groupRankingByPoints = (rankingData) => rankingData.reduce((groups, member) => {
  const current = groups.at(-1);
  if (current && current.points === member.points) {
    current.members.push(member);
    return groups;
  }

  groups.push({
    rank: member.rank,
    points: member.points,
    members: [member],
  });
  return groups;
}, []);

export const computeRanking = (data) => {
  if (!data?.length) return { rankingData: [], totalKm: null, totalMembers: 0, lastUpdate: '' };

  const members = new Map();
  let lastUpdate = '';

  data.forEach((item) => {
    const name = item.NOME?.trim();
    if (item.DATA && !lastUpdate) lastUpdate = item.DATA;
    if (!name || name.toUpperCase() === 'TOTAL') return;

    const weeks = getWeeks(item);
    const challenges = getChallenges(item);
    const checkins = parseValue(item.CHECKIN);
    const extraPoints = parseValue(item['PTS EXTRAS']);
    const points = checkins + sumValues(Object.values(challenges)) + extraPoints;
    const memberKey = name.toLowerCase();
    const existing = members.get(memberKey);

    if (existing) {
      existing.points += points;
      existing.checkins += checkins;
      existing.extraPoints = String(parseValue(existing.extraPoints) + extraPoints);
      existing.weeks = weeks;
      existing.challenges = challenges;
    } else {
      members.set(memberKey, {
        memberKey,
        name,
        formattedName: toTitleCase(name),
        points,
        checkins,
        extraPoints: item['PTS EXTRAS'] || '0',
        weeks,
        challenges,
      });
    }
  });

  const rankingData = [...members.values()].sort((a, b) => b.points - a.points);
  const currentWeekIdx = getCurrentWeekIdx(rankingData);
  rankingData.forEach((member, index) => {
    member.trend = getTrend(member.weeks, currentWeekIdx);
    member.rank = index > 0 && member.points === rankingData[index - 1].points
      ? rankingData[index - 1].rank
      : index + 1;
  });

  return { rankingData, totalKm: null, totalMembers: rankingData.length, lastUpdate };
};
