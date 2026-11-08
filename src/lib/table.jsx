import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * "Mi mesa": los platos que el visitante marca en la carta para mencionarlos en su reserva.
 * Se recuerda en este navegador (localStorage). Si el almacenamiento está bloqueado, funciona igual sin recordar.
 */
const STORAGE_KEY = 'madeleine-mi-mesa';
const TableContext = createContext(null);

function load() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function TableProvider({ children }) {
  const [items, setItems] = useState(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* sin almacenamiento: la selección dura mientras la página esté abierta */
    }
  }, [items]);

  const toggle = useCallback(
    (name) => setItems((list) => (list.includes(name) ? list.filter((n) => n !== name) : [...list, name])),
    []
  );
  const remove = useCallback((name) => setItems((list) => list.filter((n) => n !== name)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, toggle, remove, clear, has: (name) => items.includes(name) }),
    [items, toggle, remove, clear]
  );
  return <TableContext.Provider value={value}>{children}</TableContext.Provider>;
}

export function useTable() {
  const ctx = useContext(TableContext);
  if (!ctx) throw new Error('useTable debe usarse dentro de <TableProvider>');
  return ctx;
}
