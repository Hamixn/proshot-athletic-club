import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../lib/api';

const AUTO_REFRESH_SECONDS = 25;

export function useQrCode(enabled: boolean = true) {
  const [token, setToken] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(AUTO_REFRESH_SECONDS);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<any>(null);
  const countdownRef = useRef<any>(null);

  const fetchToken = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/me/qr');
      setToken(res.token);
      setSecondsRemaining(AUTO_REFRESH_SECONDS);
    } catch (err: any) {
      setError(err.message || 'خطا در تولید بارکد ورود');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    fetchToken();

    // Auto refresh interval
    timerRef.current = setInterval(() => {
      fetchToken();
    }, AUTO_REFRESH_SECONDS * 1000);

    // 1-second countdown interval
    countdownRef.current = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : AUTO_REFRESH_SECONDS));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [enabled, fetchToken]);

  return {
    token,
    secondsRemaining,
    loading,
    error,
    refresh: fetchToken,
  };
}
