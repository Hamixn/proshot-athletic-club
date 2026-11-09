import { useState, useCallback } from 'react';
import { api } from '../lib/api';
import { Member } from '../types/member';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!api.getToken());
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestOtp = useCallback(async (phone: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/request-otp', { phone });
      return res;
    } catch (err: any) {
      setError(err.message || 'خطا در ارسال کد تأیید');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOtp = useCallback(async (phone: string, code: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/verify-otp', { phone, code });
      if (res.token) {
        api.setToken(res.token);
      }
      if (res.member) {
        setMember(res.member);
      }
      setIsLoggedIn(true);
      return res;
    } catch (err: any) {
      setError(err.message || 'کد وارد شده صحیح نیست');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    api.setToken(null);
    setIsLoggedIn(false);
    setMember(null);
  }, []);

  return {
    isLoggedIn,
    member,
    setMember,
    loading,
    error,
    requestOtp,
    verifyOtp,
    logout,
  };
}
