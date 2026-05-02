import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Providers } from './Providers';
import { Shell } from './Shell';
import '@/shared/lib/styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <Shell />
    </Providers>
  </StrictMode>,
);
