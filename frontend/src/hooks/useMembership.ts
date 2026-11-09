import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { Membership } from '../types/member';

export function useMembership() {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [hasActive, setHasActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembership = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/me/membership');
      setMembership(res.membership || null);
      setHasActive(!!res.has_active);
    } catch (err: any) {
      setError(err.message || 'خطا در دریافت اطلاعات اشتراک');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembership();
  }, [fetchMembership]);

  return { membership, hasActive, loading, error, refresh: fetchMembership };
}
