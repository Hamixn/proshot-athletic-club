import React, { useState, useEffect } from 'react';
import { Member, MemberPlan } from '../../types/member';
import { api } from '../../lib/api';
import { getCurrentJalaliMonthName } from '../../lib/jalali';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { Spinner } from '../ui/Spinner';
import { SectionTitle } from '../ui/SectionTitle';

interface StaffPlanManagerProps {
  branchId: number;
}

export const StaffPlanManager: React.FC<StaffPlanManagerProps> = ({ branchId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [memberPlans, setMemberPlans] = useState<MemberPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // New plan form states
  const [showForm, setShowForm] = useState(false);
  const [planType, setPlanType] = useState<'workout' | 'diet' | 'both'>('workout');
  const [title, setTitle] = useState('');
  const [validMonth, setValidMonth] = useState(() => getCurrentJalaliMonthName());
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setSearching(true);
      const timer = setTimeout(() => {
        api.post<{ success: boolean; members: Member[] }>('/checkin/search', {
          query: searchQuery,
          branch_id: branchId,
        })
          .then((res) => setMembers(res.members || []))
          .catch(() => {})
          .finally(() => setSearching(false));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setMembers([]);
    }
  }, [searchQuery, branchId]);

  useEffect(() => {
    if (selectedMember) {
      loadMemberPlans(selectedMember.id);
    } else {
      setMemberPlans([]);
    }
  }, [selectedMember]);

  const loadMemberPlans = async (memberId: number) => {
    setLoadingPlans(true);
    try {
      const res = await api.get<{ success: boolean; plans: MemberPlan[] }>(`/staff/plans?member_id=${memberId}`);
      setMemberPlans(res.plans || []);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'خطا در بارگذاری برنامه‌ها' });
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    if (!title.trim()) {
      setFeedbackMsg({ type: 'error', text: 'عنوان برنامه الزامی است.' });
      return;
    }

    setSubmitting(true);
    setFeedbackMsg(null);
    try {
      const res = await api.post<{ success: boolean; message: string; plan: MemberPlan }>('/staff/plans', {
        member_id: selectedMember.id,
        branch_id: branchId,
        plan_type: planType,
        title,
        valid_month: validMonth,
        content,
        file_name: fileName || (fileUrl ? 'Program-Attachment.pdf' : null),
        file_url: fileUrl,
        file_size: fileUrl ? '1.5 MB' : null,
      });

      if (res.success) {
        setFeedbackMsg({ type: 'success', text: 'برنامه ماهانه در پرونده ورزشی عضو ثبت شد.' });
        setTitle('');
        setContent('');
        setFileUrl('');
        setFileName('');
        setShowForm(false);
        loadMemberPlans(selectedMember.id);
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'خطا در ثبت برنامه' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = async (planId: number) => {
    if (!confirm('آیا از حذف این برنامه اطمینان دارید؟')) return;
    try {
      await api.delete(`/staff/plans/${planId}`);
      setFeedbackMsg({ type: 'success', text: 'برنامه حذف شد.' });
      if (selectedMember) {
        loadMemberPlans(selectedMember.id);
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'خطا در حذف برنامه' });
    }
  };

  return (
    <Card className="p-6 sm:p-8 space-y-6">
      <SectionTitle
        index="۰۴"
        eyebrow="COACHING PRESCRIPTION DESK"
        title="تدوین و بارگذاری برنامه تمرینی و تغذیه"
        subtitle="ثبت مستقیم برنامه ماهانه در پرونده دیجیتال اعضا"
      />

      {feedbackMsg && <Alert type={feedbackMsg.type}>{feedbackMsg.text}</Alert>}

      {/* Step 1: Member Selection */}
      <div className="space-y-3">
        {!selectedMember ? (
          <div className="relative">
            <Input
              label="۱. جستجو و انتخاب عضو باشگاه"
              placeholder="نام، نام خانوادگی یا شماره موبایل عضو را بنویسید (مثال: محمدی)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searching && (
              <div className="absolute left-2 bottom-3">
                <Spinner size="sm" />
              </div>
            )}

            {members.length > 0 && (
              <div className="mt-2 bg-[#0A0A0B] border border-[#EDE8DF]/15 divide-y divide-[#EDE8DF]/10 max-h-52 overflow-y-auto">
                {members.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMember(m);
                      setSearchQuery(m.full_name);
                      setMembers([]);
                    }}
                    className="px-4 py-3 hover:bg-[#C9A96A]/10 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="text-xs font-bold text-[#EDE8DF] block">{m.full_name}</span>
                      <span className="text-[11px] text-[#8A857B] font-mono" dir="ltr">
                        {m.mobile}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#C9A96A] font-bold">
                      انتخاب پرونده ←
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-[#0A0A0B] border border-[#C9A96A]/40 flex items-center justify-between gap-4">
            <div>
              <span className="eyebrow-latin text-[#C9A96A] block mb-0.5">SELECTED MEMBER</span>
              <span className="text-sm font-black text-[#EDE8DF] block">
                {selectedMember.full_name}
              </span>
              <span className="text-xs text-[#8A857B] font-mono" dir="ltr">
                {selectedMember.mobile}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedMember(null);
                setSearchQuery('');
              }}
              className="text-xs text-[#C9A96A] hover:underline font-bold cursor-pointer"
            >
              تغییر عضو
            </button>
          </div>
        )}
      </div>

      {/* Step 2: Member Plans & Form */}
      {selectedMember && (
        <div className="space-y-6 pt-4 border-t border-[#EDE8DF]/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-black text-[#EDE8DF]">
                پرونده‌های ثبت‌شده برای {selectedMember.full_name} ({memberPlans.length})
              </h4>
            </div>
            <Button
              size="sm"
              variant={showForm ? 'outline' : 'primary'}
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'بستن فرم ثبت' : '+ ثبت برنامه جدید'}
            </Button>
          </div>

          {showForm && (
            <form
              onSubmit={handleCreatePlan}
              className="p-6 bg-[#0A0A0B] border border-[#C9A96A]/35 space-y-5"
            >
              <div className="pb-3 border-b border-[#EDE8DF]/10">
                <span className="eyebrow-latin text-[#C9A96A] block mb-0.5">
                  NEW MONTHLY PRESCRIPTION
                </span>
                <h5 className="text-sm font-black text-[#EDE8DF]">
                  مشخصات برنامه ماهانه تمرینی / تغذیه
                </h5>
              </div>

              {/* Type Selector */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'workout', label: 'برنامه تمرینی' },
                  { key: 'diet', label: 'رژیم تغذیه' },
                  { key: 'both', label: 'ترکیبی (تمرین و تغذیه)' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setPlanType(item.key as any)}
                    className={`py-2 px-3 rounded-[2px] text-xs font-bold border transition-colors cursor-pointer ${
                      planType === item.key
                        ? 'bg-[#C9A96A] border-[#C9A96A] text-[#0A0A0B]'
                        : 'bg-transparent border-[#EDE8DF]/15 text-[#8A857B] hover:text-[#EDE8DF]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="عنوان برنامه"
                  placeholder="مثال: برنامه هایپرتروفی عضلانی — فاز ۱"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <Input
                  label="ماه اعتبار"
                  placeholder="مثال: آبان ۱۴۰۵"
                  value={validMonth}
                  onChange={(e) => setValidMonth(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#8A857B] block">
                  شرح حرکات، ست‌ها و تکرارها یا وعده‌های غذایی
                </label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="روز اول:&#10;- پرس سینه هالتر: ۴ ست ۱۰ تکرار..."
                  className="w-full p-3.5 rounded-[2px] bg-[#111113] border border-[#EDE8DF]/15 focus:border-[#C9A96A] text-[#EDE8DF] text-xs placeholder:text-[#57534B] outline-none transition-colors resize-none leading-7"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="نام فایل ضمیمه (اختیاری)"
                  placeholder="Proshot-Phase1.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  dir="ltr"
                />
                <Input
                  label="لینک مستقیم فایل PDF (اختیاری)"
                  placeholder="https://.../uploads/plan.pdf"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  dir="ltr"
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" loading={submitting}>
                  ذخیره و انتشار در پرونده عضو
                </Button>
              </div>
            </form>
          )}

          {loadingPlans ? (
            <div className="py-10 text-center space-y-2">
              <Spinner size="md" />
              <p className="text-xs text-[#8A857B]">در حال بارگذاری برنامه‌ها...</p>
            </div>
          ) : memberPlans.length === 0 ? (
            <div className="p-8 text-center border border-[#EDE8DF]/10 bg-[#0A0A0B]">
              <p className="text-xs text-[#8A857B]">
                تاکنون برنامه‌ای برای این عضو ثبت نشده است.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#EDE8DF]/10 border-t border-b border-[#EDE8DF]/10">
              {memberPlans.map((p, idx) => (
                <div
                  key={p.id}
                  className="py-4 px-2 flex items-center justify-between gap-4"
                >
                  <div className="flex items-baseline gap-4 min-w-0">
                    <span className="font-editorial italic text-base text-[#C9A96A]" dir="ltr">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[#EDE8DF]">
                          {p.title}
                        </span>
                        <span className="text-[11px] text-[#C9A96A]">
                          ({p.valid_month})
                        </span>
                      </div>
                      <span className="text-[11px] text-[#8A857B] block mt-0.5">
                        ثبت: {p.created_at_jalali || 'اخیر'}
                        {p.file_name && ` — فایل: ${p.file_name}`}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeletePlan(p.id)}
                    className="text-xs text-[#DF8A8A] hover:underline font-bold shrink-0 cursor-pointer"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
