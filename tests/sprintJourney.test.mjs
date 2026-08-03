import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSprintJourney } from '../src/lib/sprintJourney.js';

test('monta os 45 dias da sprint em semanas de sabado a sexta', () => {
  const journey = buildSprintJourney('2026-08-01', '2026-09-14', '2026-08-03');

  assert.equal(journey.totalDays, 45);
  assert.equal(journey.elapsedDays, 3);
  assert.equal(journey.days[0].week, 1);
  assert.equal(journey.days[6].week, 1);
  assert.equal(journey.days[7].week, 2);
  assert.equal(journey.days[2].status, 'today');
  assert.equal(journey.days.at(-1).sprintDay, 45);
});
