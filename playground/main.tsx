import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/styles.css';
import './app.css';
import { ToastProvider } from '../src';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>,
);
