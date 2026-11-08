import content from '../data/content.js';
import { bogotaParts, holidaysFor, isOpenDay, todayKey } from './schedule.js';

/** Enlace de WhatsApp con mensaje ya escrito. */
export function waUrl(message) {
  return 'https://wa.me/' + content.whatsapp + (message ? '?text=' + encodeURIComponent(message) : '');
}

/** Enlace telefónico al mismo número del WhatsApp. */
export const telUrl = 'tel:+' + content.whatsapp;

/** Evita que "9:00 a. m." o "12:00 m." se partan entre líneas. */
export function nb(text) {
  return String(text)
    .replace(/(\d) ([ap])\. m\./g, '$1 $2. m.')
    .replace(/(\d) m\./g, '$1 m.');
}

/**
 * Única fuente de los textos del especial colombiano para una fecha (`today`, YYYY-MM-DD en Bogotá).
 * Si el mes del especial ya pasó (o no ha empezado), devuelve textos genéricos: nunca se anuncia un plato vencido.
 */
export function specialView(today) {
  const sp = content.special;
  const current = today >= sp.from && today <= sp.until;
  const day = 'Cada ' + sp.dayName;
  if (current) {
    return {
      current,
      weekday: sp.weekday,
      dish: sp.name.toLowerCase(),
      kicker: 'Especial colombiano de ' + sp.month,
      name: sp.name,
      day,
      desc: sp.description,
      menuDesc: 'En ' + sp.month + ', ' + sp.name.toLowerCase() + ' todos los ' + sp.dayName + '.',
      cta: sp.cta,
      message: sp.message,
      img: sp.img,
      alt: sp.alt
    };
  }
  return {
    current,
    weekday: sp.weekday,
    dish: 'especial colombiano',
    kicker: 'Especial colombiano',
    name: 'Un plato colombiano cada mes',
    day,
    desc: 'Cada mes la cocina prepara un plato tradicional colombiano al estilo de la casa. Pregunte cuál es el de este mes.',
    menuDesc: 'Un plato tradicional colombiano distinto cada mes, todos los ' + sp.dayName + '.',
    cta: 'Preguntar por el especial',
    message: 'Hola, ¿cuál es el especial colombiano de este mes?',
    img: sp.generic.img,
    alt: sp.generic.alt
  };
}

/** Eventos de la agenda vigentes en `today` (YYYY-MM-DD en Bogotá): ni pasados ni de una temporada que aún no empieza. */
export function upcomingAgenda(today) {
  return content.agenda.filter(
    (ev) => !(ev.date && ev.date < today) && !(ev.until && ev.until < today) && !(ev.from && ev.from > today)
  );
}

/** La carta con las piezas del especial (texto e imagen) resueltas para `today`. */
export function resolveMenu(today) {
  const view = specialView(today);
  const dayTag = content.special.dayName.charAt(0).toUpperCase() + content.special.dayName.slice(1);
  return content.menu.map((section) => ({
    ...section,
    ...(section.specialImage ? { img: view.img, alt: view.alt } : {}),
    items: section.items.map((item) =>
      item.special ? { ...item, desc: view.menuDesc, tag: dayTag, img: view.img, alt: view.alt } : item
    )
  }));
}

/**
 * Los próximos `count` días (desde hoy, en Bogotá) con su estado: abierto, domingo o festivo.
 * @returns {{key:string, offset:number, weekday:number, day:number, month:number, holiday:string|null, open:boolean}[]}
 */
export function dayStrip(now, count) {
  const days = [];
  for (let i = 0; i < count; i++) {
    const p = bogotaParts(new Date(now.getTime() + i * 86400000));
    const key = todayKey(i, now);
    const holiday = holidaysFor(p.year)[key] || null;
    days.push({ key, offset: i, weekday: p.weekday, day: p.day, month: p.month, holiday, open: isOpenDay(p) });
  }
  return days;
}

/** Texto en minúsculas y sin tildes, para buscar "creme" y encontrar "Crème". */
export function normalize(text) {
  return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/**
 * Teclado de una lista de pestañas (patrón ARIA): flechas con vuelta, Inicio y Fin.
 * @returns {number|undefined} índice de la pestaña a activar, o undefined si la tecla no aplica
 */
export function tabKeyTarget(key, index, length) {
  return { ArrowRight: (index + 1) % length, ArrowLeft: (index - 1 + length) % length, Home: 0, End: length - 1 }[key];
}
