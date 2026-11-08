import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PageHead from '../components/PageHead.jsx';
import DayPicker from '../components/DayPicker.jsx';
import Icon from '../components/Icon.jsx';
import content from '../data/content.js';
import { formatLongDate } from '../lib/schedule.js';
import { dayStrip, nb, telUrl } from '../lib/util.js';
import { href } from '../lib/router.js';

const DIRECTIONS =
  'https://www.google.com/maps/dir/?api=1&destination=Caf%C3%A9+de+la+Madeleine%2C+Calle+38+%2316-25%2C+Bogot%C3%A1';
const MAP_EMBED =
  'https://maps.google.com/maps?q=Caf%C3%A9%20de%20la%20Madeleine%2C%20Calle%2038%20%2316-25%2C%20Bogot%C3%A1&z=17&output=embed';
const HOURS = content.hours[0].value;
// "Desayunos de 9:00 a. m. a 12:00 m. Petit du Jour de …": sale de las pestañas de la carta
const MOMENT_NOTE = content.menu
  .filter((m) => m.id === 'desayunos' || m.id === 'petit')
  .map((m) => m.label + ' de ' + m.hours + '.')
  .join(' ');

/** "¿Abrimos ese día?": elige un día de las próximas dos semanas y responde con el horario o el motivo del cierre. */
function DayCheck({ now, today }) {
  const days = useMemo(() => dayStrip(now, 14), [today]); // eslint-disable-line react-hooks/exhaustive-deps
  const [value, setValue] = useState(days[0].key);
  const day = days.find((d) => d.key === value) || days[0];
  const answer = day.open
    ? { ok: true, text: 'Abrimos de ' + HOURS + '.' }
    : { ok: false, text: day.holiday ? 'Cerrado por festivo: ' + day.holiday + '.' : 'Los domingos cerramos.' };

  return (
    <section className="daycheck" aria-labelledby="daycheck-title">
      <h2 id="daycheck-title" className="daycheck__title">¿Abrimos ese día?</h2>
      <DayPicker days={days} value={day.key} onChange={setValue} reasonFor={() => null} noteFor={(d) => (d.open ? null : 'Cerrado')} label="Día a consultar" />
      <div className="daycheck__answer" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={day.key}
            className={answer.ok ? 'is-open' : 'is-closed'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <strong>{formatLongDate(day.key).replace(/ de \d{4}$/, '')}.</strong>{' '}
            {nb(answer.text)}
          </motion.p>
        </AnimatePresence>
      </div>
      {day.open && (
        <a className="link-arrow" href={href('/reservar', { tipo: 'mesa' })}>Reservar mesa</a>
      )}
    </section>
  );
}

export default function VisitPage({ status, now, today }) {
  // En festivo, la fila resaltada es "Domingo y festivos"
  const todayWd = status.holiday ? 0 : status.weekday;

  return (
    <>
      <PageHead title="Calle 38 #16-25, La Magdalena">
        <p>Teusaquillo, Bogotá. Busque la puerta en una calle residencial: el jardín está adentro.</p>
      </PageHead>

      <section className="wrap visit-page" aria-label="Horario y ubicación">
        <div className="visit-page__info">
          <div className="visit-page__status" data-state={status.open ? 'open' : 'closed'}>
            <span className="now__dot" aria-hidden="true" />
            <p>
              <strong>{nb(status.headline)}</strong>
              {nb(status.detail)}
            </p>
          </div>

          <table className="hours" aria-label="Horario de atención">
            <tbody>
              {content.hours.map((h) => {
                const isToday = h.weekday === todayWd;
                return (
                  <tr key={h.day} className={isToday ? 'is-today' : undefined}>
                    <th scope="row">
                      {h.day}
                      {isToday && <span className="hours__today"> (hoy)</span>}
                    </th>
                    <td>{nb(h.value)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="hours__note">{nb(MOMENT_NOTE)}</p>

          <DayCheck now={now} today={today} />
        </div>

        <div className="visit-page__map">
          <motion.div className="visit__map" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <iframe title="Mapa de Café de la Madeleine en Google Maps" src={MAP_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </motion.div>
          <div className="visit__actions">
            <a className="btn btn--gold" href={DIRECTIONS} target="_blank" rel="noopener">
              <Icon name="route" size={18} /> Cómo llegar
            </a>
            <a className="btn btn--line" href={telUrl}>
              <Icon name="phone" size={18} /> Llamar al {content.phoneDisplay}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
