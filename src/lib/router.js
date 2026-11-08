import { useEffect, useState } from 'react';

/**
 * Router mínimo por hash (#/carta, #/reservar?tipo=especial).
 * Con hash la app funciona en cualquier hosting estático y abriendo dist/ sin servidor especial.
 */
export const ROUTES = [
  { path: '/', label: 'Inicio', title: 'Café de la Madeleine | Restaurante, café y jardín en Teusaquillo', icon: 'home' },
  { path: '/carta', label: 'Carta', title: 'Carta | Café de la Madeleine', icon: 'menu' },
  { path: '/pasteleria', label: 'Vitrina', title: 'Pastelería | Café de la Madeleine', icon: 'cake' },
  { path: '/jardin', label: 'La casa', title: 'La casa y el jardín | Café de la Madeleine', icon: 'leaf' },
  { path: '/agenda', label: 'Agenda', title: 'Agenda del jardín | Café de la Madeleine', icon: 'calendar' },
  { path: '/visitanos', label: 'Visítanos', title: 'Horario y ubicación | Café de la Madeleine', icon: 'pin' },
  { path: '/reservar', label: 'Reservar', title: 'Reservar | Café de la Madeleine', icon: 'cup' }
];

function parse() {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = raw.split('?');
  const known = ROUTES.some((r) => r.path === path);
  return { path: known ? path : '/', query: Object.fromEntries(new URLSearchParams(qs)) };
}

/**
 * Ruta actual; se actualiza con cada cambio de hash (incluye atrás/adelante del navegador).
 * `query` es un objeto nuevo en cada navegación, aunque repita la misma URL: las vistas reaccionan a él.
 */
export function useHashRoute() {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const onChange = () => setRoute(parse());
    // Clic en un enlace a la ruta en la que ya está (#/reservar?tipo=mesa estando ahí): el navegador
    // no emite hashchange, pero la vista debe reaccionar igual (por ejemplo, volver a elegir el tipo)
    const onClick = (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#/"]');
      if (a && a.getAttribute('href') === window.location.hash) setRoute(parse());
    };
    window.addEventListener('hashchange', onChange);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('hashchange', onChange);
      document.removeEventListener('click', onClick);
    };
  }, []);
  return route;
}

/** href para un enlace interno: href('/reservar', { tipo: 'especial' }) → '#/reservar?tipo=especial' */
export function href(path, query) {
  const qs = query ? new URLSearchParams(query).toString() : '';
  return '#' + path + (qs ? '?' + qs : '');
}

export function navigate(path, query) {
  window.location.hash = href(path, query).slice(1);
}
