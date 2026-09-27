import { NavLink } from 'react-router-dom'

import { ROUTES, TAB_ORDER } from '@/constants/app'
import type { RouteId } from '@/types'
import { cn } from '@/utils/cn'
import { ChatIcon, SparkleIcon, UserIcon } from '../ui/icons'

const ICONS: Record<RouteId, (props: { className?: string }) => React.ReactElement> = {
  chat: ChatIcon,
  forYou: SparkleIcon,
  account: UserIcon,
}

/**
 * Bottom tab bar.
 *
 * Always renders all three tabs — including Chat for returning users, whose
 * home screen is For You. That keeps "ask a new question" one tap away without
 * ever making the user guess where search lives.
 */
export function TabBar() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/85 backdrop-blur-xl"
      style={{ paddingBottom: 'var(--safe-b)' }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2" style={{ height: 'var(--tabbar-h)' }}>
        {TAB_ORDER.map((id) => {
          const route = ROUTES[id]
          const Icon = ICONS[id]

          return (
            <li key={id} className="flex-1">
              <NavLink
                to={route.path}
                className={({ isActive }) =>
                  cn(
                    'group relative flex h-full flex-col items-center justify-center gap-1 rounded-xl transition-colors',
                    isActive ? 'text-brand' : 'text-ink-subtle hover:text-ink-muted',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'absolute inset-x-3 top-0 h-0.5 rounded-full bg-brand transition-all duration-300',
                        isActive ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span
                      className={cn(
                        'grid size-9 place-items-center rounded-full transition-all duration-300',
                        isActive ? 'bg-brand-soft' : 'group-active:bg-surface-sunken',
                      )}
                    >
                      <Icon className="size-[1.35rem]" />
                    </span>
                    <span className={cn('text-[0.6875rem] leading-none', isActive ? 'font-semibold' : 'font-medium')}>
                      {route.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
