import { useRef } from 'react';
import { DAY_NAMES, MONTH_NAMES } from '../lib/schedule.js';

/**
 * Tira de días seleccionable (grupo de radio con flechas).
 * `reasonFor(day)` devuelve null si el día se puede elegir, o el motivo por el que no ("Domingo", "Festivo").
 * `noteFor(day)` (opcional) agrega una nota a un día que sí se puede elegir ("Cerrado al público").
 */
export default function DayPicker({ days, value, onChange, reasonFor, noteFor = () => null, label, describedBy }) {
  const refs = useRef([]);
  const enabled = days.map((d) => !reasonFor(d));
  const selectedIndex = days.findIndex((d) => d.key === value);
  // Recibe el foco el seleccionado, o el primero disponible
  const focusIndex = selectedIndex >= 0 ? selectedIndex : enabled.indexOf(true);

  const move = (from, dir) => {
    for (let i = from + dir; i >= 0 && i < days.length; i += dir) {
      if (enabled[i]) {
        onChange(days[i].key);
        refs.current[i]?.focus();
        return;
      }
    }
  };

  const onKeyDown = (e, i) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      move(i, 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      move(i, -1);
    }
  };

  return (
    <div className="daypicker" role="radiogroup" aria-label={label} aria-describedby={describedBy}>
      {days.map((d, i) => {
        const reason = reasonFor(d);
        const note = reason ? null : noteFor(d);
        const selected = d.key === value;
        const name = d.offset === 0 ? 'Hoy' : d.offset === 1 ? 'Mañana' : DAY_NAMES[d.weekday].slice(0, 3);
        return (
          <button
            key={d.key}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-disabled={reason ? 'true' : undefined}
            aria-label={`${DAY_NAMES[d.weekday]} ${d.day} de ${MONTH_NAMES[d.month - 1]}${reason ? ', no disponible: ' + reason : ''}${note ? ', ' + note : ''}`}
            tabIndex={i === focusIndex ? 0 : -1}
            className={'day' + (selected ? ' is-selected' : '') + (reason ? ' is-disabled' : '') + (note ? ' has-note' : '')}
            onClick={() => !reason && onChange(d.key)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            <span className="day__name">{name}</span>
            <span className="day__num">{d.day}</span>
            <span className="day__month">{MONTH_NAMES[d.month - 1].slice(0, 3)}</span>
            {(reason || note) && <span className="day__reason" aria-hidden="true">{reason || note}</span>}
          </button>
        );
      })}
    </div>
  );
}
