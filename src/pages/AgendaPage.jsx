import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PageHead from '../components/PageHead.jsx';
import Icon from '../components/Icon.jsx';
import { normalize, upcomingAgenda, waUrl } from '../lib/util.js';
import { buildIcs, downloadIcs, firstWeekdayFrom } from '../lib/ics.js';
import { href } from '../lib/router.js';

const EASE = [0.2, 0.7, 0.2, 1];
const KINDS = [
  { id: 'todo', label: 'Todo' },
  { id: 'fecha', label: 'Con fecha' },
  { id: 'recurrente', label: 'Recurrentes' }
];

function slug(text) {
  return normalize(text).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Evento descargable al calendario: con fecha fija o semanal hasta `until`. null si no tiene fecha publicada. */
function calendarFor(ev, today) {
  const description = (ev.with ? ev.title + ' ' + ev.with + '. ' : '') + ev.desc;
  if (ev.date) return { uid: slug(ev.title) + '-' + ev.date, title: ev.title + ' en Café de la Madeleine', description, startKey: ev.date };
  if (typeof ev.weekly === 'number' && ev.until) {
    const from = ev.from && ev.from > today ? ev.from : today;
    const startKey = firstWeekdayFrom(from, ev.weekly);
    if (startKey > ev.until) return null;
    return {
      uid: slug(ev.title) + '-' + startKey,
      title: ev.title + ' en Café de la Madeleine',
      description,
      startKey,
      weekly: { weekday: ev.weekly, untilKey: ev.until }
    };
  }
  return null;
}

function Entry({ ev, today, open, onToggle }) {
  const id = slug(ev.title);
  const cal = calendarFor(ev, today);
  return (
    <motion.li className={'entry' + (open ? ' is-open' : '')} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.4, ease: EASE }}>
      <h2 className="entry__heading">
        <button type="button" className="entry__toggle" aria-expanded={open} aria-controls={'entry-' + id} onClick={onToggle}>
          <span className="entry__when">{ev.when}</span>
          <span className="entry__title">
            {ev.title}
            {ev.with && <span className="entry__with"> {ev.with}</span>}
          </span>
          <span className={'entry__kind entry__kind--' + ev.kind}>{ev.kind === 'fecha' ? 'Con fecha' : 'Recurrente'}</span>
          <motion.span className="entry__chev" animate={{ rotate: open ? 180 : 0 }} aria-hidden="true">
            <Icon name="down" />
          </motion.span>
        </button>
      </h2>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={'entry-' + id}
            className="entry__panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="entry__inner">
              <p>{ev.desc}</p>
              <div className="entry__actions">
                {ev.message && (
                  <a className="btn btn--gold" href={waUrl(ev.message)} target="_blank" rel="noopener">{ev.cta}</a>
                )}
                {cal && (
                  <button type="button" className="btn btn--line" onClick={() => downloadIcs(id + '.ics', buildIcs(cal))}>
                    <Icon name="download" size={18} />
                    Agregar a mi calendario
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

export default function AgendaPage({ today }) {
  const events = upcomingAgenda(today);
  const [kind, setKind] = useState('todo');
  const [openId, setOpenId] = useState(() => (events[0] ? slug(events[0].title) : null));
  const shown = events.filter((ev) => kind === 'todo' || ev.kind === kind);

  return (
    <>
      <PageHead title="La agenda del jardín">
        <p>Conversatorios, música, brunch con causa y el especial del mes. Abra cada uno para reservar o guardarlo en su calendario.</p>
      </PageHead>

      <section className="wrap agenda-page" aria-label="Eventos">
        <div className="chips" role="group" aria-label="Mostrar">
          {KINDS.map((k) => (
            <button key={k.id} type="button" className="chip" aria-pressed={kind === k.id} onClick={() => setKind(k.id)}>
              {k.label}
            </button>
          ))}
        </div>

        <p className="visually-hidden" role="status">{shown.length === 1 ? '1 evento' : shown.length + ' eventos'}</p>

        {shown.length === 0 ? (
          <p className="results__empty">No hay eventos con fecha publicada por ahora. Mire los recurrentes o escríbanos para saber qué viene.</p>
        ) : (
          <ul className="entries">
            <AnimatePresence initial={false}>
              {shown.map((ev) => {
                const id = slug(ev.title);
                return <Entry key={id} ev={ev} today={today} open={openId === id} onToggle={() => setOpenId(openId === id ? null : id)} />;
              })}
            </AnimatePresence>
          </ul>
        )}

        <aside className="agenda-page__cta">
          <h2>¿Quiere hacer su propio evento en el jardín?</h2>
          <p>Cumpleaños, lanzamientos y reuniones de empresa. Cuéntenos lo básico y le respondemos por WhatsApp.</p>
          <a className="btn btn--gold" href={href('/reservar', { tipo: 'evento' })}>Cotizar un evento</a>
        </aside>
      </section>
    </>
  );
}
