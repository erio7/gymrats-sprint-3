const getValue = (row, keys) => {
  const entries = Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key.trim().toLowerCase(), value]),
  );
  return keys.map(key => entries[key]).find(value => value !== undefined && String(value).trim() !== '');
};

const parseNumber = (value) => {
  if (value === undefined || value === null) return 0;
  const text = String(value).trim().replace(/\s/g, '');
  if (!text) return 0;
  const lastComma = text.lastIndexOf(',');
  const lastDot = text.lastIndexOf('.');
  let normalized = text;
  if (lastComma >= 0 && lastDot >= 0) {
    normalized = lastComma > lastDot
      ? text.replace(/\./g, '').replace(',', '.')
      : text.replace(/,/g, '');
  } else if (lastComma >= 0) {
    normalized = text.replace(',', '.');
  }
  const number = Number(normalized);
  return Number.isFinite(number) && number > 0 ? number : 0;
};

const normalizeText = value => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase();

const formatName = value => String(value || '')
  .trim()
  .toLowerCase()
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map(part => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

const ACTIVITY_NAMES = {
  cycling: 'ciclismo',
  functional_strength_training: 'treino funcional',
  hiit: 'HIIT',
  running: 'corrida',
  swimming: 'natação',
  walking: 'caminhada',
  weight_training: 'musculação',
  yoga: 'yoga',
};

const formatActivity = value => {
  const key = normalizeText(value).replace(/[\s-]+/g, '_');
  return ACTIVITY_NAMES[key] || key.replace(/_/g, ' ') || 'atividade física';
};

const formatNumber = (value, maximumFractionDigits = 1) => value.toLocaleString('pt-BR', {
  maximumFractionDigits,
  minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
});

const getTimeInSaoPaulo = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const hour = Number(values.hour);
  const minute = Number(values.minute);
  return {
    label: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    minutes: hour * 60 + minute,
  };
};

const maxBy = (rows, selector) => rows.reduce((best, row) => (
  !best || selector(row) > selector(best) ? row : best
), null);

export const getWorkoutCuriosities = (rows = []) => {
  const workouts = rows.map(row => {
    const decision = getValue(row, ['decisão', 'decisao', 'parecer']);
    const name = formatName(getValue(row, ['account_full_name', 'nome']));
    const durationMillis = parseNumber(getValue(row, ['duration_millis']));
    const durationMinutes = durationMillis > 0
      ? durationMillis / 60_000
      : parseNumber(getValue(row, ['minutos']));
    return {
      valid: !decision || normalizeText(decision) === 'valido',
      name,
      activity: formatActivity(getValue(row, ['platform_activity', 'atividade'])),
      durationMinutes,
      distanceKm: parseNumber(getValue(row, ['distance_miles', 'distancia_km'])),
      calories: parseNumber(getValue(row, ['calories', 'calorias'])),
      time: getTimeInSaoPaulo(getValue(row, ['start_time', 'data_e_hora'])),
    };
  }).filter(workout => workout.valid && workout.name);

  if (!workouts.length) return [];
  const curiosities = [];
  const longest = maxBy(workouts, workout => workout.durationMinutes);
  const farthest = maxBy(workouts, workout => workout.distanceKm);
  const highestCalories = maxBy(workouts, workout => workout.calories);
  const timed = workouts.filter(workout => workout.time);
  const earliest = timed.reduce((best, workout) => !best || workout.time.minutes < best.time.minutes ? workout : best, null);
  const latest = timed.reduce((best, workout) => !best || workout.time.minutes > best.time.minutes ? workout : best, null);

  if (longest?.durationMinutes > 0) curiosities.push({
    id: 'duration',
    type: 'duration',
    eyebrow: 'Treino mais longo',
    value: `${formatNumber(longest.durationMinutes, 0)} min`,
    title: longest.name,
    description: `Maior duração registrada em um treino de ${longest.activity}.`,
  });
  if (farthest?.distanceKm > 0) curiosities.push({
    id: 'distance',
    type: 'distance',
    eyebrow: 'Maior distância',
    value: `${formatNumber(farthest.distanceKm)} km`,
    title: farthest.name,
    description: `Maior percurso individual registrado em ${farthest.activity}.`,
  });
  if (highestCalories?.calories > 0) curiosities.push({
    id: 'calories',
    type: 'calories',
    eyebrow: 'Maior gasto registrado',
    value: `${formatNumber(highestCalories.calories, 0)} kcal`,
    title: highestCalories.name,
    description: `Maior marca de calorias em um treino de ${highestCalories.activity}.`,
  });
  if (earliest) curiosities.push({
    id: 'earliest',
    type: 'time',
    eyebrow: 'Primeiro a levantar',
    value: earliest.time.label,
    title: earliest.name,
    description: `Horário mais cedo registrado em ${earliest.activity}.`,
  });
  if (latest && latest !== earliest) curiosities.push({
    id: 'latest',
    type: 'time',
    eyebrow: 'Último treino do dia',
    value: latest.time.label,
    title: latest.name,
    description: `Horário mais tarde registrado em ${latest.activity}.`,
  });

  return curiosities;
};
