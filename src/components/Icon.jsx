/** Íconos de línea (24×24, trazo 1.8) dibujados para esta app. */
const PATHS = {
  home: 'M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z',
  menu: 'M6 3.5h9.5L19 7v13.5H6zM15 3.5V7h4M9 11h7M9 14.5h7M9 18h4',
  cake: 'M4 20.5h16M5.5 20.5v-6.5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v6.5M5.5 15.5c1.2 1 2.4 1 3.6 0s2.4-1 3.6 0 2.4 1 3.6 0 1.6-1 2.2-.6M12 12V8.5M12 5.5c.9.9.9 1.9 0 2.6-.9-.7-.9-1.7 0-2.6z',
  leaf: 'M5 19c0-8 5-13.5 14-14 .5 9-5 14-13 14zM5 19l7.5-7.5',
  calendar: 'M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 4v4M15.5 4v4M8 14h2M11 14h2M14 14h2M8 17h2M11 17h2',
  pin: 'M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  cup: 'M5 9h11v5.5a4.5 4.5 0 0 1-4.5 4.5h-2A4.5 4.5 0 0 1 5 14.5zM16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5c-.8 1 .8 2 0 3M11.5 3.5c-.8 1 .8 2 0 3',
  table: 'M3.5 9h17M5.5 9v11M18.5 9v11M8 9l1.5-4.5h5L16 9M5.5 14h13',
  plus: 'M12 5v14M5 12h14',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  close: 'M6 6l12 12M18 6 6 18',
  search: 'M10.5 17.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM15.5 15.5 20 20',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  left: 'M14.5 5.5 8 12l6.5 6.5',
  right: 'M9.5 5.5 16 12l-6.5 6.5',
  down: 'M5.5 9.5 12 16l6.5-6.5',
  trash: 'M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13',
  phone: 'M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.5 1.5A16 16 0 0 1 5 5a1.5 1.5 0 0 1 1.5-1.5z',
  route: 'M6 19.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 8.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17.5h7.5a3 3 0 0 0 0-6h-7a3 3 0 0 1 0-6H16',
  download: 'M12 4v11M7 10.5l5 5 5-5M5 19.5h14'
};

export default function Icon({ name, size = 22, className = '' }) {
  return (
    <svg
      className={'icon ' + className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
