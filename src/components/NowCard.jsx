import { AnimatePresence, motion } from 'framer-motion';
import { bogotaParts, DAY_NAMES, formatTime } from '../lib/schedule.js';
import { nb, specialView } from '../lib/util.js';
import { href } from '../lib/router.js';

const swap = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.35 }
};

/** El módulo "Ahora": qué pasa en el café en este minuto, en hora de Bogotá. */
export default function NowCard({ status, now, today }) {
  const clock = formatTime(bogotaParts(now).minutes);
  const special = specialView(today);
  const specialToday = status.open && status.weekday === special.weekday;
  const dish = special.dish;

  return (
    <div className="now" data-state={status.open ? 'open' : 'closed'}>
      <p className="now__clock">
        En Bogotá son las <span className="now__time">{nb(clock)}</span>
      </p>

      <div aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={status.headline + status.detail} {...swap}>
            <p className="now__state">
              <span className="now__dot" aria-hidden="true" />
              <span>{nb(status.headline)}</span>
            </p>
            <p className="now__detail">{nb(status.detail)}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence initial={false}>
        {specialToday && (
          <motion.p
            className="now__special"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            Hoy es {DAY_NAMES[status.weekday]} de {dish} y hay unidades limitadas:{' '}
            <a href={href('/reservar', { tipo: 'especial' })}>resérvalo</a>.
          </motion.p>
        )}
      </AnimatePresence>

      <div className="now__actions">
        <motion.a className="btn btn--gold" href={href('/reservar')} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
          Reservar mesa
        </motion.a>
        <a className="btn btn--line" href={href('/carta', status.open && status.moment ? { tab: status.moment } : undefined)}>
          {status.open ? 'Ver lo que se sirve ahora' : 'Ver la carta'}
        </a>
      </div>
    </div>
  );
}
