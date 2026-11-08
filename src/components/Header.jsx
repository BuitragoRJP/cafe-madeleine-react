import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ShellMark from './ShellMark.jsx';
import Icon from './Icon.jsx';
import { TableButton } from './TableDrawer.jsx';
import { ROUTES, href } from '../lib/router.js';

// En la barra superior van las secciones; Inicio es la marca y Reservar es el botón
const SECTIONS = ROUTES.filter((r) => r.path !== '/' && r.path !== '/reservar');

export default function Header({ path, onOpenTable }) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);

  // Cerrar el menú móvil al cambiar de vista
  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="site-header">
      <div className="wrap site-header__inner">
        <a className="brand" href={href('/')} aria-label="Café de la Madeleine, inicio" aria-current={path === '/' ? 'page' : undefined}>
          <ShellMark className="brand__mark" />
          <span className="brand__name">café de la madeleine</span>
        </a>

        <nav className="topnav" aria-label="Secciones">
          <ul>
            {SECTIONS.map((r) => {
              const current = r.path === path;
              return (
                <li key={r.path}>
                  <a href={href(r.path)} aria-current={current ? 'page' : undefined} className="topnav__link">
                    {current && (
                      <motion.span
                        className="topnav__pill"
                        layoutId="topnav-pill"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="topnav__label">{r.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="site-header__actions">
          <TableButton onClick={onOpenTable} />
          <a className="btn btn--gold site-header__cta" href={href('/reservar')} aria-current={path === '/reservar' ? 'page' : undefined}>
            Reservar
          </a>
          <button
            ref={toggleRef}
            className="nav-toggle"
            type="button"
            aria-expanded={open}
            aria-controls="site-nav-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="nav-toggle__bars" aria-hidden="true" />
            <span className="visually-hidden">Todas las secciones</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="site-nav-mobile"
            className="mobile-nav"
            aria-label="Todas las secciones"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <ul className="wrap mobile-nav__grid">
              {ROUTES.map((r, i) => (
                <motion.li
                  key={r.path}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i + 0.08 }}
                >
                  <a href={href(r.path)} aria-current={r.path === path ? 'page' : undefined}>
                    <Icon name={r.icon} />
                    {r.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
