const DAY_MS = 24 * 60 * 60 * 1_000;
const TIME_ZONE = 'America/Sao_Paulo';

const normalizeText = value => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase();

const normalizeName = value => normalizeText(value).replace(/\s+/g, ' ');

const formatName = value => String(value || '')
  .trim()
  .toLowerCase()
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map(part => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

const getValue = (row, keys) => {
  const entries = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [normalizeText(key), value]),
  );
  return keys.map(normalizeText).map(key => entries[key]).find(value => value !== undefined && String(value).trim() !== '');
};

const formatDateId = (year, month, day) => [
  year,
  String(month).padStart(2, '0'),
  String(day).padStart(2, '0'),
].join('-');

const getSaoPauloDateId = value => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return formatDateId(values.year, values.month, values.day);
};

const getRowDateId = row => {
  const timestamp = getValue(row, ['start_time', 'data_e_hora', 'data e hora']);
  const fromTimestamp = getSaoPauloDateId(timestamp);
  if (fromTimestamp) return fromTimestamp;

  const displayedDate = String(getValue(row, ['data']) || '').trim();
  const match = displayedDate.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
  if (!match) return null;
  return formatDateId(match[3] || new Date().getFullYear(), match[2], match[1]);
};

const toUtcTime = dateId => {
  const [year, month, day] = dateId.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
};

const isValidWorkout = row => {
  const status = getValue(row, ['decisão', 'decisao', 'parecer', 'verificação', 'verificacao']);
  return normalizeText(status) === 'valido';
};

export const buildDailyLeaderboard = (rows = [], startDateId, endDateId) => {
  if (!startDateId || !endDateId) return {};
  const startTime = toUtcTime(startDateId);
  const endTime = toUtcTime(endDateId);
  const participants = new Map();

  rows.forEach(row => {
    if (!isValidWorkout(row)) return;
    const originalName = getValue(row, ['account_full_name', 'nome']);
    const memberKey = normalizeName(originalName);
    const dateId = getRowDateId(row);
    if (!memberKey || !dateId) return;
    const dateTime = toUtcTime(dateId);
    if (dateTime < startTime || dateTime > endTime) return;

    const participant = participants.get(memberKey) || {
      memberKey,
      formattedName: formatName(originalName),
      activeDates: new Set(),
    };
    participant.activeDates.add(dateId);
    participants.set(memberKey, participant);
  });

  const scoredParticipants = [...participants.values()].map(participant => {
    const daysPerWeek = new Map();
    const scoredDates = [...participant.activeDates].sort().filter(dateId => {
      const weekIndex = Math.floor((toUtcTime(dateId) - startTime) / (7 * DAY_MS));
      const currentDays = daysPerWeek.get(weekIndex) || 0;
      if (currentDays >= 6) return false;
      daysPerWeek.set(weekIndex, currentDays + 1);
      return true;
    });
    return { ...participant, scoredDates };
  });

  const leaderboardByDate = {};
  for (let timestamp = startTime; timestamp <= endTime; timestamp += DAY_MS) {
    const date = new Date(timestamp);
    const dateId = formatDateId(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    const ranking = scoredParticipants
      .map(participant => ({
        memberKey: participant.memberKey,
        formattedName: participant.formattedName,
        points: participant.scoredDates.filter(activeDate => activeDate <= dateId).length,
      }))
      .filter(member => member.points > 0)
      .sort((a, b) => b.points - a.points || a.formattedName.localeCompare(b.formattedName, 'pt-BR'));

    ranking.forEach((member, index) => {
      member.rank = index > 0 && member.points === ranking[index - 1].points
        ? ranking[index - 1].rank
        : index + 1;
    });
    leaderboardByDate[dateId] = ranking.slice(0, 5);
  }

  return leaderboardByDate;
};

