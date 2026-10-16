import { Icon } from '../Icon/Icon';
import styles from './InvestmentsPlaceholder.module.scss';

export function InvestmentsPlaceholder() {
  return (
    <section className={styles.placeholder}>
      <div className={styles.icon}>
        <Icon name="investments" size={30} />
      </div>
      <p className={styles.eyebrow}>Coming next</p>
      <h1>Investment tracking</h1>
      <p>
        This space is ready for your ETF portfolio, holdings, contributions, and
        performance overview.
      </p>
    </section>
  );
}
