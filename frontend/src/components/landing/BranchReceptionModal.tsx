import React, { useEffect } from 'react';
import { X, Phone, MapPin, ArrowUpLeft, Info } from 'lucide-react';
import { SHIRAZ_BRANCHES } from '../../data/branches';

interface BranchReceptionModalProps {
  isOpen: boolean;
  defaultBranchSlug?: string;
  onClose: () => void;
}

export const BranchReceptionModal: React.FC<BranchReceptionModalProps> = ({
  isOpen,
  defaultBranchSlug,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reception-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#09090B] border border-[#F2EFE9]/20 p-4 sm:p-7 text-[#F2EFE9] max-h-[92vh] overflow-y-auto rounded-[2px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="بستن پنجره تماس"
          onClick={onClose}
          className="absolute top-4 left-4 sm:top-5 sm:left-5 w-8 h-8 sm:w-9 sm:h-9 border border-[#F2EFE9]/15 flex items-center justify-center text-[#9A958C] hover:text-[#F2EFE9] hover:border-[#C9A96A] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Notice */}
        <div className="flex items-center gap-2 text-[#C9A96A] text-[11px] sm:text-xs font-bold mb-1.5">
          <Phone className="w-3.5 h-3.5" />
          <span>پذیرش مستقیم کلوب‌های ورزشی پروشات</span>
        </div>

        <h3 id="reception-modal-title" className="text-xl sm:text-2xl font-black text-[#F2EFE9] mb-2">
          تماس با پذیرش شعب و استعلام شهریه
        </h3>

        <div className="bg-[#141418] border border-[#C9A96A]/30 p-3 sm:p-3.5 mb-5 flex items-start gap-2.5 text-[11px] sm:text-xs text-[#EDE8DF]/90 leading-relaxed">
          <Info className="w-4 h-4 text-[#C9A96A] shrink-0 mt-0.5" />
          <p>
            جهت استعلام دقیق تعرفه عضویت، اطلاع از سانس‌های آقایان و بانوان و هماهنگی پذیرش، مستقیماً با شماره اختصاصی پذیرش شعبه مورد نظر تماس حاصل فرمایید. همکاران ما در ساعات کاری پاسخگوی شما خواهند بود.
          </p>
        </div>

        {/* Branches Grid */}
        <div className="space-y-3">
          {SHIRAZ_BRANCHES.map((b) => {
            const isPremium = b.isPremium;
            const isSelected = Boolean(defaultBranchSlug && b.slug === defaultBranchSlug);

            return (
              <div
                key={b.slug}
                className={`p-3.5 sm:p-4 border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#151410] border-[#C9A96A] shadow-md shadow-[#C9A96A]/10 ring-1 ring-[#C9A96A]/60'
                    : isPremium
                    ? 'bg-[#12110E] border-[#C9A96A]/45 hover:border-[#C9A96A]'
                    : 'bg-[#101014] border-[#F2EFE9]/10 hover:border-[#F2EFE9]/25'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-[#F2EFE9]">
                      {b.name}
                    </span>
                    <span
                      className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 border ${
                        isPremium
                          ? 'border-[#C9A96A]/40 text-[#C9A96A]'
                          : 'border-[#F2EFE9]/15 text-[#8A857B]'
                      }`}
                    >
                      {b.genderLabel}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] font-black px-2 py-0.5 bg-[#C9A96A] text-[#070708] rounded-[2px]">
                        شعبه انتخابی شما
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] sm:text-[11px] text-[#8A857B] flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-[#C9A96A] shrink-0" />
                    <span>{b.address}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                  <a
                    href={`tel:${b.phone || '07138440107'}`}
                    className="group flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#C9A96A] hover:bg-[#d8b97a] text-[#070708] text-[11px] sm:text-xs font-black transition-colors rounded-[2px]"
                  >
                    <Phone className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    <span dir="ltr">{b.phoneDisplay}</span>
                  </a>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.mapQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 sm:p-2.5 border border-[#F2EFE9]/15 hover:border-[#C9A96A] text-[#8A857B] hover:text-[#EDE8DF] transition-colors"
                    title="مسیریابی روی نقشه"
                    aria-label={`مسیریابی ${b.name} روی نقشه گوگل`}
                  >
                    <ArrowUpLeft className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-3.5 border-t border-[#F2EFE9]/10 text-center">
          <p className="text-[10px] sm:text-[11px] text-[#8A857B]">
            ساعات پاسخگویی تلفنی و پذیرش حضوری: شنبه تا پنجشنبه از ساعت ۶:۰۰ صبح تا ۲۳:۰۰
          </p>
        </div>
      </div>
    </div>
  );
};
