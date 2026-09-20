import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'outline' | 'dark-outline' | 'inverted' | 'danger' | 'quiet'
type Size = 'sm' | 'md'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent-green text-white border-accent-green',
  outline: 'bg-transparent text-accent-green border-accent-green',
  'dark-outline': 'bg-transparent text-ink border-ink',
  // DESIGN.md "Green-on-Green Inverted": on a House Green surface a filled
  // green pill disappears, so it flips to white with green type.
  inverted: 'bg-white text-accent-green border-white',
  danger: 'bg-transparent text-danger border-danger',
  quiet: 'bg-transparent text-ink-soft border-transparent',
}

const SIZES: Record<Size, string> = {
  // DESIGN.md specs 7px 16px (~32px tall). That is under the 44px touch
  // minimum, and this app is phone-only, so the pills are padded out.
  sm: 'min-h-[36px] px-4 text-sm font-semibold',
  md: 'min-h-[44px] px-5 text-base font-semibold',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={`tap inline-flex items-center justify-center gap-2 rounded-pill border
        ${VARIANTS[variant]} ${SIZES[size]}
        disabled:opacity-40 disabled:pointer-events-none ${className}`}
      {...rest}
    />
  )
}
