import { formatMonth, getCurrentMonth, shiftMonth } from '../../utils/format';
import styles from './MonthNavigator.module.scss';
import { Button } from '../Button/Button';

interface MonthNavigatorProps {
  month: string;
  onMonthChange: (month: string) => void;
}

export function MonthNavigator({ month, onMonthChange }: MonthNavigatorProps) {
  const currentMonth = getCurrentMonth();
  return (
    <nav className={styles.navigator} aria-label="Transaction month">
      <div className={styles.monthControls}>
        <Button
          className={styles.previous}
          type="button"
          onClick={() => onMonthChange(shiftMonth(month, -1))}
          aria-label="Previous month"
        >
          ‹
        </Button>
        <div className={styles.monthLabel}>
          <span>Viewing</span>
          <strong>{formatMonth(month)}</strong>
        </div>
        <Button
          className={styles.next}
          type="button"
          onClick={() => onMonthChange(shiftMonth(month, 1))}
          aria-label="Next month"
        >
          ›
        </Button>
      </div>
      <Button
        className={styles.current}
        type="button"
        onClick={() => onMonthChange(currentMonth)}
        disabled={month === currentMonth}
      >
        Current month
      </Button>
    </nav>
  );
}
