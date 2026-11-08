import { memo, useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

/** Número que cuenta hasta su valor la primera vez que entra en pantalla. */
function CountUp({ to, decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const reduce = useReducedMotion();
  const format = (v) => v.toLocaleString('es-CO', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const [value, setValue] = useState(() => format(reduce ? to : 0));

  useEffect(() => {
    if (!inView) return undefined;
    if (reduce) {
      setValue(format(to));
      return undefined;
    }
    const controls = animate(0, to, { duration: 1.4, ease: [0.2, 0.7, 0.2, 1], onUpdate: (v) => setValue(format(v)) });
    return () => controls.stop();
    // format depende solo de `decimals`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, to, reduce]);

  return (
    <span ref={ref} aria-hidden="true">
      {value}
    </span>
  );
}

function Proof() {
  return (
    <section className="proof" aria-label="Reconocimientos">
      <ul className="wrap proof__list">
        <li>
          <strong>Premios La Barra 2024</strong>
          Mejor restaurante de comida casual del país
        </li>
        <li>
          <strong>
            <CountUp to={4.6} decimals={1} />
            <span className="visually-hidden">4,6</span> en Google
          </strong>
          Con <CountUp to={174} /> <span className="visually-hidden">174</span> reseñas de quienes ya pasaron la puerta
        </li>
        <li>
          <strong>Álbum de Teusaquillo</strong>
          Una de las historias de emprendimiento de la localidad
        </li>
      </ul>
    </section>
  );
}

export default memo(Proof);
