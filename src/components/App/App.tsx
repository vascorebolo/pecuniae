import { useEffect, useState } from 'react';
import type { Dashboard, FormOptions } from '../../shared';
import { Header } from '../Header/Header';
import { CategoryManager } from '../CategoryManager/CategoryManager';
import { MonthNavigator } from '../MonthNavigator/MonthNavigator';
import { AnalyticsDashboard } from '../AnalyticsDashboard/AnalyticsDashboard';
import { SummaryCards } from '../SummaryCards/SummaryCards';
import { TransactionForm } from '../TransactionForm/TransactionForm';
import { TransactionList } from '../TransactionList/TransactionList';
import styles from './App.module.scss';
import { getCurrentMonth } from '../../utils/format';

type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem('pecuniae-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export function App() {
  const [dashboard, setDashboard] = useState<Dashboard>();
  const [options, setOptions] = useState<FormOptions>();
  const [loadError, setLoadError] = useState('');
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [dataVersion, setDataVersion] = useState(0);

  const refresh = async () => {
    const [nextDashboard, nextOptions] = await Promise.all([
      window.pecuniae.getDashboard(selectedMonth),
      window.pecuniae.getFormOptions(),
    ]);
    setDashboard(nextDashboard);
    setOptions(nextOptions);
    setDataVersion((version) => version + 1);
  };

  useEffect(() => {
    void refresh().catch(() => setLoadError('Could not load your data.'));
  }, [selectedMonth]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('pecuniae-theme', theme);
  }, [theme]);

  return (
    <main className={styles.app}>
      <Header
        balanceCents={dashboard?.balanceCents ?? 0}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />
      <MonthNavigator month={selectedMonth} onMonthChange={setSelectedMonth} />
      <AnalyticsDashboard month={selectedMonth} dataVersion={dataVersion} />
      <SummaryCards
        incomeCents={dashboard?.monthIncomeCents ?? 0}
        expenseCents={dashboard?.monthExpenseCents ?? 0}
      />
      {loadError && <p className={styles.error}>{loadError}</p>}
      <div className={styles.layout}>
        <TransactionForm
          options={options}
          onSaved={refresh}
          onCategoriesChanged={refresh}
        />
        <TransactionList
          transactions={dashboard?.recentTransactions ?? []}
          categories={options?.categories ?? []}
          month={selectedMonth}
          onTransactionsChanged={refresh}
        />
      </div>
      <CategoryManager
        categories={options?.categories ?? []}
        onCategoriesChanged={refresh}
      />
    </main>
  );
}
