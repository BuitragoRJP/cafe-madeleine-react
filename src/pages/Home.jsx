import { motion } from 'framer-motion';
import Hero from '../components/Hero.jsx';
import Proof from '../components/Proof.jsx';
import Icon from '../components/Icon.jsx';
import content from '../data/content.js';
import { DAY_NAMES, MOMENTS } from '../lib/schedule.js';
import { href } from '../lib/router.js';
import { nb, specialView, upcomingAgenda } from '../lib/util.js';

const IMG = import.meta.env.BASE_URL + 'img/';
const EASE = [0.2, 0.7, 0.2, 1];

const grid = { hidden: {}, shown: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } };
const tileIn = { hidden: { opacity: 0, y: 28 }, shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } };

/** Mosaico: cada pieza es un enlace completo a su vista, con datos del momento. */
function Tile({ to, className = '', children, label }) {
  return (
    <motion.li className={'tile ' + className} variants={tileIn}>
      <motion.a href={to} className="tile__link" whileHover="hover" whileTap={{ scale: 0.985 }} aria-label={label}>
        {children}
        <motion.span className="tile__go" aria-hidden="true" variants={{ hover: { x: 4 } }}>
          <Icon name="right" size={20} />
        </motion.span>
      </motion.a>
    </motion.li>
  );
}

function TileImg({ src, alt = '' }) {
  return (
    <span className="tile__img">
      <motion.img src={src} alt={alt} width="1200" height="1500" loading="lazy" variants={{ hover: { scale: 1.05 } }} transition={{ duration: 0.6, ease: EASE }} />
    </span>
  );
}

export default function Home({ status, now, today, ready }) {
  const special = specialView(today);
  const moment = status.open && status.moment ? MOMENTS.find((m) => m.id === status.moment) : null;
  const tab = moment ? content.menu.find((m) => m.id === moment.id) : null;
  const next = upcomingAgenda(today).find((ev) => ev.kind === 'fecha') || upcomingAgenda(today)[0];
  const todayHours = content.hours.find((h) => h.weekday === (status.holiday ? 0 : status.weekday));

  return (
    <>
      <Hero status={status} now={now} today={today} ready={ready} />
      <Proof />

      <section className="board" aria-labelledby="board-title">
        <div className="wrap">
          <h2 id="board-title" className="board__title">Hoy en la casa</h2>
          <motion.ul className="board__grid" variants={grid} initial="hidden" whileInView="shown" viewport={{ once: true, margin: '-10% 0px' }}>
            <Tile to={href('/reservar', { tipo: 'especial' })} className="tile--special" label={special.name + '. ' + special.day + '. ' + special.cta}>
              <TileImg src={special.img} alt={special.alt} />
              <span className="tile__body">
                <span className="tile__kicker">{special.kicker}</span>
                <span className="tile__name tile__name--big">{special.name}</span>
                <span className="tile__meta">{special.day}, con unidades limitadas</span>
                <span className="tile__action">{special.cta}</span>
              </span>
            </Tile>

            <Tile
              to={moment ? href('/carta', { tab: moment.id }) : href('/carta')}
              className="tile--now"
              label={moment ? 'Ahora se sirve: ' + tab.label + '. Ver en la carta' : 'Ver la carta'}
            >
              <span className="tile__body">
                <span className="tile__kicker">{moment ? 'Ahora se sirve' : 'La carta'}</span>
                <span className="tile__name">{moment ? tab.label : 'Desayunos, Petit du Jour y la casa'}</span>
                <span className="tile__meta">{nb(moment ? moment.label : status.headline)}</span>
              </span>
            </Tile>

            <Tile to={href('/visitanos')} className="tile--hours" label={'Horario de hoy: ' + todayHours.value + '. Ver cómo llegar'}>
              <span className="tile__body">
                <span className="tile__kicker">Hoy, {status.holiday ? 'festivo' : DAY_NAMES[status.weekday]}</span>
                <span className="tile__name">{nb(todayHours.value)}</span>
                <span className="tile__meta">Calle 38 #16-25, La Magdalena</span>
              </span>
            </Tile>

            {next && (
              <Tile to={href('/agenda')} className="tile--agenda" label={'Próximo en la agenda: ' + next.title + ', ' + next.when}>
                <span className="tile__body">
                  <span className="tile__kicker">En la agenda</span>
                  <span className="tile__name">{next.title}</span>
                  <span className="tile__meta">{next.when}</span>
                </span>
              </Tile>
            )}

            <Tile to={href('/pasteleria')} className="tile--pastry" label="La vitrina de pastelería">
              <TileImg src={IMG + 'madeleines-navidad.jpg'} />
              <span className="tile__body">
                <span className="tile__name">La vitrina</span>
                <span className="tile__meta">Madeleines, tortas y crème brûlée</span>
              </span>
            </Tile>

            <Tile to={href('/jardin')} className="tile--house" label="La casa, el jardín y la galería">
              <TileImg src={IMG + 'falafel.jpg'} />
              <span className="tile__body">
                <span className="tile__name">La casa</span>
                <span className="tile__meta">Jardín, galería y Tienda de Abalorios</span>
              </span>
            </Tile>

            <Tile to={href('/reservar', { tipo: 'evento' })} className="tile--events" label="Cotizar un evento o catering">
              <span className="tile__body">
                <span className="tile__name">Celebre en el jardín</span>
                <span className="tile__meta">Cumpleaños, reuniones de empresa y catering. Cotice en tres pasos.</span>
              </span>
            </Tile>
          </motion.ul>
        </div>
      </section>
    </>
  );
}
