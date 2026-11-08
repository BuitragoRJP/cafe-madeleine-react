import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PageHead from '../components/PageHead.jsx';
import DayPicker from '../components/DayPicker.jsx';
import Icon from '../components/Icon.jsx';
import content from '../data/content.js';
import { bogotaParts, formatLongDate, MOMENTS } from '../lib/schedule.js';
import { dayStrip, nb, specialView, waUrl } from '../lib/util.js';
import { useTable } from '../lib/table.jsx';

const EASE = [0.2, 0.7, 0.2, 1];
const LAST_BOOKING_MIN = 17 * 60; // reservas para hoy hasta las 5:00 p. m.
const STEPS = ['Qué', 'Cuándo', 'Sus datos'];
const MOMENT_LABELS = { desayunos: 'Desayuno', petit: 'Petit du Jour', casa: 'Tarde' };

function typesFor(today) {
  const sp = specialView(today);
  return [
    { id: 'mesa', name: 'Una mesa', desc: 'Para desayunar, almorzar o pasar la tarde en el jardín.', min: 1, max: 20, start: 2 },
    { id: 'especial', name: sp.current ? sp.name : 'Especial colombiano', desc: sp.day + ', con unidades limitadas.', min: 1, max: 20, start: 2 },
    { id: 'evento', name: 'Un evento en el jardín', desc: 'Cumpleaños, reunión de empresa o celebración privada.', min: 2, max: 200, start: 10 },
    { id: 'catering', name: 'Catering', desc: 'La cocina de la casa para su oficina o su evento.', min: 2, max: 200, start: 10 }
  ];
}

function closedReason(d) {
  if (d.holiday) return 'Festivo';
  if (d.weekday === 0) return 'Domingo';
  return null;
}

const slide = {
  enter: (dir) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0 },
  leave: (dir) => ({ opacity: 0, x: dir * -40 })
};

export default function ReservePage({ now, today, query }) {
  const types = useMemo(() => typesFor(today), [today]);
  const valid = (id) => types.some((t) => t.id === id);
  const { items } = useTable();

  const [step, setStep] = useState(() => (valid(query.tipo) ? 2 : 1));
  const [dir, setDir] = useState(1);
  const [tipo, setTipo] = useState(() => (valid(query.tipo) ? query.tipo : null));
  const [date, setDate] = useState(null);
  const [moment, setMoment] = useState(null);
  const [people, setPeople] = useState(() => (valid(query.tipo) ? types.find((t) => t.id === query.tipo).start : 2));
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [withTable, setWithTable] = useState(true);
  const [errors, setErrors] = useState({});
  const [sentUrl, setSentUrl] = useState(null);
  // El título del paso nuevo se monta después de la salida del anterior (AnimatePresence mode="wait"):
  // se marca que quiere foco y el ref lo enfoca al aparecer
  const wantFocus = useRef(false);
  const stepHeadRef = (el) => {
    if (el && wantFocus.current) {
      wantFocus.current = false;
      el.focus();
    }
  };
  const nameRef = useRef(null);
  // Valores previos: los efectos actúan solo ante un cambio real (no al montar ni en el doble montaje de StrictMode)
  const initialQuery = useRef(query);
  const prevView = useRef(step + '|' + Boolean(sentUrl));

  const type = types.find((t) => t.id === tipo);
  const minutes = bogotaParts(now).minutes;

  // ?tipo= desde otra vista: se elige el tipo y se salta al paso de la fecha
  useEffect(() => {
    // Cada navegación trae un `query` nuevo, incluso si repite la URL actual (ver router.js)
    if (query === initialQuery.current) return;
    if (valid(query.tipo)) chooseType(query.tipo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Al cambiar de paso, el foco va al título del paso (no en la primera carga)
  useEffect(() => {
    const view = step + '|' + Boolean(sentUrl);
    if (prevView.current === view) return;
    prevView.current = view;
    wantFocus.current = true;
  }, [step, sentUrl]);

  const days = useMemo(() => {
    if (tipo === 'especial') return dayStrip(now, 42).filter((d) => d.weekday === content.special.weekday).slice(0, 5);
    return dayStrip(now, tipo === 'mesa' ? 21 : 42);
    // `today` cambia una vez al día; `now` cada minuto: la tira solo depende del día
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, today]);

  const reasonFor = (d) => {
    if (tipo === 'evento' || tipo === 'catering') return d.offset === 0 ? 'Muy pronto' : null;
    const closed = closedReason(d);
    if (closed) return closed;
    if (d.offset === 0 && minutes >= LAST_BOOKING_MIN) return 'Ya cerramos';
    return null;
  };
  const noteFor = (d) => {
    if ((tipo === 'evento' || tipo === 'catering') && closedReason(d)) return 'Por confirmar';
    // Miércoles de otro mes: el plato cambia, así que no se promete el de hoy
    if (tipo === 'especial' && specialView(today).current && !specialView(d.key).current) return 'Otro plato';
    return null;
  };

  const isToday = date === today;
  const momentDisabled = (m) => isToday && minutes >= m.to;

  function chooseType(id) {
    const t = types.find((x) => x.id === id);
    setTipo(id);
    setDate(null);
    setMoment(null);
    setPeople(t.start);
    setErrors({});
    setSentUrl(null);
    setDir(1);
    setStep(2);
  }

  const go = (n) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
  };

  const checkStep2 = () => {
    const e = {};
    const d = days.find((x) => x.key === date);
    if (!d || reasonFor(d)) e.date = 'Elija un día disponible.';
    if (tipo === 'mesa') {
      const m = MOMENTS.find((x) => x.id === moment);
      if (!m || momentDisabled(m)) e.moment = 'Elija a qué hora del día viene.';
    }
    setErrors(e);
    if (!Object.keys(e).length) go(3);
  };

  const submit = (ev) => {
    ev.preventDefault();
    const e = {};
    if (!name.trim()) e.name = 'Escriba su nombre.';
    const n = Number(people);
    if (!Number.isInteger(n) || n < type.min || n > type.max) e.people = `Escriba entre ${type.min} y ${type.max} personas.`;
    // La hora pudo pasar mientras llenaba el formulario
    const d = days.find((x) => x.key === date);
    if (!d || reasonFor(d)) e.date = 'Ese día ya no está disponible. Vuelva al paso 2.';
    else if (tipo === 'mesa') {
      const m = MOMENTS.find((x) => x.id === moment);
      if (!m || momentDisabled(m)) e.date = 'Ese momento del día ya pasó. Vuelva al paso 2 y elija otro.';
    }
    setErrors(e);
    if (Object.keys(e).length) {
      if (e.name) nameRef.current?.focus();
      return;
    }

    const hello = 'Hola, soy ' + name.trim() + '.';
    const when = formatLongDate(date);
    const lines = [];
    if (tipo === 'mesa') {
      const m = MOMENTS.find((x) => x.id === moment);
      lines.push(hello + ' Quiero reservar una mesa en Café de la Madeleine.', 'Fecha: ' + when, 'Momento: ' + MOMENT_LABELS[m.id], 'Personas: ' + n);
    } else if (tipo === 'especial') {
      const sp = specialView(date);
      lines.push(hello + ' Quiero reservar ' + sp.dish + ' para el ' + when + '. Somos ' + n + (n === 1 ? ' persona.' : ' personas.'));
    } else {
      lines.push(hello + (tipo === 'evento' ? ' Quiero cotizar un evento en el jardín.' : ' Quiero cotizar catering.'), 'Fecha: ' + when, 'Personas: ' + n);
    }
    if (withTable && items.length) lines.push('Me gustaría probar: ' + items.join(', ') + '.');
    if (notes.trim()) lines.push('Detalles: ' + notes.trim());

    const url = waUrl(lines.join('\n'));
    window.open(url, '_blank', 'noopener');
    setSentUrl(url);
  };

  const restart = () => {
    setSentUrl(null);
    setTipo(null);
    setDate(null);
    setMoment(null);
    setName('');
    setNotes('');
    setErrors({});
    go(1);
  };

  const chosenMoment = MOMENTS.find((m) => m.id === moment);
  // Con fecha elegida, el especial se nombra según el mes de esa fecha (igual que el mensaje de WhatsApp)
  const summaryName = tipo === 'especial' && date ? (specialView(date).current ? specialView(date).name : 'Especial colombiano') : type?.name;

  return (
    <>
      <PageHead title="Reservar">
        <p>Tres pasos y le abrimos WhatsApp con el mensaje listo para enviar. El café confirma por ahí.</p>
      </PageHead>

      <section className="wrap wizard" aria-label="Reserva">
        <div className="wizard__main">
          <ol className="steps">
            {STEPS.map((label, i) => {
              const n = i + 1;
              const done = n < step && !sentUrl;
              const current = n === step && !sentUrl;
              const reachable = n < step && !sentUrl;
              return (
                <li key={label} className={'steps__item' + (done ? ' is-done' : '') + (current ? ' is-current' : '')} aria-current={current ? 'step' : undefined}>
                  {reachable ? (
                    <button type="button" onClick={() => go(n)}>
                      <span className="steps__num">{done ? <Icon name="check" size={16} /> : n}</span>
                      {label}
                      <span className="visually-hidden">, volver a este paso</span>
                    </button>
                  ) : (
                    <span>
                      <span className="steps__num">{n}</span>
                      {label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>

          <div className="wizard__stage">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              {sentUrl ? (
                <motion.div key="sent" className="sent" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                  <svg viewBox="0 0 52 52" className="sent__check" aria-hidden="true">
                    <motion.circle cx="26" cy="26" r="24" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
                    <motion.path d="M15 27l7 7 15-16" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.5 }} />
                  </svg>
                  <h2 ref={stepHeadRef} tabIndex={-1}>Abrimos WhatsApp con su mensaje</h2>
                  <p>Solo falta tocar «Enviar» en WhatsApp. El café le confirma por ahí. Si no se abrió, use este enlace:</p>
                  <div className="sent__actions">
                    <a className="btn btn--gold" href={sentUrl} target="_blank" rel="noopener">Abrir WhatsApp</a>
                    <button type="button" className="btn btn--line" onClick={restart}>Hacer otra reserva</button>
                  </div>
                </motion.div>
              ) : step === 1 ? (
                <motion.div key="s1" custom={dir} variants={slide} initial="enter" animate="center" exit="leave" transition={{ duration: 0.3, ease: EASE }}>
                  <h2 className="wizard__title" ref={stepHeadRef} tabIndex={-1}>¿Qué quiere reservar?</h2>
                  <div className="types" role="radiogroup" aria-label="Tipo de reserva">
                    {types.map((t) => (
                      <motion.button
                        key={t.id}
                        type="button"
                        role="radio"
                        aria-checked={tipo === t.id}
                        className={'type' + (tipo === t.id ? ' is-selected' : '') + ' type--' + t.id}
                        onClick={() => chooseType(t.id)}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="type__name">{t.name}</span>
                        <span className="type__desc">{t.desc}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : step === 2 ? (
                <motion.div key="s2" custom={dir} variants={slide} initial="enter" animate="center" exit="leave" transition={{ duration: 0.3, ease: EASE }}>
                  <h2 className="wizard__title" ref={stepHeadRef} tabIndex={-1}>¿Qué día?</h2>
                  <p className="wizard__hint" id="day-hint">
                    {tipo === 'especial'
                      ? 'El especial se sirve los ' + content.special.dayName + '. Le mostramos los próximos.'
                      : tipo === 'mesa'
                        ? 'Abrimos de lunes a sábado. Domingos y festivos, cerrado.'
                        : 'Para eventos y catering, desde mañana. Los domingos y festivos se confirman con el café.'}
                  </p>
                  <DayPicker days={days} value={date} onChange={(k) => { setDate(k); setMoment(null); setErrors({}); }} reasonFor={reasonFor} noteFor={noteFor} label="Fecha" describedBy="day-hint" />
                  {errors.date && <p className="field__error" role="alert">{errors.date}</p>}

                  {tipo === 'mesa' && (
                    <>
                      <h3 className="wizard__sub" id="moment-label">¿A qué hora del día?</h3>
                      <div className="chips" role="radiogroup" aria-labelledby="moment-label">
                        {MOMENTS.map((m) => {
                          const off = !date || momentDisabled(m);
                          return (
                            <button
                              key={m.id}
                              type="button"
                              role="radio"
                              aria-checked={moment === m.id}
                              aria-disabled={off ? 'true' : undefined}
                              className="chip chip--moment"
                              onClick={() => !off && (setMoment(m.id), setErrors({}))}
                            >
                              <strong>{MOMENT_LABELS[m.id]}</strong>
                              <span>{nb(content.menu.find((s) => s.id === m.id).hours)}</span>
                            </button>
                          );
                        })}
                      </div>
                      {!date && <p className="wizard__hint">Elija primero el día.</p>}
                      {errors.moment && <p className="field__error" role="alert">{errors.moment}</p>}
                    </>
                  )}

                  <div className="wizard__nav">
                    <button type="button" className="btn btn--line" onClick={() => go(1)}>
                      <Icon name="left" size={18} /> Cambiar tipo
                    </button>
                    <button type="button" className="btn btn--gold" onClick={checkStep2}>
                      Continuar <Icon name="right" size={18} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form key="s3" noValidate onSubmit={submit} custom={dir} variants={slide} initial="enter" animate="center" exit="leave" transition={{ duration: 0.3, ease: EASE }}>
                  <h2 className="wizard__title" ref={stepHeadRef} tabIndex={-1}>Sus datos</h2>

                  <div className="field">
                    <span className="field__label" id="people-label">Personas</span>
                    <div className="stepper" role="group" aria-labelledby="people-label">
                      <button type="button" className="icon-btn icon-btn--round" onClick={() => setPeople((p) => Math.max(type.min, Number(p) - 1))} disabled={Number(people) <= type.min} aria-label="Una persona menos">
                        <span aria-hidden="true">−</span>
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={type.min}
                        max={type.max}
                        value={people}
                        onChange={(e) => {
                          setPeople(e.target.value);
                          if (errors.people) setErrors(({ people: _, ...rest }) => rest);
                        }}
                        aria-labelledby="people-label"
                        aria-invalid={errors.people ? 'true' : 'false'}
                        aria-describedby={errors.people ? 'people-error' : undefined}
                      />
                      <button type="button" className="icon-btn icon-btn--round" onClick={() => setPeople((p) => Math.min(type.max, Number(p) + 1))} disabled={Number(people) >= type.max} aria-label="Una persona más">
                        <Icon name="plus" size={18} />
                      </button>
                    </div>
                    {errors.people && <p className="field__error" id="people-error">{errors.people}</p>}
                  </div>

                  <div className="field">
                    <label htmlFor="rv-name">Su nombre</label>
                    <input
                      id="rv-name"
                      ref={nameRef}
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors(({ name: _, ...rest }) => rest);
                      }}
                      aria-invalid={errors.name ? 'true' : 'false'}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      required
                    />
                    {errors.name && <p className="field__error" id="name-error">{errors.name}</p>}
                  </div>

                  <div className="field">
                    <label htmlFor="rv-notes">
                      Detalles <span className="field__optional">(opcional)</span>
                    </label>
                    <textarea
                      id="rv-notes"
                      rows="3"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={tipo === 'evento' || tipo === 'catering' ? 'Horario, menú vegetariano, presupuesto…' : 'Cumpleaños, silla para bebé, mesa en el jardín…'}
                    />
                  </div>

                  {items.length > 0 && (
                    <label className="check">
                      <input type="checkbox" checked={withTable} onChange={(e) => setWithTable(e.target.checked)} />
                      <span>
                        Mencionar los platos de mi mesa
                        <span className="check__list">{items.join(', ')}</span>
                      </span>
                    </label>
                  )}

                  {errors.date && <p className="field__error" role="alert">{errors.date}</p>}

                  <div className="wizard__nav">
                    <button type="button" className="btn btn--line" onClick={() => go(2)}>
                      <Icon name="left" size={18} /> Cambiar fecha
                    </button>
                    <motion.button className="btn btn--gold" type="submit" whileTap={{ scale: 0.98 }}>
                      Enviar por WhatsApp
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        <aside className="ticket" aria-label="Resumen de su reserva">
          <h2 className="ticket__title">Su reserva</h2>
          <dl>
            <div>
              <dt>Qué</dt>
              <dd>{type ? summaryName : 'Por elegir'}</dd>
            </div>
            <div>
              <dt>Cuándo</dt>
              <dd>
                {date ? formatLongDate(date) : 'Por elegir'}
                {chosenMoment && tipo === 'mesa' && <>, {MOMENT_LABELS[chosenMoment.id]}</>}
              </dd>
            </div>
            {step === 3 && (
              <div>
                <dt>Personas</dt>
                <dd>{people}</dd>
              </div>
            )}
            {items.length > 0 && (
              <div>
                <dt>Mi mesa</dt>
                <dd>{items.length === 1 ? '1 plato' : items.length + ' platos'}</dd>
              </div>
            )}
          </dl>
          <p className="ticket__note">También puede llamar al {content.phoneDisplay}.</p>
        </aside>
      </section>
    </>
  );
}
