import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PageHead from '../components/PageHead.jsx';
import Icon from '../components/Icon.jsx';
import Modal from '../components/Modal.jsx';
import { nb, normalize, resolveMenu, tabKeyTarget } from '../lib/util.js';
import { useTable } from '../lib/table.jsx';
import { href } from '../lib/router.js';

const EASE = [0.2, 0.7, 0.2, 1];
const FILTERS = [
  { id: 'veg', label: 'Vegetariano', test: (d) => d.tag === 'Vegetariano' },
  { id: 'fav', label: 'Favoritos del equipo', test: (d) => d.tag === 'Favorito del equipo' },
  { id: 'foto', label: 'Con foto', test: (d) => Boolean(d.img) }
];
const list = { hidden: {}, shown: { transition: { staggerChildren: 0.04 } }, exit: { opacity: 0, transition: { duration: 0.15 } } };
const row = { hidden: { opacity: 0, y: 12 }, shown: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } };

function AddButton({ name, compact = false }) {
  const { has, toggle } = useTable();
  const added = has(name);
  return (
    <motion.button
      type="button"
      className={'add-btn' + (added ? ' is-added' : '') + (compact ? ' add-btn--compact' : '')}
      aria-pressed={added}
      onClick={() => toggle(name)}
      whileTap={{ scale: 0.9 }}
      aria-label={compact ? (added ? 'Quitar de mi mesa: ' : 'Agregar a mi mesa: ') + name : undefined}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={added ? 'y' : 'n'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
          <Icon name={added ? 'check' : 'plus'} size={18} />
        </motion.span>
      </AnimatePresence>
      {!compact && <span>{added ? 'En mi mesa' : 'Agregar a mi mesa'}</span>}
    </motion.button>
  );
}

function DishRow({ item, section, onOpen, onPreview, active }) {
  return (
    <motion.li className={'dish' + (active ? ' is-active' : '')} variants={row} layout="position">
      <button
        type="button"
        className="dish__open"
        onClick={() => onOpen(item)}
        onMouseEnter={() => item.img && onPreview(item)}
        onFocus={() => item.img && onPreview(item)}
        aria-haspopup="dialog"
      >
        <span className="dish__top">
          <span className="dish__name">{item.name}</span>
          {item.tag && <span className="dish__tag">{item.tag}</span>}
          {item.img && <Icon name="eye" size={18} className="dish__has-photo" />}
          {item.img && <span className="visually-hidden">(con foto)</span>}
        </span>
        <span className="dish__desc">{item.desc}</span>
        {section && <span className="dish__section">{section}</span>}
      </button>
      <span className="dish__side">
        {item.price && <span className="dish__price">{item.price}</span>}
        <AddButton name={item.name} compact />
      </span>
    </motion.li>
  );
}

export default function MenuPage({ status, today, query }) {
  const menu = useMemo(() => resolveMenu(today), [today]);
  const currentMoment = status.open && status.moment ? status.moment : null;
  const validTab = (id) => menu.some((m) => m.id === id);
  const [active, setActive] = useState(() => (validTab(query.tab) ? query.tab : currentMoment || 'desayunos'));
  const userPicked = useRef(validTab(query.tab)); // si el visitante eligió una pestaña, no se la cambiamos
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState([]);
  const [preview, setPreview] = useState(null);
  const [detail, setDetail] = useState(null);
  const tabRefs = useRef({});
  // El último plato abierto sigue visible mientras la ventana se cierra
  const lastDetail = useRef(null);
  if (detail) lastDetail.current = detail;
  const d = detail || lastDetail.current;

  // ?tab= desde otra vista (por ejemplo, el mosaico de inicio). La consulta inicial ya se usó al montar.
  const initialQuery = useRef(query);
  useEffect(() => {
    if (query === initialQuery.current) return;
    if (validTab(query.tab)) {
      userPicked.current = true;
      setActive(query.tab);
      setPreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // La pestaña sigue al momento del día mientras el visitante no elija otra
  useEffect(() => {
    if (!userPicked.current && currentMoment) {
      setActive(currentMoment);
      setPreview(null);
    }
  }, [currentMoment]);

  const filtering = search.trim() !== '' || filters.length > 0;
  const results = useMemo(() => {
    if (!filtering) return [];
    const q = normalize(search.trim());
    const tests = FILTERS.filter((f) => filters.includes(f.id)).map((f) => f.test);
    return menu.flatMap((s) =>
      s.items
        .filter((d) => (!q || normalize(d.name + ' ' + (d.desc || '')).includes(q)) && tests.every((t) => t(d)))
        .map((d) => ({ item: d, section: s.label }))
    );
  }, [filtering, search, filters, menu]);

  const section = menu.find((m) => m.id === active);
  const shown = preview || (filtering ? results.find((r) => r.item.img)?.item : null) || { img: section.img, alt: section.alt };

  const select = (id, focus = false) => {
    userPicked.current = true;
    setActive(id);
    setPreview(null);
    if (focus) tabRefs.current[id]?.focus();
  };

  const onTabKey = (e) => {
    const ids = menu.map((m) => m.id);
    const i = ids.indexOf(active);
    const next = tabKeyTarget(e.key, i, ids.length);
    if (next === undefined) return;
    e.preventDefault();
    select(ids[next], true);
  };

  const toggleFilter = (id) => setFilters((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const reset = () => {
    setSearch('');
    setFilters([]);
    setPreview(null);
  };

  const rowProps = { onOpen: setDetail, onPreview: setPreview };

  return (
    <>
      <PageHead title="La carta">
        <p>
          Todo se hace desde cero: bases naturales, cocción lenta y recetas propias. Busque un plato, filtre y marque lo
          que le provoca para llevarlo a su reserva.
        </p>
      </PageHead>

      <section className="wrap menu-page" aria-label="Platos">
        <div className="menu-tools">
          <label className="search">
            <Icon name="search" />
            <span className="visually-hidden">Buscar en la carta</span>
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar: ajiaco, chocolate, huevos…" />
          </label>
          <div className="chips" role="group" aria-label="Filtros">
            {FILTERS.map((f) => (
              <button key={f.id} type="button" className="chip" aria-pressed={filters.includes(f.id)} onClick={() => toggleFilter(f.id)}>
                {filters.includes(f.id) && <Icon name="check" size={16} />}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {!filtering && (
          <div className="menu__tabs" role="tablist" aria-label="Momentos del día" onKeyDown={onTabKey}>
            {menu.map((m) => {
              const selected = m.id === active;
              const isNow = status.open && status.moment === m.id;
              return (
                <button
                  key={m.id}
                  ref={(el) => (tabRefs.current[m.id] = el)}
                  type="button"
                  role="tab"
                  id={'tab-' + m.id}
                  aria-selected={selected}
                  aria-controls="menu-panel"
                  tabIndex={selected ? 0 : -1}
                  className="menu__tab"
                  onClick={() => select(m.id)}
                >
                  <span className="menu__tab-name">
                    {m.label}
                    {isNow && <span className="menu__now">Ahora</span>}
                  </span>
                  <span className="menu__tab-hours">{nb(m.hours)}</span>
                  {selected && <motion.span className="menu__tab-line" layoutId="menu-tab-line" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                </button>
              );
            })}
          </div>
        )}

        <div className="menu__body">
          {filtering ? (
            <div className="menu__panel">
              <p className="results__count" role="status">
                {results.length === 0 ? 'Ningún plato coincide.' : results.length === 1 ? '1 plato' : results.length + ' platos'}
                <button type="button" className="link-btn" onClick={reset}>Ver la carta completa</button>
              </p>
              {results.length === 0 ? (
                <p className="results__empty">Pruebe con otra palabra o quite un filtro. Si busca algo puntual, pregunte por WhatsApp al reservar.</p>
              ) : (
                <motion.ul className="menu__list" variants={list} initial="hidden" animate="shown" key={search + filters.join()}>
                  {results.map(({ item, section: s }) => (
                    <DishRow key={item.name} item={item} section={s} active={preview && preview.name === item.name} {...rowProps} />
                  ))}
                </motion.ul>
              )}
            </div>
          ) : (
            <div id="menu-panel" role="tabpanel" aria-labelledby={'tab-' + active} className="menu__panel">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={active} variants={list} initial="hidden" animate="shown" exit="exit">
                  <ul className="menu__list">
                    {section.items.map((item) => (
                      <DishRow key={item.name} item={item} active={preview && preview.name === item.name} {...rowProps} />
                    ))}
                  </ul>
                  {section.note && <p className="menu__note">{section.note}</p>}
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          <figure className="menu__photo" aria-hidden="true">
            <div className="menu__photo-frame">
              <AnimatePresence initial={false}>
                <motion.img
                  key={shown.img}
                  src={shown.img}
                  alt=""
                  width="1200"
                  height="1500"
                  loading="lazy"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                />
              </AnimatePresence>
            </div>
            <figcaption>{shown.alt}</figcaption>
          </figure>
        </div>
        <p className="menu__disclaimer">
          Carta de muestra con platos publicados por el café. Precios y disponibilidad en el local.{' '}
          <a href={href('/pasteleria')}>Ver la vitrina de pastelería</a>
        </p>
      </section>

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} labelledBy="dish-title">
        {d && (
          <div className="dish-detail">
            {d.img && (
              <div className="dish-detail__img">
                <img src={d.img} alt={d.alt} width="1200" height="1500" />
              </div>
            )}
            <div className="dish-detail__body">
              <h2 id="dish-title" className="dish-detail__name">{d.name}</h2>
              {(d.tag || d.price) && (
                <p className="dish-detail__meta">
                  {d.tag && <span className="dish__tag">{d.tag}</span>}
                  {d.price && <span className="dish__price">{d.price}</span>}
                </p>
              )}
              <p>{d.desc}</p>
              <AddButton name={d.name} />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
