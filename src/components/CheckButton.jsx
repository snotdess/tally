import Bullet from './Bullet'

// The tappable dot. A dashed ring makes it obvious it's a button;
// once done, the ring disappears and the ink X takes over.
export default function CheckButton({ done, color, label, onClick, small = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={done}
      aria-label={label}
      title={label}
      className={`grid shrink-0 cursor-pointer place-items-center rounded-full border-[1.5px] transition-colors hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
        small ? 'size-8' : 'size-11'
      } ${done ? 'border-transparent' : 'border-dashed border-pencil/55 hover:border-ink'}`}
    >
      <Bullet done={done} color={color} />
    </button>
  )
}
