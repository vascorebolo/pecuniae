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
      <Button
        type="button"
        onClick={() => onMonthChange(shiftMonth(month, -1))}
        aria-label="Previous month"
      >
        ‹
      </Button>
      <div>
        <span>Viewing</span>
        <strong>{formatMonth(month)}</strong>
      </div>
      <Button
        className={styles.current}
        type="button"
        onClick={() => onMonthChange(currentMonth)}
        disabled={month === currentMonth}
      >
        Current month
      </Button>
      <Button
        type="button"
        onClick={() => onMonthChange(shiftMonth(month, 1))}
        aria-label="Next month"
      >
        ›
      </Button>
    </nav>
  );
}
