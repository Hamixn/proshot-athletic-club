import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { toPersianDigits } from '../../lib/jalali';

interface OtpFormProps {
  phone: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  loading: boolean;
  error?: string | null;
}

export const OtpForm: React.FC<OtpFormProps> = ({
  phone,
  onVerify,
  onResend,
  onBack,
  loading,
  error,
}) => {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length === 5) {
      await onVerify(code.trim());
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    await onResend();
    setTimeLeft(60);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {error && <Alert type="error">{error}</Alert>}

      <div className="pb-3 border-b border-[#EDE8DF]/10 flex items-center justify-between text-xs">
        <span className="text-[#8A857B]">ارسال‌شده به شماره</span>
        <div className="flex items-center gap-3">
          <span dir="ltr" className="font-mono text-[#EDE8DF] text-sm">
            {phone}
          </span>
          <button
            type="button"
            onClick={onBack}
            className="text-[11px] text-[#C9A96A] hover:underline cursor-pointer"
          >
            ویرایش
          </button>
        </div>
      </div>

      <Input
        label="کد ۵ رقمی تأیید"
        type="text"
        inputMode="numeric"
        dir="ltr"
        maxLength={5}
        className="text-center text-3xl font-editorial font-semibold text-[#C9A96A] py-3"
        style={{ letterSpacing: '0.45em' }}
        placeholder="•••••"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        disabled={loading}
        helperText="کد ۵ رقمی ارسال‌شده به تلفن همراه خود را وارد نمایید."
        autoFocus
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={loading}
        disabled={code.trim().length !== 5}
      >
        تأیید و ورود به پرونده
      </Button>

      <div className="flex items-center justify-between pt-1 text-xs">
        <button
          type="button"
          onClick={onBack}
          className="text-[#8A857B] hover:text-[#EDE8DF] transition-colors cursor-pointer"
        >
          بازگشت به مرحله قبل
        </button>

        {timeLeft > 0 ? (
          <span className="text-[#8A857B] text-[11px]">
            ارسال مجدد تا {toPersianDigits(timeLeft)} ثانیه دیگر
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-[#C9A96A] hover:underline font-bold cursor-pointer"
          >
            ارسال مجدد کد
          </button>
        )}
      </div>
    </form>
  );
};
