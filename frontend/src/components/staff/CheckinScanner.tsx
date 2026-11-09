import React, { useState, useRef, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface CheckinScannerProps {
  onScan: (token: string) => Promise<void>;
  loading: boolean;
}

export const CheckinScanner: React.FC<CheckinScannerProps> = ({ onScan, loading }) => {
  const [tokenInput, setTokenInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    const scanned = tokenInput.trim();
    setTokenInput('');
    await onScan(scanned);
  };

  return (
    <Card className="p-7 sm:p-10">
      <div className="max-w-md mx-auto space-y-7">
        {/* Architectural Reticle Header */}
        <div className="flex items-start justify-between border-b border-[#EDE8DF]/10 pb-5">
          <div>
            <span className="eyebrow-latin text-[#C9A96A] block mb-1">
              OPTICAL TURNSTILE TERMINAL
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-[#EDE8DF]">
              پذیرش با بارکدخوان نوری
            </h3>
            <p className="text-xs text-[#8A857B] mt-1 leading-relaxed">
              بارکد روی تلفن همراه عضو را اسکن کنید یا رشته رمزنگاری‌شده را وارد نمایید
            </p>
          </div>

          {/* Precision Corner Reticle */}
          <div className="relative w-12 h-12 border border-[#EDE8DF]/12 bg-[#0A0A0B] flex items-center justify-center shrink-0">
            <span className="absolute -top-px -right-px w-2 h-2 border-t border-r border-[#C9A96A]" />
            <span className="absolute -top-px -left-px w-2 h-2 border-t border-l border-[#C9A96A]" />
            <span className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-[#C9A96A]" />
            <span className="absolute -bottom-px -left-px w-2 h-2 border-b border-l border-[#C9A96A]" />
            <span className="w-5 h-px bg-[#C9A96A]" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            ref={inputRef}
            label="رشته کلید تردد (ورودی خودکار اسکنر)"
            type="text"
            placeholder="PS-TOKEN-..."
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            disabled={loading}
            dir="ltr"
            className="text-left font-mono text-sm py-3.5"
          />

          <div className="flex items-center justify-between gap-4 pt-1">
            <span className="eyebrow-latin text-[#8A857B]">
              ANTI-REPLAY VERIFICATION
            </span>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              disabled={!tokenInput.trim()}
            >
              اعتبارسنجی و ثبت ورود
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};
