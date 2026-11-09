import React, { useState } from 'react';
import { X, CheckCircle2, Phone, User, Sparkles } from 'lucide-react';
import { SHIRAZ_BRANCHES } from '../../data/branches';
import { api } from '../../lib/api';

interface ConsultationModalProps {
  isOpen: boolean;
  defaultBranchSlug?: string;
  onClose: () => void;
}

const GOALS = [
  'بدنسازی تخصصی و هایپرتروفی',
  'فیتنس، کاهش وزن و فرم‌دهی',
  'پیلاتس، اصلاحی و انعطاف‌پذیری',
  'بازدید حضوری از شعبه و استعلام شهریه',
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/leads', {
        full_name: fullName,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={resetAndClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#0B0B0D] border border-[#F2EFE9]/20 p-6 sm:p-8 text-[#F2EFE9]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={resetAndClose}
          className="absolute top-5 left-5 w-9 h-9 border border-[#F2EFE9]/15 flex items-center justify-center text-[#9A958C] hover:text-[#F2EFE9] hover:border-[#C9A96A] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-[#C9A96A] text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>مشاوره عضویت و هماهنگی بازدید حضوری</span>
        </div>
        <h3 className="text-2xl font-black text-[#F2EFE9] mb-2">
          درخواست عضویت در شعب شیراز
        </h3>
        <p className="text-xs text-[#9A958C] leading-relaxed mb-6">
          شعبه مورد نظر خود در شیراز را انتخاب نمایید تا کارشناسان پذیرش جهت هماهنگی بازدید و اعلام تعرفه‌های عضویت با شما تماس بگیرند.
        </p>

        {successMsg ? (
          <div className="py-8 text-center border border-[#C9A96A]/30 bg-[#C9A96A]/5 p-6">
            <CheckCircle2 className="w-10 h-10 text-[#C9A96A] mx-auto mb-3" />
            <h4 className="text-base font-black text-[#F2EFE9] mb-2">
              درخواست شما ثبت گردید
            </h4>
            <p className="text-xs text-[#9A958C] leading-relaxed mb-6">
              {successMsg}
            </p>
            <button
              type="button"
              onClick={resetAndClose}
              className="px-6 py-3 bg-[#C9A96A] text-[#070708] text-xs font-black hover:bg-[#d8b97a] transition-colors cursor-pointer"
            >
              بازگشت به وب‌سایت
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 border border-red-500/40 bg-red-500/10 text-red-300 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#F2EFE9]/80 mb-1.5">
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
                  className="w-full bg-[#111114] border border-[#F2EFE9]/15 pr-10 pl-4 py-3 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#C9A96A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F2EFE9]/80 mb-1.5">
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
                  className="w-full bg-[#111114] border border-[#F2EFE9]/15 pr-10 pl-4 py-3 text-sm text-left font-mono text-[#F2EFE9] focus:outline-none focus:border-[#C9A96A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F2EFE9]/80 mb-1.5">
                انتخاب شعبه در شیراز
              </label>
              <select
                value={branchSlug}
                onChange={(e) => setBranchSlug(e.target.value)}
                className="w-full bg-[#111114] border border-[#F2EFE9]/15 px-3.5 py-3 text-xs font-bold text-[#F2EFE9] focus:outline-none focus:border-[#C9A96A]"
              >
                {SHIRAZ_BRANCHES.map((b) => (
                  <option key={b.slug} value={b.slug}>
                    {b.name} — {b.district} ({b.genderLabel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#F2EFE9]/80 mb-1.5">
                هدف تمرینی یا درخواست
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-[#111114] border border-[#F2EFE9]/15 px-3.5 py-3 text-xs font-bold text-[#F2EFE9] focus:outline-none focus:border-[#C9A96A]"
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
              className="w-full py-3.5 bg-[#C9A96A] text-[#070708] text-xs font-black hover:bg-[#d8b97a] transition-colors cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? 'در حال ثبت درخواست...' : 'ثبت درخواست مشاوره و بازدید'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
