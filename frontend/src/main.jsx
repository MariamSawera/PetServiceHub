import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import App from './app/App.jsx';
import { AuthProvider } from './features/Auth/context/AuthProvider';
import { TenantProvider } from './app/providers/TenantProvider';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TenantProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </TenantProvider>
    </BrowserRouter>
  </StrictMode>
);
