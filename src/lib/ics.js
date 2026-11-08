/**
 * Archivos .ics (calendario) para "Agregar a mi calendario".
 * Eventos de día completo: el café no publica la hora de sus eventos.
 */
const LOCATION = 'Café de la Madeleine, Calle 38 #16-25, Teusaquillo, Bogotá';

function esc(text) {
  return String(text).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function compact(key) {
  return key.replace(/-/g, '');
}

/** 'YYYY-MM-DD' → el día siguiente en el mismo formato. */
export function nextDayKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

/** Primer día >= `fromKey` que cae en `weekday` (0 = domingo). */
export function firstWeekdayFrom(fromKey, weekday) {
  const [y, m, d] = fromKey.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const shift = (weekday - date.getUTCDay() + 7) % 7;
  return new Date(Date.UTC(y, m - 1, d + shift)).toISOString().slice(0, 10);
}

const BYDAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

/** RFC 5545: líneas de máximo 75 octetos; las siguientes empiezan con un espacio. No parte caracteres UTF-8. */
function fold(line) {
  const enc = new TextEncoder();
  const out = [];
  let current = '';
  let size = 0;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    const limit = out.length === 0 ? 75 : 74; // en la continuación, el espacio inicial ocupa un octeto
    if (size + n > limit) {
      out.push(current);
      current = '';
      size = 0;
    }
    current += ch;
    size += n;
  }
  out.push(current);
  return out.join('\r\n ');
}

/**
 * @param {{uid:string,title:string,description:string,startKey:string,weekly?:{weekday:number,untilKey:string}}} ev
 */
export function buildIcs(ev) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Cafe de la Madeleine//Agenda//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    'UID:' + ev.uid + '@cafedelamadeleine.co',
    'DTSTAMP:' + stamp,
    'DTSTART;VALUE=DATE:' + compact(ev.startKey),
    'DTEND;VALUE=DATE:' + compact(nextDayKey(ev.startKey)),
    'SUMMARY:' + esc(ev.title),
    'DESCRIPTION:' + esc(ev.description),
    'LOCATION:' + esc(LOCATION)
  ];
  if (ev.weekly) {
    lines.push('RRULE:FREQ=WEEKLY;BYDAY=' + BYDAY[ev.weekly.weekday] + ';UNTIL=' + compact(ev.weekly.untilKey));
  }
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}

export function downloadIcs(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
