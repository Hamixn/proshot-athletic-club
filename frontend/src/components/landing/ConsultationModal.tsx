import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Phone, User, Sparkles } from 'lucide-react';
import { SHIRAZ_BRANCHES } from '../../data/branches';
import { api } from '../../lib/api';
import { isValidIranianMobile } from '../../lib/phone';

interface ConsultationModalProps {
  isOpen: boolean;
  defaultBranchSlug?: string;
  onClose: () => void;
}

const GOALS = [
  'بدنسازی تخصصی، هایپرتروفی و افزایش توان عضلانی',
  'فرم‌دهی پیشرفته، کاهش توده چربی و کاندیشنینگ متابولیک',
  'ریفورمر پیلاتس، اصلاح قامت و پیشگیری از آسیب',
  'هماهنگی بازدید اختصاصی، تور کلوب و مشاوره پلن عضویت',
];

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  isOpen,
  defaultBranchSlug = 'premium',
  onClose,
}) => {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [branchSlug, setBranchSlug] = useState(defaultBranchSlug);
  const [goal, setGoal] = useState(GOALS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') resetAndClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = fullName.trim();
    if (cleanName.length < 2) {
      setError('لطفاً نام و نام خانوادگی خود را کامل وارد فرمایید.');
      return;
    }

    if (!isValidIranianMobile(mobile)) {
      setError('شماره تلفن همراه نامعتبر است. نمونه صحیح: ۰۹۱۷۱۲۳۴۵۶۷');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/leads', {
        full_name: cleanName,
        mobile,
        branch_slug: branchSlug,
        goal,
      });
      setSuccessMsg(res.message || 'درخواست شما با موفقیت ثبت شد.');
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت درخواست.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setSuccessMsg(null);
    setError(null);
    setFullName('');
    setMobile('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consultation-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={resetAndClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#0B0B0D] border border-[#F2EFE9]/20 p-4 sm:p-8 text-[#F2EFE9] max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="بستن پنجره مشاوره"
          onClick={resetAndClose}
          className="absolute top-4 left-4 sm:top-5 sm:left-5 w-8 h-8 sm:w-9 sm:h-9 border border-[#F2EFE9]/15 flex items-center justify-center text-[#9A958C] hover:text-[#F2EFE9] hover:border-[#C9A96A] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-[#C9A96A] text-[11px] sm:text-xs font-bold mb-1.5 sm:mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>مشاوره اختصاصی عضویت و بازدید حضوری کلوب</span>
        </div>
        <h3 id="consultation-title" className="text-xl sm:text-2xl font-black text-[#F2EFE9] mb-1.5 sm:mb-2">
          رزرو ارزیابی و مشاوره عضویت در شیراز
        </h3>
        <p className="text-[11px] sm:text-xs text-[#9A958C] leading-relaxed mb-4 sm:mb-6">
          جهت تجربه فضای متمایز کلوب، آشنایی با تجهیزات بیومکانیکال و دریافت اطلاعات پکیج‌های عضویت سالانه و فصلی، اطلاعات تماس خود را ثبت نمایید تا مشاور ارشد کلوب با شما تماس حاصل فرماید.
        </p>

        {successMsg ? (
          <div className="py-6 sm:py-8 text-center border border-[#C9A96A]/30 bg-[#C9A96A]/5 p-4 sm:p-6">
            <CheckCircle2 className="w-9 h-9 sm:w-10 sm:h-10 text-[#C9A96A] mx-auto mb-2 sm:mb-3" />
            <h4 className="text-sm sm:text-base font-black text-[#F2EFE9] mb-1.5 sm:mb-2">
              درخواست شما ثبت گردید
            </h4>
            <p className="text-[11px] sm:text-xs text-[#9A958C] leading-relaxed mb-4 sm:mb-6">
              {successMsg}
            </p>
            <button
              type="button"
              onClick={resetAndClose}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-[#C9A96A] text-[#070708] text-xs font-black hover:bg-[#d8b97a] transition-colors cursor-pointer"
            >
              بازگشت به وب‌سایت
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {error && (
              <div className="p-2.5 sm:p-3 border border-red-500/40 bg-red-500/10 text-red-300 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-[#F2EFE9]/80 mb-1">
                نام و نام خانوادگی
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#9A958C] absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: سارا رضایی"
                  className="w-full bg-[#111114] border border-[#F2EFE9]/15 pr-10 pl-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#F2EFE9] focus:outline-none focus:border-[#C9A96A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-[#F2EFE9]/80 mb-1">
                شماره تلفن همراه
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#9A958C] absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  dir="ltr"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="0917..."
                  className="w-full bg-[#111114] border border-[#F2EFE9]/15 pr-10 pl-4 py-2.5 sm:py-3 text-xs sm:text-sm text-left font-mono text-[#F2EFE9] focus:outline-none focus:border-[#C9A96A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-[#F2EFE9]/80 mb-1">
                انتخاب شعبه در شیراز
              </label>
              <select
                value={branchSlug}
                onChange={(e) => setBranchSlug(e.target.value)}
                className="w-full bg-[#111114] border border-[#F2EFE9]/15 px-3 py-2.5 sm:py-3 text-xs font-bold text-[#F2EFE9] focus:outline-none focus:border-[#C9A96A]"
              >
                {SHIRAZ_BRANCHES.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name} — {b.district} ({b.genderLabel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-[#F2EFE9]/80 mb-1">
                هدف تمرینی یا درخواست
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-[#111114] border border-[#F2EFE9]/15 px-3 py-2.5 sm:py-3 text-xs font-bold text-[#F2EFE9] focus:outline-none focus:border-[#C9A96A]"
              >
                {GOALS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 bg-[#C9A96A] text-[#070708] text-xs font-black hover:bg-[#d8b97a] transition-colors cursor-pointer disabled:opacity-50 mt-1 sm:mt-2"
            >
              {loading ? 'در حال ثبت درخواست...' : 'ثبت درخواست مشاوره و تور اختصاصی کلوب'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
