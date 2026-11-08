import { motion } from 'framer-motion';
import Icon from './Icon.jsx';
import { ROUTES, href } from '../lib/router.js';

const PATHS = ['/', '/carta', '/agenda', '/visitanos', '/reservar'];
const ITEMS = PATHS.map((p) => ROUTES.find((r) => r.path === p));

/** Barra inferior en móvil: las cinco vistas más usadas al alcance del pulgar. */
export default function BottomNav({ path }) {
  return (
    <nav className="bottomnav" aria-label="Accesos rápidos">
      <ul>
        {ITEMS.map((r) => {
          const current = r.path === path;
          return (
            <li key={r.path}>
              <a href={href(r.path)} aria-current={current ? 'page' : undefined} className={r.path === '/reservar' ? 'is-cta' : undefined}>
                {current && (
                  <motion.span className="bottomnav__dot" layoutId="bottomnav-dot" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />
                )}
                <Icon name={r.icon} />
                <span>{r.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
