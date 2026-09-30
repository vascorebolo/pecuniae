import { createRoot } from 'react-dom/client';
import { App } from './components/App/App';
import './styles/global.scss';

const root = document.getElementById('root');
if (!root) throw new Error('Missing application root.');
createRoot(root).render(<App />);
