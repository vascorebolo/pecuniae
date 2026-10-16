import logoUrl from '../../assets/logo.svg';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './Sidebar.module.scss';

export type AppView = 'expenses' | 'investments' | 'categories';

interface SidebarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

const navigation: Array<{
  view: AppView;
  label: string;
  icon: IconName;
}> = [
  { view: 'expenses', label: 'Expenses', icon: 'expense' },
  { view: 'investments', label: 'Investments', icon: 'investments' },
  { view: 'categories', label: 'Categories', icon: 'categories' },
];

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <img className={styles.logo} src={logoUrl} alt="Pecuniae" />
      <nav aria-label="Main navigation">
        {navigation.map((item) => (
          <button
            key={item.view}
            className={activeView === item.view ? styles.active : undefined}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onNavigate(item.view)}
            aria-current={activeView === item.view ? 'page' : undefined}
            title={item.label}
          >
            <Icon name={item.icon} size={19} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <span className={styles.localNote}>Your data stays on this Mac</span>
    </aside>
  );
}
