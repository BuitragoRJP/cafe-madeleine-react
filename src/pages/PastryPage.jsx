import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import PageHead from '../components/PageHead.jsx';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';
import content from '../data/content.js';
import { useTable } from '../lib/table.jsx';
import { waUrl } from '../lib/util.js';

const pastries = content.menu.find((m) => m.id === 'pasteleria');
const items = pastries.items;
const EASE = [0.2, 0.7, 0.2, 1];

export default function PastryPage() {
  const scrollerRef = useRef(null);
  const { scrollXProgress } = useScroll({ container: scrollerRef });
  const progress = useSpring(scrollXProgress, { stiffness: 200, damping: 30 });
  const [open, setOpen] = useState(null); // índice en el visor
  const [dir, setDir] = useState(1);
  const lastOpen = useRef(0);
  if (open !== null) lastOpen.current = open;
  const { has, toggle } = useTable();

  const scrollBy = (sign) => {
    const el = scrollerRef.current;
    const card = el.querySelector('.vitrina__card');
    el.scrollBy({ left: sign * (card ? card.offsetWidth + 24 : el.clientWidth * 0.8), behavior: 'smooth' });
  };

  const step = (sign) => {
    setDir(sign);
    setOpen((i) => (i === null ? null : (i + sign + items.length) % items.length));
  };

  const current = items[lastOpen.current];
  const added = has(current.name);

  return (
    <>
      <PageHead title="La vitrina" tone="dark">
        <p>
          Recetas propias, todo hecho en casa. Las madeleines van bañadas en chocolate: es la versión de la casa del
          bizcocho francés que le dio nombre al café.
        </p>
      </PageHead>

      <section className="vitrina" aria-label="Pastelería">
        <div className="wrap vitrina__bar">
          <p className="vitrina__count">{items.length} piezas en la vitrina. Toque una para verla de cerca.</p>
          <div className="vitrina__arrows">
            <button type="button" className="icon-btn icon-btn--round" onClick={() => scrollBy(-1)} aria-label="Anteriores">
              <Icon name="left" />
            </button>
            <button type="button" className="icon-btn icon-btn--round" onClick={() => scrollBy(1)} aria-label="Siguientes">
              <Icon name="right" />
            </button>
          </div>
        </div>

        <ul className="vitrina__scroller" ref={scrollerRef} tabIndex={0} aria-label="Pastelería, desliza para ver más">
          {items.map((p, i) => (
            <motion.li
              key={p.name}
              className="vitrina__card"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.15 + i * 0.06 }}
            >
              <button type="button" className="vitrina__open" onClick={() => { setDir(1); setOpen(i); }} aria-haspopup="dialog">
                <span className="vitrina__img">
                  <img src={p.img} alt={p.alt} width="1200" height="1600" loading={i < 3 ? 'eager' : 'lazy'} />
                </span>
                <span className="vitrina__name">{p.name}</span>
                <span className="vitrina__desc">{p.desc}</span>
              </button>
              {has(p.name) && <span className="vitrina__badge">En mi mesa</span>}
            </motion.li>
          ))}
        </ul>

        <div className="wrap">
          <div className="vitrina__progress" aria-hidden="true">
            <motion.span style={{ scaleX: progress }} />
          </div>
          <div className="vitrina__foot">
            <p>{pastries.note}</p>
            <a className="btn btn--gold" href={waUrl('Hola, ¿qué hay hoy en la vitrina de pastelería?')} target="_blank" rel="noopener">
              Preguntar qué hay hoy
            </a>
          </div>
        </div>
      </section>

      <Modal open={open !== null} onClose={() => setOpen(null)} labelledBy="lightbox-title">
        <div className="lightbox">
          <div className="lightbox__img">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.img
                key={current.img}
                src={current.img}
                alt={current.alt}
                width="1200"
                height="1600"
                custom={dir}
                variants={{
                  enter: (d) => ({ opacity: 0, x: d * 60 }),
                  center: { opacity: 1, x: 0 },
                  leave: (d) => ({ opacity: 0, x: d * -60 })
                }}
                initial="enter"
                animate="center"
                exit="leave"
                transition={{ duration: 0.4, ease: EASE }}
              />
            </AnimatePresence>
          </div>
          <div className="lightbox__body">
            <p className="lightbox__pos" aria-live="polite">
              {lastOpen.current + 1} de {items.length}
            </p>
            <h2 id="lightbox-title" className="lightbox__name">{current.name}</h2>
            <p>{current.desc}</p>
            <button type="button" className={'add-btn' + (added ? ' is-added' : '')} aria-pressed={added} onClick={() => toggle(current.name)}>
              <Icon name={added ? 'check' : 'plus'} size={18} />
              <span>{added ? 'En mi mesa' : 'Agregar a mi mesa'}</span>
            </button>
            <div className="lightbox__nav">
              <button type="button" className="icon-btn icon-btn--round" onClick={() => step(-1)} aria-label="Pieza anterior">
                <Icon name="left" />
              </button>
              <button type="button" className="icon-btn icon-btn--round" onClick={() => step(1)} aria-label="Pieza siguiente">
                <Icon name="right" />
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
