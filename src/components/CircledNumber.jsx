// A number with a loose red-pen circle around it, like a teacher's mark.
export default function CircledNumber({ value }) {
  return (
    <span className="relative inline-grid h-16 w-20 place-items-center">
      <svg viewBox="0 0 80 64" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
        <path
          className="ink-draw"
          pathLength="1"
          d="M14 40 C 6 20, 30 6, 52 9 C 74 12, 78 36, 64 50 C 50 62, 18 60, 10 44 C 6 34, 14 22, 28 16"
          fill="none"
          stroke="var(--color-redpen)"
          strokeWidth="2.2"
          strokeLinecap="round"
          filter="url(#ink-rough)"
        />
      </svg>
      <span className="relative font-display text-4xl font-semibold">{value}</span>
    </span>
  )
}
