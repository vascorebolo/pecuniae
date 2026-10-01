import { formatMoney } from '../../utils/format';
import styles from './Header.module.scss';
import { Button } from '../Button/Button';
import logoUrl from '../../assets/logo.svg';

interface HeaderProps {
  balanceCents: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export function Header({ balanceCents, theme, onToggleTheme }: HeaderProps) {
  const currentDate = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.topline}>
          <Button
            variant="surface"
            className={styles.themeToggle}
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀' : '☾'}
          </Button>
          <span className={styles.eyebrow}>{currentDate}</span>
        </div>
        <img className={styles.logo} src={logoUrl} alt="Pecuniae" />
      </div>
      <div className={styles.actions}>
        <div className={styles.balance}>
          <span>Total balance</span>
          <strong>{formatMoney(balanceCents)}</strong>
        </div>
      </div>
    </header>
  );
}
