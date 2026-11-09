import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { AttendanceRecord } from '../types/attendance';

export function useAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/me/attendance');
      setRecords(res.records || []);
    } catch (err: any) {
      setError(err.message || 'خطا در دریافت سوابق حضور');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return { records, loading, error, refresh: fetchRecords };
}
