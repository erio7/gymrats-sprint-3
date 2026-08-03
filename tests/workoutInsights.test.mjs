import assert from 'node:assert/strict';
import test from 'node:test';
import { getWorkoutCuriosities } from '../src/lib/workoutInsights.js';

test('gera curiosidades apenas com treinos validos', () => {
  const rows = [
    { account_full_name: 'ANA SILVA', duration_millis: '3600000', distance_miles: '5,5', calories: '450', platform_activity: 'running', start_time: '2026-08-01T09:00:00Z', Decisão: 'Válido' },
    { account_full_name: 'BRUNO LIMA', duration_millis: '7200000', distance_miles: '12,7', calories: '700', platform_activity: 'cycling', start_time: '2026-08-01T12:00:00Z', Decisão: 'Válido' },
    { account_full_name: 'IGNORADO', duration_millis: '9000000', distance_miles: '30', calories: '900', platform_activity: 'running', start_time: '2026-08-01T08:00:00Z', Decisão: 'Inválido' },
  ];
  const facts = getWorkoutCuriosities(rows);

  assert.equal(facts.find(fact => fact.id === 'duration').title, 'Bruno Lima');
  assert.equal(facts.find(fact => fact.id === 'distance').value, '12,7 km');
  assert.equal(facts.find(fact => fact.id === 'calories').value, '700 kcal');
  assert.ok(facts.every(fact => fact.title !== 'Ignorado'));
});
