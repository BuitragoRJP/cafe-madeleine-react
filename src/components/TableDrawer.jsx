import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from './Icon.jsx';
import Modal from './Modal.jsx';
import { useTable } from '../lib/table.jsx';
import { href } from '../lib/router.js';

/** Botón "Mi mesa" con el número de platos marcados. */
export function TableButton({ onClick }) {
  const { items } = useTable();
  const count = items.length;
  return (
    <button type="button" className="table-btn" onClick={onClick} aria-haspopup="dialog">
      <Icon name="table" />
      <span className="table-btn__label">Mi mesa</span>
      <span className="visually-hidden">, {count === 1 ? '1 plato' : count + ' platos'}</span>
      <AnimatePresence initial={false}>
        {count > 0 && (
          <motion.span
            key={count}
            className="table-btn__count"
            aria-hidden="true"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 22 }}
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

/** Panel con los platos marcados en la carta, para llevarlos a la reserva. */
export default function TableDrawer({ open, onClose }) {
  const { items, remove, clear } = useTable();
  const panelRef = useRef(null);

  // El botón que tenía el foco desaparece al quitar un plato: el foco pasa al plato siguiente
  // (o al anterior), y si la lista queda vacía, al botón "Ir a la carta". Nunca se pierde fuera del panel.
  const focusAfterRemoval = (index) => {
    requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const buttons = panel.querySelectorAll('[data-remove]:not([data-leaving])');
      const target = buttons[Math.min(index, buttons.length - 1)] || panel.querySelector('.drawer__empty a');
      target?.focus();
    });
  };
  const removeAt = (e, name, index) => {
    // La fila sigue en pantalla durante su animación de salida: se marca para no enfocarla
    e.currentTarget.setAttribute('data-leaving', '');
    remove(name);
    focusAfterRemoval(index);
  };
  const clearAll = () => {
    clear();
    focusAfterRemoval(0);
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="table-title" variant="sheet">
      <div className="drawer" ref={panelRef}>
        <h2 id="table-title" className="drawer__title">Mi mesa</h2>
        {items.length === 0 ? (
          <div className="drawer__empty">
            <p>
              Marque en la carta los platos que le provocan con <strong>Agregar a mi mesa</strong>. Los
              incluimos en el mensaje de su reserva.
            </p>
            <a className="btn btn--gold" href={href('/carta')} onClick={onClose}>
              Ir a la carta
            </a>
          </div>
        ) : (
          <>
            <p className="drawer__hint">Se incluyen en el mensaje de su reserva. No es un pedido ni un pago.</p>
            <ul className="drawer__list">
              <AnimatePresence initial={false}>
                {items.map((name, index) => (
                  <motion.li
                    key={name}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                  >
                    <span>{name}</span>
                    <button type="button" className="icon-btn" data-remove onClick={(e) => removeAt(e, name, index)} aria-label={'Quitar ' + name}>
                      <Icon name="trash" size={20} />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
            <div className="drawer__actions">
              <a className="btn btn--gold btn--block" href={href('/reservar', { tipo: 'mesa' })} onClick={onClose}>
                Reservar con mi selección
              </a>
              <button type="button" className="btn btn--line btn--block" onClick={clearAll}>
                Vaciar mi mesa
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
