import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  buttonBase,
  buttonClasses,
  buttonIconSizes,
  buttonVariants,
  type ButtonSize,
  type ButtonVariant,
} from './buttonStyles';

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'start' | 'end';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'start',
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const icon = Icon ? (
    <Icon size={buttonIconSizes[size]} strokeWidth={1.75} aria-hidden="true" />
  ) : null;
  return (
    <button type={type} className={buttonClasses({ variant, size, className })} {...rest}>
      {iconPosition === 'start' && icon}
      {children}
      {iconPosition === 'end' && icon}
    </button>
  );
}

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'aria-label'
> {
  /** Accessible name. Required because the button has no visible text. */
  label: string;
  icon: LucideIcon;
  variant?: Exclude<ButtonVariant, 'primary' | 'danger'>;
  size?: ButtonSize;
}

export function IconButton({
  label,
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  type = 'button',
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        buttonBase,
        buttonVariants[variant],
        size === 'sm' ? 'size-8' : 'size-10',
        className,
      )}
      {...rest}
    >
      <Icon size={buttonIconSizes[size] + 2} strokeWidth={1.75} aria-hidden="true" />
    </button>
  );
}
