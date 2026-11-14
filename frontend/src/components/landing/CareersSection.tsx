import React, { useState } from 'react';
import { Briefcase, User, Phone, CheckCircle2, AlertCircle, Building2, Award } from 'lucide-react';
import { SHIRAZ_BRANCHES } from '../../data/branches';
import { api } from '../../lib/api';
import { isValidIranianMobile } from '../../lib/phone';

const CAREER_ROLES = [
  'مربی فیتنس و بدنسازی تخصصی (آقایان / بانوان)',
  'مربی پیلاتس ریفورمر و مت کلاسیک',
  'کادر پذیرش، روابط عمومی و پذیرایی VIP',
  'نجات غریق، مربی شنا و آب‌درمانی',
  'سرپرست شیفت و مدیریت اجرایی سالن',
  'باریستا و پرسنل اسموتی‌بار و بوفه سلامت',
  'خدمات، بهداشت و تشریفات داخلی',
  'سایر تخصص‌های ورزشی و اداری',
];

export const CareersSection: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState(CAREER_ROLES[0]);
  const [branchSlug, setBranchSlug] = useState('all');
  const [workBackground, setWorkBackground] = useState('');
  const [certifications, setCertifications] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = fullName.trim();
    if (cleanName.length < 3) {
      setError('لطفاً نام و نام خانوادگی خود را کامل وارد نمایید.');
      return;
    }

    if (!isValidIranianMobile(mobile)) {
      setError('شماره تلفن همراه نامعتبر است. نمونه صحیح: ۰۹۱۲۳۴۵۶۷۸۹');
      return;
    }

    const cleanBackground = workBackground.trim();
    if (cleanBackground.length < 10) {
      setError('لطفاً خلاصه سوابق کاری، مجموعه‌ها یا باشگاه‌های قبلی خود را ذکر فرمایید.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/careers', {
        full_name: cleanName,
        mobile,
        role,
        branch_slug: branchSlug,
        work_background: cleanBackground,
        certifications: certifications.trim(),
      });
      setSuccess(true);
      setFullName('');
      setMobile('');
      setWorkBackground('');
      setCertifications('');
    } catch (err: any) {
      setError(err?.message || 'خطا در ثبت اطلاعات. لطفاً مجدداً تلاش فرمایید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="careers" className="relative py-16 sm:py-24 bg-[#0A0A0C] border-t border-[#F2EFE9]/10 scroll-mt-16 sm:scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141418] border border-[#C9A96A]/30 text-[#C9A96A] text-[11px] sm:text-xs font-bold mb-3">
            <Briefcase className="w-3.5 h-3.5" />
            <span>فرصت‌های شغلی و همکاری در شیراز</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#F2EFE9] mb-3 leading-tight">
            همکاری با کلوب‌های ورزشی پروشات
          </h2>
          <p className="text-xs sm:text-sm text-[#8A857B] leading-relaxed">
            اگر علاقه‌مند به فعالیت در محیطی حرفه‌ای، استاندارد و پویا در حوزه‌های مربیگری، پذیرش، تشریفات و خدمات هستید، فرم زیر را تکمیل فرمایید تا مدیریت منابع انسانی با شما تماس حاصل نماید.
          </p>
        </div>

        {/* Success Banner */}
        {success ? (
          <div className="p-6 sm:p-10 bg-[#0F120E] border border-[#4ADE80]/30 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[#4ADE80] mx-auto" />
            <h3 className="text-lg sm:text-xl font-bold text-[#F2EFE9]">
              درخواست همکاری شما با موفقیت ثبت شد
            </h3>
            <p className="text-xs sm:text-sm text-[#8A857B] max-w-md mx-auto leading-relaxed">
              رزومه و سوابق شما در بانک استعدادهای پروشات ثبت گردید. در صورت تطابق شرایط با نیاز شعب، همکاران ما با شما تماس خواهند گرفت.
            </p>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="mt-4 px-5 py-2 bg-[#17171C] border border-[#F2EFE9]/20 text-xs font-bold text-[#EDE8DF] hover:bg-[#202026] transition-colors cursor-pointer"
            >
              ثبت درخواست دیگر
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#0E0E12] border border-[#F2EFE9]/12 p-5 sm:p-9 space-y-6">
            {error && (
              <div className="p-3.5 bg-[#1F0E0E] border border-[#EF4444]/40 text-[#EF4444] text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-[#EDE8DF] mb-1.5">
                  نام و نام خانوادگی <span className="text-[#C9A96A]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8A857B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: رضا کریمی"
                    className="w-full bg-[#141418] border border-[#F2EFE9]/15 hover:border-[#F2EFE9]/30 pr-10 pl-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-[#F2EFE9] focus:outline-none focus:border-[#C9A96A] focus:ring-1 focus:ring-[#C9A96A]/50 transition-all rounded-[2px]"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-[#EDE8DF] mb-1.5">
                  شماره تلفن همراه <span className="text-[#C9A96A]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#8A857B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="09171234567"
                    className="w-full bg-[#141418] border border-[#F2EFE9]/15 hover:border-[#F2EFE9]/30 pr-10 pl-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-left font-mono text-[#F2EFE9] focus:outline-none focus:border-[#C9A96A] focus:ring-1 focus:ring-[#C9A96A]/50 transition-all rounded-[2px]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Position / Role */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-[#EDE8DF] mb-1.5">
                  عنوان شغلی / زمینه تخصص <span className="text-[#C9A96A]">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-[#8A857B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#141418] border border-[#F2EFE9]/15 hover:border-[#F2EFE9]/30 pr-10 pl-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-[#F2EFE9] focus:outline-none focus:border-[#C9A96A] focus:ring-1 focus:ring-[#C9A96A]/50 transition-all rounded-[2px] cursor-pointer"
                  >
                    {CAREER_ROLES.map((r) => (
                      <option key={r} value={r} className="bg-[#141418] text-[#F2EFE9]">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Branch Preference */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-[#EDE8DF] mb-1.5">
                  شعبه مورد نظر در شیراز
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#8A857B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={branchSlug}
                    onChange={(e) => setBranchSlug(e.target.value)}
                    className="w-full bg-[#141418] border border-[#F2EFE9]/15 hover:border-[#F2EFE9]/30 pr-10 pl-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-[#F2EFE9] focus:outline-none focus:border-[#C9A96A] focus:ring-1 focus:ring-[#C9A96A]/50 transition-all rounded-[2px] cursor-pointer"
                  >
                    <option value="all" className="bg-[#141418] text-[#F2EFE9]">تمام شعب پروشات (امکان فعالیت در هر شعبه)</option>
                    {SHIRAZ_BRANCHES.map((b) => (
                      <option key={b.slug} value={b.slug} className="bg-[#141418] text-[#F2EFE9]">
                        {b.name} — {b.district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Work Background */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] sm:text-xs font-bold text-[#EDE8DF]">
                  سوابق کاری و باشگاه‌های قبلی <span className="text-[#C9A96A]">*</span>
                </label>
                <span className={`text-[10px] font-mono ${workBackground.trim().length >= 10 ? 'text-[#4ADE80]' : 'text-[#8A857B]'}`}>
                  {workBackground.trim().length >= 10 ? '✓ تکمیل شد' : `${workBackground.trim().length}/۱۰ کاراکتر`}
                </span>
              </div>
              <textarea
                required
                rows={3}
                value={workBackground}
                onChange={(e) => setWorkBackground(e.target.value)}
                placeholder="لطفاً نام باشگاه‌ها، مراکز ورزشی، سمت شغلی و مدت زمان فعالیت قبلی خود را شرح دهید..."
                className="w-full bg-[#141418] border border-[#F2EFE9]/15 hover:border-[#F2EFE9]/30 p-3 text-xs sm:text-sm text-[#F2EFE9] focus:outline-none focus:border-[#C9A96A] focus:ring-1 focus:ring-[#C9A96A]/50 transition-all rounded-[2px] leading-relaxed"
              />
            </div>

            {/* Certifications and Details */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-[#EDE8DF] mb-1.5">
                مدارک مربیگری، مدارک تحصیلی و توضیحات تکمیلی
              </label>
              <textarea
                rows={2}
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                placeholder="مدارک فدراسیون، سرتیفیکیت‌های بین‌المللی، رشته تحصیلی، یا سایر نکات مرتبط..."
                className="w-full bg-[#141418] border border-[#F2EFE9]/15 hover:border-[#F2EFE9]/30 p-3 text-xs sm:text-sm text-[#F2EFE9] focus:outline-none focus:border-[#C9A96A] focus:ring-1 focus:ring-[#C9A96A]/50 transition-all rounded-[2px] leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 sm:py-4 bg-[#C9A96A] hover:bg-[#d8b97a] active:scale-[0.99] text-[#070708] text-xs sm:text-sm font-black transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 rounded-[2px] shadow-lg shadow-[#C9A96A]/10"
            >
              <Award className="w-4 h-4" />
              <span>{loading ? 'در حال ارسال اطلاعات...' : 'ارسال درخواست همکاری و رزومه'}</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
