import type { SVGProps } from 'react';

export type IconName =
  | 'income'
  | 'expense'
  | 'balance'
  | 'overview'
  | 'add'
  | 'transactions'
  | 'categories';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

const paths: Record<IconName, React.ReactNode> = {
  income: (
    <>
      <path d="M12 19V5" />
      <path d="m6 11 6-6 6 6" />
    </>
  ),
  expense: (
    <>
      <path d="M12 5v14" />
      <path d="m18 13-6 6-6-6" />
    </>
  ),
  balance: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M16 11h5v4h-5a2 2 0 0 1 0-4Z" />
      <path d="M7 6V4h10v2" />
    </>
  ),
  overview: (
    <>
      <path d="M11 3a9 9 0 1 0 9 9h-9Z" />
      <path d="M14 3.5A9 9 0 0 1 20.5 10H14Z" />
    </>
  ),
  add: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  transactions: (
    <>
      <path d="M7 7h13M7 12h13M7 17h13" />
      <circle cx="4" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="17" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  categories: (
    <>
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
    </>
  ),
};

export function Icon({ name, size = 18, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
