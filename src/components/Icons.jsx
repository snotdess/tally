// Simple line icons that match the pen-and-paper look. They use
// currentColor, so they take the text colour of whatever they're in.
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  className: 'size-5 shrink-0',
}

export function TodayIcon() {
  return (
    <svg {...base}>
      <path d="M5 3.5h14v17H5z" />
      <circle cx="8.6" cy="9" r="0.9" fill="currentColor" />
      <path d="M11 9h5" />
      <path d="M7.6 13l2 2M9.6 13l-2 2" />
      <path d="M11 14h5" />
    </svg>
  )
}

export function WeekIcon() {
  return (
    <svg {...base}>
      <path d="M3.5 5.5h17v14h-17z" />
      <path d="M3.5 10h17M9 5.5v14M14.5 5.5v14" />
    </svg>
  )
}

export function HabitsIcon() {
  return (
    <svg {...base}>
      <path d="M8 6.5v11M11 6.5v11M14 6.5v11M17 6.5v11" />
      <path d="M5.5 15.5L19.5 8.5" />
    </svg>
  )
}

export function GuideIcon() {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.4" />
      <circle cx="12" cy="16.8" r="0.6" fill="currentColor" />
    </svg>
  )
}
