import assert from 'node:assert/strict';
import test from 'node:test';
import { readDashboardCache, updateDashboardCache } from '../src/lib/dataCache.js';

const createStorage = () => {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
};

test('cache do dashboard preserva cargas independentes', () => {
  const storage = createStorage();
  updateDashboardCache({ rankingData: [{ NOME: 'Brenda' }] }, storage);
  updateDashboardCache({ feedData: ['https://example.com/foto.jpg'] }, storage);

  assert.deepEqual(readDashboardCache(storage), {
    rankingData: [{ NOME: 'Brenda' }],
    feedData: ['https://example.com/foto.jpg'],
    datasetData: [],
    totalKm: null,
  });
});

test('cache invalido nao impede a abertura', () => {
  const storage = createStorage();
  storage.setItem('gymrats-dashboard-cache-v1', '{invalido');

  assert.deepEqual(readDashboardCache(storage), {
    rankingData: [],
    feedData: [],
    datasetData: [],
    totalKm: null,
  });
});
