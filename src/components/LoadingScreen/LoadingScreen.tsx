import logoUrl from '../../assets/logo.svg';
import styles from './LoadingScreen.module.scss';

export function LoadingScreen() {
  return (
    <main className={styles.loading} aria-label="Loading Pecuniae">
      <img src={logoUrl} alt="Pecuniae" />
      <span aria-hidden="true" />
      <p>Loading your finances…</p>
    </main>
  );
}
