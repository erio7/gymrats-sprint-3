import assert from 'node:assert/strict';
import test from 'node:test';
import { sumDistanceKm } from '../src/lib/distance.js';

test('soma distance_miles diretamente sem conversao', () => {
  const rows = [
    { distance_miles: '5.25' },
    { distance_miles: '3,5' },
    { distance_miles: '' },
    { distance_miles: 'invalido' },
  ];

  assert.equal(sumDistanceKm(rows), 8.8);
});

test('aceita o cabecalho sem diferenciar maiusculas', () => {
  assert.equal(sumDistanceKm([{ DISTANCE_MILES: '12,79' }]), 12.8);
});
