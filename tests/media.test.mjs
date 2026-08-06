import assert from 'node:assert/strict';
import test from 'node:test';
import { getMediaWeekId, selectWeeklyMedia } from '../src/lib/media.js';

const mediaRow = (id, date, batch) => ({
  thumbnail_url: `https://example.com/${id}.jpg`,
  batch_id: batch,
  imported_at: date,
});

test('a semana do feed vai de sabado a sexta', () => {
  assert.equal(getMediaWeekId(new Date('2026-08-01T12:00:00-03:00')), '2026-08-01');
  assert.equal(getMediaWeekId(new Date('2026-08-07T23:00:00-03:00')), '2026-08-01');
  assert.equal(getMediaWeekId(new Date('2026-08-08T00:01:00-03:00')), '2026-08-08');
});

test('reune os lotes da semana, prioriza o mais novo e limita as ultimas 48 fotos', () => {
  const monday = Array.from({ length: 20 }, (_, index) => mediaRow(`seg-${index}`, '03/08/2026 09:00:00', 'seg'));
  const wednesday = Array.from({ length: 20 }, (_, index) => mediaRow(`qua-${index}`, '05/08/2026 09:00:00', 'qua'));
  const friday = Array.from({ length: 20 }, (_, index) => mediaRow(`sex-${index}`, '07/08/2026 09:00:00', 'sex'));
  const selected = selectWeeklyMedia([...monday, ...wednesday, ...friday], {
    now: new Date('2026-08-07T12:00:00-03:00'),
  });

  assert.equal(selected.length, 48);
  assert.match(selected[0], /sex-0/);
  assert.match(selected[20], /qua-0/);
  assert.match(selected[40], /seg-0/);
});

test('mantem a semana anterior ate chegar o primeiro lote da nova semana', () => {
  const previousWeek = [
    mediaRow('anterior-1', '07/08/2026 09:00:00', 'sex'),
    mediaRow('anterior-2', '07/08/2026 09:00:00', 'sex'),
  ];

  assert.deepEqual(
    selectWeeklyMedia(previousWeek, { now: new Date('2026-08-09T12:00:00-03:00') }),
    ['https://example.com/anterior-1.jpg', 'https://example.com/anterior-2.jpg'],
  );
});

test('troca para a semana nova assim que o primeiro lote chega', () => {
  const rows = [
    mediaRow('anterior', '07/08/2026 09:00:00', 'sex'),
    mediaRow('nova', '10/08/2026 09:00:00', 'seg-nova'),
  ];

  assert.deepEqual(
    selectWeeklyMedia(rows, { now: new Date('2026-08-10T12:00:00-03:00') }),
    ['https://example.com/nova.jpg'],
  );
});

test('usa a URL original quando a miniatura estiver vazia', () => {
  const selected = selectWeeklyMedia([{
    thumbnail_url: '',
    url: 'https://example.com/original.jpg',
    batch_id: 'seg',
    imported_at: '03/08/2026 09:00:00',
  }], { now: new Date('2026-08-03T12:00:00-03:00') });

  assert.deepEqual(selected, ['https://example.com/original.jpg']);
});
