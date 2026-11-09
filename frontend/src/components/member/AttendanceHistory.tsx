import React from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useAttendance } from '../../hooks/useAttendance';
import { Spinner } from '../ui/Spinner';

export const AttendanceHistory: React.FC = () => {
  const { records, loading } = useAttendance();

  return (
    <Card>
      <CardHeader
        index="۰۳"
        eyebrow="ATTENDANCE LOG"
        title="سجل تردد و حضور"
        subtitle="۲۰ ورود اخیر ثبت‌شده در شعب پروشات"
      />
      <CardContent className="p-0 divide-y divide-[#EDE8DF]/[0.07]">
        {loading ? (
          <div className="p-10 text-center">
            <Spinner size="md" />
            <p className="text-xs text-[#8A857B] mt-3">در حال بارگذاری سوابق...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-10 text-center text-[#8A857B]">
            <p className="text-xs">هنوز ترددی در سیستم ثبت نشده است.</p>
          </div>
        ) : (
          records.map((item) => (
            <div
              key={item.id}
              className="px-6 py-4 flex items-center justify-between gap-4 text-xs hover:bg-[#EDE8DF]/[0.02] transition-colors"
            >
              <div className="min-w-0">
                <span className="font-bold text-[#EDE8DF] block text-sm">
                  شعبه {item.branch?.name || 'پروشات'}
                </span>
                <span className="text-[#8A857B] font-mono text-[11px] mt-0.5 block">
                  {item.date_jalali} — ساعت {item.time}
                </span>
              </div>

              <div className="shrink-0">
                {item.result === 'approved' ? (
                  <Badge variant="success">تأیید شد</Badge>
                ) : item.result === 'override' ? (
                  <Badge variant="warning">مجوز دستی</Badge>
                ) : (
                  <Badge variant="danger">رد شده</Badge>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
