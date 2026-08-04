import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDailyLeaderboard } from '../src/lib/dailyLeaderboard.js';

const workout = (name, timestamp, decision = 'Válido') => ({
  account_full_name: name,
  start_time: timestamp,
  Decisão: decision,
});

test('monta o top 5 acumulado por dia com empates', () => {
  const rows = [
    workout('Brenda', '2026-08-01T12:00:00Z'),
    workout('Brenda', '2026-08-02T12:00:00Z'),
    workout('Lucas Giacomini', '2026-08-01T14:00:00Z'),
  ];
  const result = buildDailyLeaderboard(rows, '2026-08-01', '2026-09-14');

  assert.deepEqual(result['2026-08-01'].map(member => [member.formattedName, member.points, member.rank]), [
    ['Brenda', 1, 1],
    ['Lucas Giacomini', 1, 1],
  ]);
  assert.deepEqual(result['2026-08-02'].map(member => [member.formattedName, member.points, member.rank]), [
    ['Brenda', 2, 1],
    ['Lucas Giacomini', 1, 2],
  ]);
});

test('conta apenas um ponto por pessoa no dia e ignora treino não validado', () => {
  const rows = [
    workout('Brenda', '2026-08-01T12:00:00Z'),
    workout('Brenda', '2026-08-01T18:00:00Z'),
    workout('Lucas', '2026-08-01T14:00:00Z', 'A conferir'),
  ];
  const result = buildDailyLeaderboard(rows, '2026-08-01', '2026-09-14');

  assert.equal(result['2026-08-01'][0].points, 1);
  assert.equal(result['2026-08-01'].length, 1);
});

test('respeita o máximo de 6 dias na semana de sábado a sexta', () => {
  const rows = Array.from({ length: 8 }, (_, index) => workout('Brenda', `2026-08-${String(index + 1).padStart(2, '0')}T12:00:00Z`));
  const result = buildDailyLeaderboard(rows, '2026-08-01', '2026-09-14');

  assert.equal(result['2026-08-07'][0].points, 6);
  assert.equal(result['2026-08-08'][0].points, 7);
});

