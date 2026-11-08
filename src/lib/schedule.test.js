// Pruebas de la lógica de horario (ESM): `npm test`
// Vite reemplaza import.meta.env en el build; aquí solo se prueba schedule.js, que no lo usa.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getStatus, holidaysFor, todayKey, formatLongDate } from './schedule.js';

const bog = (y, m, d, h, min = 0) => new Date(Date.UTC(y, m - 1, d, h + 5, min));

test('festivos 2026 coinciden con el calendario oficial', () => {
  assert.deepEqual(Object.keys(holidaysFor(2026)).sort(), [
    '2026-01-01', '2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03', '2026-05-01',
    '2026-05-18', '2026-06-08', '2026-06-15', '2026-06-29', '2026-07-20', '2026-08-07',
    '2026-08-17', '2026-10-12', '2026-11-02', '2026-11-16', '2026-12-08', '2026-12-25'
  ]);
});

test('momentos del día', () => {
  assert.equal(getStatus(bog(2026, 11, 4, 10)).moment, 'desayunos');
  assert.equal(getStatus(bog(2026, 11, 4, 12, 30)).moment, 'petit');
  assert.equal(getStatus(bog(2026, 11, 5, 15)).moment, 'casa');
});

test('cerrado domingo y festivo, con próxima apertura', () => {
  assert.equal(getStatus(bog(2026, 11, 8, 11)).headline, 'Abrimos mañana a las 9:00 a. m.');
  assert.equal(getStatus(bog(2026, 11, 15, 11)).headline, 'Abrimos el martes a las 9:00 a. m.');
  assert.equal(getStatus(bog(2026, 11, 2, 10)).holiday, 'Todos los Santos');
});

test('utilidades de fecha en hora de Bogotá', () => {
  // 23:30 del 8 de noviembre en Bogotá = 04:30 UTC del 9
  assert.equal(todayKey(0, new Date(Date.UTC(2026, 10, 9, 4, 30))), '2026-11-08');
  assert.equal(formatLongDate('2026-12-04'), 'viernes 4 de diciembre de 2026');
});
