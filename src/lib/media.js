const DEFAULT_TIME_ZONE = 'America/Sao_Paulo';
export const MEDIA_FEED_LIMIT = 48;

const formatDateId = (date) => [
  date.getUTCFullYear(),
  String(date.getUTCMonth() + 1).padStart(2, '0'),
  String(date.getUTCDate()).padStart(2, '0'),
].join('-');

const getWeekIdFromCalendarDate = (year, month, day) => {
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  const daysSinceSaturday = (calendarDate.getUTCDay() + 1) % 7;
  calendarDate.setUTCDate(calendarDate.getUTCDate() - daysSinceSaturday);
  return formatDateId(calendarDate);
};

const getCalendarParts = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return [Number(values.year), Number(values.month), Number(values.day)];
};

export const getMediaWeekId = (date = new Date(), timeZone = DEFAULT_TIME_ZONE) => (
  getWeekIdFromCalendarDate(...getCalendarParts(date, timeZone))
);

const getImportedWeekId = (value, timeZone) => {
  if (!value) return '';

  const text = String(value).trim();
  const brazilianDate = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (brazilianDate) {
    return getWeekIdFromCalendarDate(
      Number(brazilianDate[3]),
      Number(brazilianDate[2]),
      Number(brazilianDate[1]),
    );
  }

  const sortableDate = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (sortableDate) {
    return getWeekIdFromCalendarDate(
      Number(sortableDate[1]),
      Number(sortableDate[2]),
      Number(sortableDate[3]),
    );
  }

  const parsedDate = new Date(text);
  return Number.isNaN(parsedDate.getTime()) ? '' : getMediaWeekId(parsedDate, timeZone);
};

const getRowValue = (row, keys) => {
  const normalizedEntries = Object.entries(row).map(([key, value]) => [key.toLowerCase(), value]);
  const normalizedRow = Object.fromEntries(normalizedEntries);
  return keys
    .map(key => normalizedRow[key])
    .find(value => value !== undefined && value !== null && String(value).trim() !== '') || '';
};

export const normalizeMediaRows = (rows, timeZone = DEFAULT_TIME_ZONE) => rows
  .map((row, index) => {
    const importedAt = getRowValue(row, ['imported_at', 'batch_date']);
    const explicitWeekId = String(getRowValue(row, ['week_id'])).trim();

    return {
      url: String(getRowValue(row, ['thumbnail_url', 'url'])).trim(),
      batchId: String(getRowValue(row, ['batch_id'])).trim(),
      importedAt,
      weekId: explicitWeekId || getImportedWeekId(importedAt, timeZone),
      index,
    };
  })
  .filter(item => /^https?:\/\//i.test(item.url));

const orderNewestBatchesFirst = (rows) => {
  const batches = new Map();

  rows.forEach((row) => {
    const batchKey = row.batchId || `legacy-${row.index}`;
    const batch = batches.get(batchKey) || { newestIndex: row.index, rows: [] };
    batch.newestIndex = Math.max(batch.newestIndex, row.index);
    batch.rows.push(row);
    batches.set(batchKey, batch);
  });

  return [...batches.values()]
    .sort((a, b) => b.newestIndex - a.newestIndex)
    .flatMap(batch => batch.rows);
};

const uniqueUrls = (rows, limit) => {
  const seen = new Set();
  const urls = [];

  for (const row of rows) {
    if (seen.has(row.url)) continue;
    seen.add(row.url);
    urls.push(row.url);
    if (urls.length === limit) break;
  }

  return urls;
};

export const selectWeeklyMedia = (rawRows, options = {}) => {
  const {
    now = new Date(),
    limit = MEDIA_FEED_LIMIT,
    timeZone = DEFAULT_TIME_ZONE,
  } = options;
  const rows = normalizeMediaRows(rawRows, timeZone);
  if (!rows.length || limit <= 0) return [];

  const rowsWithWeek = rows.filter(row => row.weekId);
  if (rowsWithWeek.length) {
    const currentWeekId = getMediaWeekId(now, timeZone);
    const availableWeekIds = [...new Set(rowsWithWeek.map(row => row.weekId))].sort();
    const targetWeekId = availableWeekIds.includes(currentWeekId)
      ? currentWeekId
      : availableWeekIds.at(-1);
    const selectedRows = rowsWithWeek.filter(row => row.weekId === targetWeekId);
    return uniqueUrls(orderNewestBatchesFirst(selectedRows), limit);
  }

  // Compatibilidade com a aba antiga: sem data, preserva o comportamento de
  // mostrar apenas o ultimo lote conhecido.
  const latestBatchId = [...rows].reverse().find(row => row.batchId)?.batchId;
  const legacyRows = latestBatchId
    ? rows.filter(row => row.batchId === latestBatchId)
    : rows.slice(-limit).reverse();
  return uniqueUrls(legacyRows, limit);
};
