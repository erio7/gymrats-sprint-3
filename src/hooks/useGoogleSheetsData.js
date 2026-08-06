import { useEffect, useRef, useState } from 'react';
import { parseCsvToJson, validateColumns } from '../lib/csv';
import { readDashboardCache, updateDashboardCache } from '../lib/dataCache';
import { sumDistanceKm } from '../lib/distance';
import { selectWeeklyMedia } from '../lib/media';

const REQUIRED_RANKING_COLUMNS = [
  'NOME',
  ...Array.from({ length: 7 }, (_, index) => `SEMANA ${index + 1}`),
  ...Array.from({ length: 5 }, (_, index) => `DESAFIO ${index + 1}`),
  'DESAFIO RELÂMPAGO',
  'GINCANA',
  'PTS EXTRAS',
  'CHECKIN',
  'DATA',
];
const REQUIRED_FEED_COLUMNS = []; // feed aceita 'url' OU 'thumbnail_url'
const REQUIRED_DATASET_COLUMNS = ['distance_miles'];

export function useGoogleSheetsData({ rankingUrl, feedUrl, datasetUrl, refreshIntervalMs }) {
  const initialCacheRef = useRef(null);
  if (initialCacheRef.current === null) initialCacheRef.current = readDashboardCache();
  const initialCache = initialCacheRef.current;

  const [data, setData] = useState(initialCache.rankingData);
  const [feedData, setFeedData] = useState(initialCache.feedData);
  const [datasetData, setDatasetData] = useState(initialCache.datasetData);
  const [totalKm, setTotalKm] = useState(initialCache.totalKm);
  const [loading, setLoading] = useState(initialCache.rankingData.length === 0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let activeController = null;
    let requestInFlight = false;

    const requestUrl = (url, isInitial, timestamp) => (
      isInitial ? url : `${url}${url.includes('?') ? '&' : '?'}_t=${timestamp}`
    );

    const loadData = async (isInitial) => {
      if (requestInFlight) return;
      requestInFlight = true;
      activeController = new AbortController();
      const { signal } = activeController;
      const ts = Date.now();
      const fetchOpts = { cache: isInitial ? 'default' : 'no-cache', signal };

      const fetchRanking = fetch(requestUrl(rankingUrl, isInitial, ts), fetchOpts)
        .then(r => { if (!r.ok) throw new Error("Erro Ranking"); return r.text(); })
        .then(text => {
          const { data: jsonData, headers } = parseCsvToJson(text);
          if (jsonData.length === 0) throw new Error("CSV Ranking vazio.");
          validateColumns(headers, REQUIRED_RANKING_COLUMNS, 'Ranking CSV');
          if (!cancelled) {
            setData(jsonData);
            setError(null);
            updateDashboardCache({ rankingData: jsonData });
          }
        });

      const fetchFeed = fetch(requestUrl(feedUrl, isInitial, ts), fetchOpts)
        .then(r => { if (!r.ok) throw new Error("Erro Feed"); return r.text(); })
        .then(text => {
          const { data: jsonData, headers } = parseCsvToJson(text);
          validateColumns(headers, REQUIRED_FEED_COLUMNS, 'Feed CSV');
          const media = selectWeeklyMedia(jsonData);
          if (!cancelled) {
            setFeedData(media);
            updateDashboardCache({ feedData: media });
          }
        });

      const fetchDataset = fetch(requestUrl(datasetUrl, isInitial, ts), fetchOpts)
        .then(r => { if (!r.ok) throw new Error("Erro Dataset"); return r.text(); })
        .then(text => {
          const { data: jsonData, headers } = parseCsvToJson(text);
          const missing = validateColumns(headers, REQUIRED_DATASET_COLUMNS, 'Dataset CSV');
          if (missing.length) throw new Error("Dataset sem distance_miles");
          if (!cancelled) {
            const nextTotalKm = sumDistanceKm(jsonData);
            setDatasetData(jsonData);
            setTotalKm(nextTotalKm);
            updateDashboardCache({ datasetData: jsonData, totalKm: nextTotalKm });
          }
        });
      const auxiliaryResults = Promise.allSettled([fetchFeed, fetchDataset]);

      try {
        // O ranking e a unica fonte essencial para liberar a interface.
        // Feed e dataset continuam carregando sem segurar a primeira pintura.
        await fetchRanking;
        if (!cancelled && isInitial) setLoading(false);
      } catch (err) {
        if (err.name === 'AbortError' || cancelled) return;
        if (isInitial && initialCache.rankingData.length === 0) {
          setError(err.message);
          setLoading(false);
        } else {
          console.warn("Falha no auto-refresh:", err);
        }
      } finally {
        const [feedResult, datasetResult] = await auxiliaryResults;
        if (!cancelled) {
          if (feedResult.status === 'rejected' && feedResult.reason?.name !== 'AbortError') {
            console.warn("Erro ao carregar feed:", feedResult.reason);
          }
          if (datasetResult.status === 'rejected' && datasetResult.reason?.name !== 'AbortError') {
            console.warn("Erro ao carregar dataset:", datasetResult.reason);
          }
        }
        requestInFlight = false;
      }
    };

    loadData(true);
    const intervalId = setInterval(() => loadData(false), refreshIntervalMs);

    return () => {
      cancelled = true;
      activeController?.abort();
      clearInterval(intervalId);
    };
  }, [rankingUrl, feedUrl, datasetUrl, refreshIntervalMs, initialCache]);

  return { data, feedData, datasetData, totalKm, loading, error };
}
