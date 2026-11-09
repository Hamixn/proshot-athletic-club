import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useQrCode } from '../../hooks/useQrCode';
import { toPersianDigits } from '../../lib/jalali';
import { Card } from '../ui/Card';

interface QrCardProps {
  isActive: boolean;
}

export const QrCard: React.FC<QrCardProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { token, secondsRemaining, loading, refresh } = useQrCode(isActive);

  useEffect(() => {
    if (token && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        token,
        {
          width: 196,
          margin: 2,
          color: {
            dark: '#0A0A0B',
            light: '#EDE8DF',
          },
        },
        (error) => {
          if (error) console.error('QR Render error:', error);
        }
      );
    }
  }, [token]);

  if (!isActive) {
    return (
      <Card className="p-8 text-center">
        <span className="eyebrow-latin block mb-2">ACCESS INACTIVE</span>
        <p className="text-xs text-[#8A857B] leading-relaxed">
          به دلیل عدم وجود اشتراک فعال، کلید تردد دیجیتال در دسترس نیست.
        </p>
      </Card>
    );
  }

  const radius = 11;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (secondsRemaining / 25) * circumference;

  return (
    <Card className="p-6 sm:p-7">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#EDE8DF]/[0.08]">
        <div>
          <span className="eyebrow-latin block mb-1 text-[#C9A96A]">
            TURNSTILE KEY
          </span>
          <h4 className="text-base font-black text-[#EDE8DF]">
            کلید دیجیتال تردد گیت
          </h4>
        </div>

        {/* Thin SVG Ring Countdown */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="text-left">
            <span className="text-[10px] text-[#8A857B] block">تعویض خودکار</span>
            <span className="text-xs font-mono font-bold text-[#C9A96A]">
              {toPersianDigits(secondsRemaining)} ثانیه
            </span>
          </div>
          <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
            <circle
              cx="14"
              cy="14"
              r={radius}
              fill="none"
              stroke="rgba(237,232,223,0.12)"
              strokeWidth="1.5"
            />
            <circle
              cx="14"
              cy="14"
              r={radius}
              fill="none"
              stroke="#C9A96A"
              strokeWidth="1.5"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
        </div>
      </div>

      {/* Bone Paper QR Plate with Architectural Corner Marks */}
      <div className="flex flex-col items-center">
        <div className="relative p-4 bg-[#0A0A0B] border border-[#EDE8DF]/12">
          <span className="absolute -top-px -right-px w-2.5 h-2.5 border-t border-r border-[#C9A96A]" />
          <span className="absolute -top-px -left-px w-2.5 h-2.5 border-t border-l border-[#C9A96A]" />
          <span className="absolute -bottom-px -right-px w-2.5 h-2.5 border-b border-r border-[#C9A96A]" />
          <span className="absolute -bottom-px -left-px w-2.5 h-2.5 border-b border-l border-[#C9A96A]" />

          <div className="bg-[#EDE8DF] p-2">
            <canvas ref={canvasRef} className="w-44 h-44 block" />
          </div>

          {loading && (
            <div className="absolute inset-0 bg-[#0A0A0B]/85 flex items-center justify-center">
              <span className="w-5 h-5 border-[1.5px] border-[#C9A96A] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between w-full pt-4 border-t border-[#EDE8DF]/[0.06] text-xs">
          <span className="text-[#8A857B] text-[11px]">
            رمزینه پویا با امنیت ضدکپی
          </span>
          <button
            onClick={() => refresh()}
            disabled={loading}
            className="text-xs font-bold text-[#C9A96A] hover:text-[#DFC690] border-b border-[#C9A96A]/40 hover:border-[#C9A96A] pb-0.5 transition-colors cursor-pointer"
          >
            صدور کلید جدید
          </button>
        </div>
      </div>
    </Card>
  );
};
