import type { ReactNode } from 'react';

/*
 * OAButton — Figma-faithful button component
 *
 * Variants from Figma Style Sheet (node 4161:31078):
 *
 * TYPE (visual style):
 *   primary        — dark-gray bg, light text
 *   blue           — action-blue bg, white text
 *   danger         — light-gray bg, red text
 *   label          — dark-gray bg, supports credit/icon slot
 *
 * SIZE (padding + radius):
 *   big            — px-12 py-20, rounded-16, min-w-130 (hero CTAs)
 *   medium         — px-16 py-12, rounded-4, min-h-34 (standard CTAs)
 *   medium-compact — px-8 py-8, rounded-4, h-34 (icon + short label)
 *
 * STATE:
 *   default        — base colors
 *   active         — light-gray bg, text color matches type
 *   disabled       — gray-3 bg, light text
 *   added          — dark-gray bg, green text + check icon
 */

type ButtonVariant = 'primary' | 'blue' | 'danger' | 'label';
type ButtonSize = 'big' | 'medium' | 'medium-compact';
type ButtonState = 'default' | 'active' | 'disabled' | 'added';

interface OAButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  state?: ButtonState;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  fullWidth?: boolean;
  iconBefore?: ReactNode;
  iconAfter?: ReactNode;
}

const variantStyles: Record<ButtonVariant, Record<ButtonState, string>> = {
  primary: {
    default: 'bg-action-primary text-bg-secondary hover:bg-[#333333] active:scale-[0.98]',
    active: 'bg-bg-secondary text-text-primary hover:bg-gray-4/30',
    disabled: 'bg-border-default text-bg-secondary cursor-not-allowed opacity-60',
    added: 'bg-action-primary text-accent-green',
  },
  blue: {
    default: 'bg-action-secondary text-text-on-dark hover:bg-[#4080E0] active:scale-[0.98]',
    active: 'bg-bg-secondary text-action-secondary hover:bg-gray-4/30',
    disabled: 'bg-gray-3 text-bg-secondary cursor-not-allowed',
    added: 'bg-action-secondary text-text-on-dark',
  },
  danger: {
    default: 'bg-bg-secondary text-[#DD3131] hover:bg-gray-4/20',
    active: 'bg-bg-secondary text-[#DD3131]',
    disabled: 'bg-bg-secondary text-[#DD3131] opacity-40 cursor-not-allowed',
    added: 'bg-bg-secondary text-[#DD3131]',
  },
  label: {
    default: 'bg-action-primary text-bg-secondary hover:bg-[#333333] active:scale-[0.98]',
    active: 'bg-bg-secondary text-text-primary hover:bg-gray-4/30',
    disabled: 'bg-border-default text-bg-secondary cursor-not-allowed opacity-60',
    added: 'bg-action-primary text-accent-green',
  },
};

const sizeStyles: Record<ButtonSize, string> = {
  big: 'px-3 py-5 rounded-[16px] min-w-[130px]',           // Figma: px-12 py-20
  medium: 'px-4 py-3 rounded h-auto min-h-[34px]',          // Figma: px-16 py-12 (full-width CTAs)
  'medium-compact': 'px-2 py-2 rounded h-[34px]',           // Figma: p-8 (icon + label compact)
};

export default function OAButton({
  variant = 'primary',
  size = 'medium',
  state = 'default',
  children,
  onClick,
  className = '',
  fullWidth = false,
  iconBefore,
  iconAfter,
}: OAButtonProps) {
  const isDisabled = state === 'disabled';

  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={[
        'flex items-center justify-center gap-1 type-button transition-all',
        variantStyles[variant][state],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {iconBefore}
      {children}
      {iconAfter}
    </button>
  );
}
