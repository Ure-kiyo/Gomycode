import type { SVGProps } from 'react'

/**
 * Inline icon set.
 *
 * A handful of hand-picked 24px glyphs is cheaper (and more consistent) than
 * pulling in an icon package for a three-tab app. All icons share the same
 * `currentColor` stroke so they inherit text colour.
 */

type IconProps = SVGProps<SVGSVGElement>

function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  )
}

export function ChatIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </Base>
  )
}

export function SparkleIcon(props: IconProps) {
  return (
    <Base {...props}>
      {/* Magic wand stick */}
      <path d="M15 4 L20 9" strokeWidth={2} />
      <path d="M5.5 18.5 L14 10" strokeWidth={2} />
      {/* Wand tip sparkle */}
      <path d="M19 4 L20 2M20 4 L22 3M20 6 L22 6" strokeWidth={1.5} />
      {/* Small stars around */}
      <path d="M6 7 L6.5 5.5 L7 7 L8.5 7.5 L7 8 L6.5 9.5 L6 8 L4.5 7.5Z" fill="currentColor" stroke="none" />
      <path d="M11 15 L11.4 14 L11.8 15 L12.8 15.4 L11.8 15.8 L11.4 16.8 L11 15.8 L10 15.4Z" fill="currentColor" stroke="none" />
    </Base>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Base>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </Base>
  )
}

export function HeartIcon({ filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <Base {...props} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 20s-7-4.35-7-9.5A4.5 4.5 0 0 1 12 7.6 4.5 4.5 0 0 1 19 10.5c0 5.15-7 9.5-7 9.5z" />
    </Base>
  )
}

export function StarIcon({ filled = true, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} aria-hidden {...props}>
      <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8z" />
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />
    </Base>
  )
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </Base>
  )
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
    </Base>
  )
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M14.5 5.5 8 12l6.5 6.5" />
    </Base>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </Base>
  )
}

export function TrashIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 7h14M10 7V5.5A1.5 1.5 0 0 1 11.5 4h1A1.5 1.5 0 0 1 14 5.5V7M6.5 7l.7 12a1.5 1.5 0 0 0 1.5 1.4h6.6a1.5 1.5 0 0 0 1.5-1.4l.7-12" />
    </Base>
  )
}

export function RefreshIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M19 12a7 7 0 1 1-2.05-4.95" />
      <path d="M19.5 4.5V9H15" />
    </Base>
  )
}

export function LogoutIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M14 8V6.5A1.5 1.5 0 0 0 12.5 5h-6A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19h6a1.5 1.5 0 0 0 1.5-1.5V16" />
      <path d="M10 12h10M17 9l3 3-3 3" />
    </Base>
  )
}

export function EditIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4.5 19.5h4L19 9a2.1 2.1 0 0 0-3-3L5.5 16.5z" />
      <path d="m14.5 7.5 2 2" />
    </Base>
  )
}

export function SlidersIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 7h14M5 12h14M5 17h14" />
      <circle cx="9" cy="7" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="8" cy="17" r="1.8" fill="currentColor" stroke="none" />
    </Base>
  )
}

export function BellIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6z" />
      <path d="M10.5 19a1.8 1.8 0 0 0 3 0" />
    </Base>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Base>
  )
}

export function GlobeIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.2 2.4 3.2 5.4 3.2 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.2-5.4-3.2-8.5S9.8 5.9 12 3.5z" />
    </Base>
  )
}

export function MoonIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4 8.5 8.5 0 1 0 20 14.2z" />
    </Base>
  )
}

export function SunIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </Base>
  )
}

export function TagIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4.5 11V5.5A1 1 0 0 1 5.5 4.5H11L20 13.5 13.5 20z" />
      <circle cx="8.2" cy="8.2" r="1.3" fill="currentColor" stroke="none" />
    </Base>
  )
}

export function SendIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4.5 12 20 4.5 15 20l-3.6-5.4z" />
      <path d="M11.4 14.6 20 4.5" />
    </Base>
  )
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M14 5h5v5M19 5l-7.5 7.5" />
      <path d="M18 14.5V18a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V7.5A1.5 1.5 0 0 1 6 6h3.5" />
    </Base>
  )
}
