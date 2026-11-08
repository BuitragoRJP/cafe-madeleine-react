import { memo } from 'react';
import ShellMark from './ShellMark.jsx';
import { ROUTES, href } from '../lib/router.js';
import { waUrl } from '../lib/util.js';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__inner">
        <p className="site-footer__brand">
          <ShellMark className="site-footer__mark" ribs="var(--chocolate)" />
          café de la madeleine
        </p>
        <nav aria-label="Pie de página">
          <ul className="site-footer__links">
            {ROUTES.filter((r) => r.path !== '/').map((r) => (
              <li key={r.path}><a href={href(r.path)}>{r.label}</a></li>
            ))}
          </ul>
        </nav>
        <ul className="site-footer__links site-footer__links--ext">
          <li><a href="https://www.instagram.com/cafedelamadeleine/" target="_blank" rel="noopener">Instagram</a></li>
          <li><a href={waUrl()} target="_blank" rel="noopener">WhatsApp</a></li>
          <li><a href="https://www.instagram.com/morcharpentier/" target="_blank" rel="noopener">Galería Mor-Charpentier</a></li>
        </ul>
        <p className="site-footer__note">
          Calle 38 #16-25, La Magdalena, Teusaquillo. Propuesta de sitio web, noviembre de 2026. Fotografías de
          @cafedelamadeleine.
        </p>
      </div>
    </footer>
  );
}

export default memo(Footer);
