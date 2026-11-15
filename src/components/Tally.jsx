// Draws a streak as tally marks: four lines and a diagonal per group of five.
// Long streaks switch to a handwritten number so the row doesn't overflow.

const MAX_MARKS = 10

// Small fixed "wobble" per mark so they look hand-drawn but don't jump around
const wobble = (i) => [0.4, -0.6, 0.3, -0.2, 0.5, -0.4, 0.2, -0.5, 0.6, -0.3][i % 10]

export default function Tally({ count, color }) {
  const label = `${count} day streak`

  if (count === 0) {
    return (
      <span className="font-hand text-xl leading-6 text-pencil" aria-label="no streak yet">
        –
      </span>
    )
  }

  if (count > MAX_MARKS) {
    return (
      <span className="font-hand text-2xl leading-6 whitespace-nowrap" style={{ color }} aria-label={label}>
        {count}
        <span className="text-sm text-pencil"> days</span>
      </span>
    )
  }

  const groups = []
  for (let g = 0; g * 5 < count; g++) groups.push(Math.min(5, count - g * 5))

  return (
    <svg
      viewBox={`0 0 ${groups.length * 26} 24`}
      height="24"
      width={groups.length * 26}
      role="img"
      aria-label={label}
      className="shrink-0"
    >
      <title>{label}</title>
      <g stroke={color} strokeWidth="2" strokeLinecap="round" filter="url(#ink-rough)">
        {groups.map((marks, g) => {
          const x0 = g * 26 + 4
          return (
            <g key={g}>
              {Array.from({ length: Math.min(marks, 4) }, (_, i) => {
                const x = x0 + i * 4.5
                const w = wobble(g * 5 + i)
                return <line key={i} x1={x + w} y1={4 + w} x2={x - w} y2={20 - w} />
              })}
              {marks === 5 && <line x1={x0 - 3} y1={17} x2={x0 + 17} y2={7} stroke="var(--color-redpen)" />}
            </g>
          )
        })}
      </g>
    </svg>
  )
}
