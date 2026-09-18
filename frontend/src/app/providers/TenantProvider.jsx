import { useState } from 'react';
import { TenantContext } from './tenantContext';

const DEFAULT_TENANT = import.meta.env.VITE_TENANT_SLUG || 'default';

export function TenantProvider({ children }) {
  const [tenantSlug, setTenantSlugState] = useState(() => localStorage.getItem('pawcareTenant') || DEFAULT_TENANT);

  const setTenantSlug = (nextSlug) => {
    const normalizedSlug = nextSlug.trim().toLowerCase();
    if (!normalizedSlug || !/^[a-z0-9-]+$/.test(normalizedSlug)) return false;
    localStorage.setItem('pawcareTenant', normalizedSlug);
    setTenantSlugState(normalizedSlug);
    window.location.reload();
    return true;
  };

  return <TenantContext.Provider value={{ tenantSlug, setTenantSlug }}>{children}</TenantContext.Provider>;
}

