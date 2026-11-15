import { NavLink } from 'react-router'
import { GuideIcon, HabitsIcon, TodayIcon, WeekIcon } from './Icons'

const ITEMS = [
  { to: '/', label: 'Today', Icon: TodayIcon, end: true },
  { to: '/week', label: 'This week', short: 'Week', Icon: WeekIcon },
  { to: '/habits', label: 'Habits', Icon: HabitsIcon },
  { to: '/welcome', label: 'Guide', Icon: GuideIcon },
]

// Desktop: index tabs sticking up from the top of the notebook page.
export function TabNav() {
  return (
    <nav aria-label="Main" className="hidden items-end gap-1 sm:flex">
      {ITEMS.map(({ to, label, Icon, end }, i) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-2 rounded-t-md px-4 font-mono text-xs tracking-[0.14em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-ink ${
              i === ITEMS.length - 1 ? 'ml-auto' : ''
            } ${
              isActive
                ? 'bg-paper pt-3.5 pb-3 text-ink'
                : 'bg-[#ddd4c0] pt-2.5 pb-2.5 text-pencil hover:bg-[#e9e1cf] hover:text-ink'
            }`
          }
        >
          <Icon />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

// Phones: a bar fixed to the bottom of the screen, within thumb reach.
export function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-rule bg-paper pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      <ul className="grid grid-cols-4">
        {ITEMS.map(({ to, label, short, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 pt-2.5 pb-2 font-mono text-[10px] tracking-wider uppercase ${
                  isActive ? 'text-ink' : 'text-pencil'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute top-0 h-[3px] w-10 rounded-b bg-redpen" aria-hidden="true" />}
                  <Icon />
                  {short ?? label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
