// Bullet-journal notation: a dot (•) is a task, a cross (×) means it's done.
// When `done` flips to true, the two strokes of the X draw themselves.
export default function Bullet({ done, color }) {
  return (
    <svg viewBox="0 0 24 24" className="size-6 overflow-visible" aria-hidden="true">
      {done ? (
        <g
          className="ink-land origin-center"
          stroke={color}
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
          filter="url(#ink-rough)"
        >
          <path className="ink-draw" pathLength="1" d="M6 6.5 C 10 10.5, 14 13.5, 18.2 17.6" />
          <path className="ink-draw ink-draw-2" pathLength="1" d="M17.6 5.8 C 13.5 10, 10 14, 6.4 18.3" />
        </g>
      ) : (
        <circle cx="12" cy="12" r="3.3" fill={color} />
      )}
    </svg>
  )
}
