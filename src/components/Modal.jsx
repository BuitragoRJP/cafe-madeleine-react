import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from './Icon.jsx';

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Ventana modal accesible. Se monta fuera de #root, que queda `inert` mientras está abierta:
 * el foco no puede escaparse a la página de atrás. Esc cierra y el foco vuelve a quien la abrió.
 * variant: 'center' (diálogo) o 'sheet' (panel lateral; hoja inferior en móvil).
 */
export default function Modal({ open, onClose, labelledBy, variant = 'center', children }) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <ModalInner onClose={onClose} labelledBy={labelledBy} variant={variant}>
          {children}
        </ModalInner>
      )}
    </AnimatePresence>,
    document.body
  );
}

function ModalInner({ onClose, labelledBy, variant, children }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const opener = document.activeElement;
    const root = document.getElementById('root');
    root.inert = true;
    document.documentElement.classList.add('is-locked');

    const panel = panelRef.current;
    (panel.querySelector('[data-autofocus]') || panel.querySelector(FOCUSABLE) || panel).focus();

    // En captura sobre window: corre antes que los Escape del menú móvil o de la puerta, y los detiene
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onCloseRef.current();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      root.inert = false;
      document.documentElement.classList.remove('is-locked');
      if (opener && typeof opener.focus === 'function') opener.focus();
    };
  }, []);

  const sheet = variant === 'sheet';
  return (
    <div className={'modal modal--' + variant}>
      <motion.div
        className="modal__backdrop"
        onClick={() => onCloseRef.current()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        ref={panelRef}
        className="modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        initial={sheet ? { x: '100%' } : { opacity: 0, y: 30, scale: 0.97 }}
        animate={sheet ? { x: 0 } : { opacity: 1, y: 0, scale: 1 }}
        exit={sheet ? { x: '100%' } : { opacity: 0, y: 20, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      >
        <button type="button" className="modal__close icon-btn" onClick={() => onCloseRef.current()} aria-label="Cerrar">
          <Icon name="close" />
        </button>
        {children}
      </motion.div>
    </div>
  );
}
