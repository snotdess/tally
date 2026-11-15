// An invisible SVG that defines a "rough ink" filter. Any SVG shape with
// filter="url(#ink-rough)" gets slightly wobbly edges, like a real pen.
export default function InkFilters() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <filter id="ink-rough">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.4" />
      </filter>
    </svg>
  )
}
