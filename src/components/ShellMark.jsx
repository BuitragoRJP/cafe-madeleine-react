/** Marca de la casa: una madeleine (concha) dibujada con líneas. */
export default function ShellMark({ className = '', ribs = 'var(--chocolate)', fill = 'var(--mantequilla)' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M16 27C7 25.5 4 16 7.5 9.5 10 5 22 5 24.5 9.5 28 16 25 25.5 16 27Z" fill={fill} />
      <path
        d="M16 25 10.5 9M16 25 13.5 7.5M16 25V7M16 25 18.5 7.5M16 25 21.5 9"
        fill="none"
        stroke={ribs}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}
