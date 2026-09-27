import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdminRouter } from './admin/router.js';
import '../style.css';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');
createRoot(root).render(
  <StrictMode>
    <AdminRouter />
  </StrictMode>,
);
