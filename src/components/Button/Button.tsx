import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import styles from './Button.module.scss';

export type ButtonVariant = 'plain' | 'surface' | 'primary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  children,
  className = '',
  type = 'button',
  variant = 'plain',
  ...props
}: PropsWithChildren<ButtonProps>) {
  const classes = [styles.button, styles[variant], className]
    .filter(Boolean)
    .join(' ');
  return (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}
