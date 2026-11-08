import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import PageHead from '../components/PageHead.jsx';
import { href } from '../lib/router.js';
import { tabKeyTarget } from '../lib/util.js';

const IMG = import.meta.env.BASE_URL + 'img/';
const EASE = [0.2, 0.7, 0.2, 1];
const QUOTE = 'Una calle no comercial, un lugar casi imperceptible que genera una gran sorpresa cuando pasas la puerta.';

const TIMELINE = [
  { year: 'Enero de 2021', text: 'El 19 de enero abre el café en una casa de La Magdalena, que comparte con la galería Mor-Charpentier.' },
  { year: 'Noviembre de 2024', text: 'Premios La Barra: mejor restaurante de comida casual del país.' },
  { year: 'Noviembre de 2026', text: 'La Alcaldía Local lo incluye en el Álbum de Teusaquillo, con las historias de emprendimiento de la localidad.' }
];

const SPACES = [
  {
    id: 'jardin',
    label: 'El jardín',
    title: 'Donde estaban el garaje y el patio',
    text: 'Hoy hay un jardín interior inspirado en los cafés de París. Desde la calle no se ve: aparece cuando se cruza la puerta.',
    img: IMG + 'falafel.jpg',
    alt: 'Plato de falafel servido frente a los helechos del jardín'
  },
  {
    id: 'galeria',
    label: 'La galería',
    title: 'Se come con arte alrededor',
    text: 'La casa la comparte la galería Mor-Charpentier, con sede principal en París, fundada por Alex Mor, hermano de la chef.',
    link: { href: 'https://www.instagram.com/morcharpentier/', label: 'Ver la galería en Instagram' }
  },
  {
    id: 'tienda',
    label: 'Tienda de Abalorios',
    title: 'En el segundo piso',
    text: 'Diseño y talento colombiano, y los productos de Miss Mor. Su mermelada de frutos rojos es la que acompaña la crème brûlée de la carta.',
    img: IMG + 'creme-brulee.jpg',
    alt: 'Crème brûlée con fresas, servida con mermelada de Miss Mor'
  }
];

function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <motion.span className="quote__word" style={{ opacity }}>
      {children}
    </motion.span>
  );
}

/** Cada palabra se enciende a medida que la cita cruza la pantalla. */
function ScrollQuote() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'end 0.55'] });
  const words = QUOTE.split(' ');
  return (
    <blockquote className="quote" ref={ref}>
      <p aria-label={'«' + QUOTE + '»'}>
        <span aria-hidden="true">
          «
          {words.map((w, i) => (
            <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
              {w + (i < words.length - 1 ? ' ' : '')}
            </Word>
          ))}
          »
        </span>
      </p>
      <footer>Andrea Mor, chef y fundadora</footer>
    </blockquote>
  );
}

function Spaces() {
  const [active, setActive] = useState(SPACES[0].id);
  const refs = useRef({});
  const space = SPACES.find((s) => s.id === active);

  const onKeyDown = (e) => {
    const ids = SPACES.map((s) => s.id);
    const i = ids.indexOf(active);
    const next = tabKeyTarget(e.key, i, ids.length);
    if (next === undefined) return;
    e.preventDefault();
    setActive(ids[next]);
    refs.current[ids[next]]?.focus();
  };

  return (
    <section className="spaces" aria-labelledby="spaces-title">
      <div className="wrap">
        <h2 id="spaces-title" className="section-title">Tres espacios en una casa</h2>
        <div className="spaces__tabs" role="tablist" aria-label="Espacios de la casa" onKeyDown={onKeyDown}>
          {SPACES.map((s) => {
            const selected = s.id === active;
            return (
              <button
                key={s.id}
                ref={(el) => (refs.current[s.id] = el)}
                type="button"
                role="tab"
                id={'space-' + s.id}
                aria-selected={selected}
                aria-controls="space-panel"
                tabIndex={selected ? 0 : -1}
                className="spaces__tab"
                onClick={() => setActive(s.id)}
              >
                {selected && <motion.span className="spaces__pill" layoutId="spaces-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                <span className="spaces__tab__label">{s.label}</span>
              </button>
            );
          })}
        </div>

        <div id="space-panel" role="tabpanel" aria-labelledby={'space-' + active} className="spaces__panel">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              className={'spaces__card' + (space.img ? '' : ' spaces__card--text')}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {space.img && (
                <motion.div className="spaces__img" initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}>
                  <img src={space.img} alt={space.alt} width="1200" height="1600" />
                </motion.div>
              )}
              <div className="spaces__text">
                <h3>{space.title}</h3>
                <p>{space.text}</p>
                {space.link && (
                  <a href={space.link.href} target="_blank" rel="noopener">{space.link.label}</a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default function GardenPage() {
  return (
    <>
      <PageHead title="Madeleine es Magdalena en francés" tone="green">
        <p>
          Una casa de La Magdalena, un barrio de casas cuidadas y calles tranquilas donde se siente otra época. La cocina
          la dirige la chef Andrea Mor.
        </p>
      </PageHead>

      <Spaces />

      <section className="timeline" aria-labelledby="timeline-title">
        <div className="wrap">
          <h2 id="timeline-title" className="section-title">Cómo llegamos aquí</h2>
          <ol className="timeline__list">
            {TIMELINE.map((t, i) => (
              <motion.li
                key={t.year}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-15% 0px' }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.05 }}
              >
                <span className="timeline__year">{t.year}</span>
                <p>{t.text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="garden-quote" aria-label="Cita de la chef">
        <div className="wrap">
          <ScrollQuote />
          <div className="garden-quote__actions">
            <a className="btn btn--gold" href={href('/reservar', { tipo: 'mesa' })}>Reservar una mesa en el jardín</a>
            <a className="btn btn--line btn--light" href={href('/agenda')}>Ver la agenda del jardín</a>
          </div>
        </div>
      </section>
    </>
  );
}
