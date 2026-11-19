import { useEffect, useState } from 'react';
import { TenantContext } from './tenantContext';
import { switchTenant } from '../../features/Auth/services/authApi';

const DEFAULT_TENANT = import.meta.env.VITE_TENANT_SLUG || 'default';

export function TenantProvider({ children }) {
  const [tenantSlug, setTenantSlugState] = useState(() => localStorage.getItem('pawcareTenant') || DEFAULT_TENANT);

  useEffect(() => {
    const handleTenantUpdate = (event) => setTenantSlugState(event.detail);
    window.addEventListener('tenant-updated', handleTenantUpdate);
    return () => window.removeEventListener('tenant-updated', handleTenantUpdate);
  }, []);

  const setTenantSlug = async (nextSlug) => {
    const normalizedSlug = nextSlug.trim().toLowerCase();
    if (!normalizedSlug || !/^[a-z0-9-]+$/.test(normalizedSlug)) return { ok: false, message: 'Invalid tenant slug' };
    try {
      const { data } = await switchTenant(normalizedSlug);
      localStorage.setItem('pawcareTenant', data.tenant?.slug || normalizedSlug);
      setTenantSlugState(data.tenant?.slug || normalizedSlug);
      window.dispatchEvent(new CustomEvent('tenant-updated', { detail: data.tenant?.slug || normalizedSlug }));
      window.location.reload();
      return { ok: true, data };
    } catch (error) {
      return { ok: false, message: error.response?.data?.message || 'Could not switch tenant' };
    }
  };

  return <TenantContext.Provider value={{ tenantSlug, setTenantSlug }}>{children}</TenantContext.Provider>;
}

