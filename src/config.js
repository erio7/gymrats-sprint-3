const FALLBACK_RANKING_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSrfQHgBUQ42FNnqaxhuOcXgBaOZK7B5hC9G5PlRq4ovs-IvQoRDEkNYfeFpC3zyZiWYTIub8SzUj2O/pub?output=csv";

const FALLBACK_FEED_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSrfQHgBUQ42FNnqaxhuOcXgBaOZK7B5hC9G5PlRq4ovs-IvQoRDEkNYfeFpC3zyZiWYTIub8SzUj2O/pub?gid=1605139045&single=true&output=csv";

export const CSV_URL = import.meta.env.VITE_RANKING_CSV_URL || FALLBACK_RANKING_CSV_URL;
export const FEED_CSV_URL = import.meta.env.VITE_FEED_CSV_URL || FALLBACK_FEED_CSV_URL;

export const REFRESH_INTERVAL_MS =
  Number(import.meta.env.VITE_REFRESH_INTERVAL_MS) || 120_000;

export const CHALLENGE_START = new Date('2026-08-01T00:00:00');
export const CHALLENGE_END = new Date('2026-09-14T23:59:59');
