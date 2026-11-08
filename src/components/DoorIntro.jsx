import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ShellMark from './ShellMark.jsx';

const STORAGE_KEY = 'madeleine-puerta-vista';
const EASE_DOOR = [0.7, 0, 0.25, 1];

/**
 * ¿Mostrar la puerta? Una vez por sesión y nunca con movimiento reducido.
 * Si el navegador bloquea sessionStorage, se muestra (no hay forma de recordarlo).
 */
export function shouldShowDoor() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) !== '1';
  } catch {
    return true;
  }
}

function remember() {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* sin almacenamiento: la puerta volverá a aparecer al recargar */
  }
}

/**
 * "Una gran sorpresa cuando pasas la puerta": dos hojas verde helecho con su letrero
 * que se abren hacia adentro y dejan ver el jardín (la página).
 */
export default function DoorIntro({ onOpenStart, onDone }) {
  const [phase, setPhase] = useState('closed'); // closed → opening
  const startedRef = useRef(false);
  const fallbackRef = useRef(null);
  const doorRef = useRef(null);

  const open = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    remember();
    setPhase('opening');
    onOpenStart?.();
    // Respaldo: si la animación no reporta fin (pestaña oculta, etc.), retiramos la puerta igual
    fallbackRef.current = setTimeout(() => onDone?.(), 2200);
  };

  useEffect(() => {
    const timer = setTimeout(open, 1100);
    const onKey = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') open();
    };
    document.addEventListener('keydown', onKey);
    document.documentElement.classList.add('is-locked');

    // Mientras la puerta cubre la pantalla, lo de atrás no recibe foco ni lo leen los lectores de pantalla
    const siblings = Array.from(doorRef.current?.parentElement?.children ?? []).filter((el) => el !== doorRef.current);
    siblings.forEach((el) => { el.inert = true; });

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackRef.current);
      document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('is-locked');
      siblings.forEach((el) => { el.inert = false; });
    };
    // `open` es estable en la práctica (usa refs); se ejecuta una sola vez al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const opening = phase === 'opening';

  return (
    <div className="door" data-phase={phase} ref={doorRef}>
      <div className="door__frame" aria-hidden="true">
        <motion.div
          className="door__leaf door__leaf--left"
          initial={false}
          animate={opening ? { rotateY: 105 } : { rotateY: 0 }}
          /* ángulo positivo con eje a la izquierda: la hoja se abre hacia adentro, lejos del visitante */
          transition={{ duration: 1.5, ease: EASE_DOOR }}
        >
          <span className="door__panel" />
          <span className="door__panel door__panel--low" />
          <span className="door__knob" />
        </motion.div>
        <motion.div
          className="door__leaf door__leaf--right"
          initial={false}
          animate={opening ? { rotateY: -105 } : { rotateY: 0 }}
          transition={{ duration: 1.5, ease: EASE_DOOR }}
          onAnimationComplete={() => opening && onDone?.()}
        >
          <span className="door__panel" />
          <span className="door__panel door__panel--low" />
          <span className="door__knob" />
        </motion.div>

        <motion.div
          className="door__sign"
          initial={{ opacity: 0, y: -12 }}
          animate={opening ? { opacity: 0, y: -24, transition: { duration: 0.35 } } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <ShellMark className="door__mark" />
          <span className="door__name">café de la madeleine</span>
          <span className="door__address">Calle 38 #16-25</span>
        </motion.div>
      </div>

      <motion.button
        type="button"
        className="door__skip"
        onClick={open}
        animate={{ opacity: opening ? 0 : 1 }}
        tabIndex={opening ? -1 : 0}
      >
        Pasar
      </motion.button>
    </div>
  );
}
