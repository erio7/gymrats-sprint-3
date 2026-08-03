const parseDistanceValue = (value) => {
  if (value === null || value === undefined) return 0;

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

const getDistanceValue = (row) => {
  const entry = Object.entries(row).find(([key]) => key.toLowerCase() === 'distance_miles');
  return entry?.[1];
};

export const sumDistanceKm = (rows) => {
  const total = rows.reduce((sum, row) => sum + parseDistanceValue(getDistanceValue(row)), 0);
  return Math.round(total * 10) / 10;
};
