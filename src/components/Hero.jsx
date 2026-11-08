import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import NowCard from './NowCard.jsx';

const IMG = import.meta.env.BASE_URL + 'img/';
const LINES = ['Un jardín parisino', 'detrás de una puerta', 'en Teusaquillo'];
const EASE = [0.2, 0.7, 0.2, 1];

export default function Hero({ status, now, today, ready }) {
  const mediaRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: mediaRef, offset: ['start start', 'end start'] });
  // Parallax suave: la foto se desplaza más lento que el marco
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.18]);

  const state = ready ? 'shown' : 'hidden';

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="wrap hero__grid">
        <div className="hero__text">
          <h1 id="hero-title" className="hero__title" tabIndex={-1} data-page-title>
            {LINES.map((line, i) => (
              <span className="hero__line-mask" key={line}>
                <motion.span
                  className="hero__line"
                  initial={{ y: '105%' }}
                  animate={state === 'shown' ? { y: '0%' } : { y: '105%' }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.35 + i * 0.1 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            className="hero__lead"
            initial={{ opacity: 0, y: 16 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: EASE, delay: 0.75 }}
          >
            Cocina hecha en casa, pastelería propia y madeleines bañadas en chocolate. En el barrio La Magdalena,
            junto a la galería Mor-Charpentier.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: EASE, delay: 0.9 }}
          >
            <NowCard status={status} now={now} today={today} />
          </motion.div>
        </div>

        <motion.figure
          ref={mediaRef}
          className="hero__media"
          initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
          animate={ready ? { clipPath: 'inset(0% 0% 0% 0%)' } : {}}
          transition={{ duration: 1.3, ease: [0.65, 0, 0.35, 1], delay: 0.2 }}
        >
          <motion.img
            src={IMG + 'madeleines-pistacho.jpg'}
            width="1200"
            height="1600"
            alt="Madeleines de pistacho con brillo dorado, el postre insignia de la casa"
            style={{ y: imgY, scale: imgScale }}
          />
        </motion.figure>
      </div>
    </section>
  );
}
