const CACHE_KEY = 'gymrats-dashboard-cache-v1';
const CACHE_VERSION = 1;

const EMPTY_CACHE = Object.freeze({
  rankingData: [],
  feedData: [],
  datasetData: [],
  totalKm: null,
});

const getDefaultStorage = () => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
};

const normalizeCache = (value) => ({
  rankingData: Array.isArray(value?.rankingData) ? value.rankingData : [],
  feedData: Array.isArray(value?.feedData) ? value.feedData : [],
  datasetData: Array.isArray(value?.datasetData) ? value.datasetData : [],
  totalKm: Number.isFinite(value?.totalKm) ? value.totalKm : null,
});

export const readDashboardCache = (storage = getDefaultStorage()) => {
  if (!storage) return { ...EMPTY_CACHE };

  try {
    const record = JSON.parse(storage.getItem(CACHE_KEY));
    if (record?.version !== CACHE_VERSION) return { ...EMPTY_CACHE };
    return normalizeCache(record.data);
  } catch {
    return { ...EMPTY_CACHE };
  }
};

export const updateDashboardCache = (patch, storage = getDefaultStorage()) => {
  if (!storage) return;

  try {
    const current = readDashboardCache(storage);
    const data = normalizeCache({ ...current, ...patch });
    storage.setItem(CACHE_KEY, JSON.stringify({
      version: CACHE_VERSION,
      savedAt: Date.now(),
      data,
    }));
  } catch {
    // O cache e apenas uma aceleracao. Falhas de quota ou privacidade nao
    // podem impedir o dashboard de continuar usando os dados da rede.
  }
};

