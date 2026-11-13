import React, { useState, useEffect } from 'react';
import { FeedbackItem } from '../../types/member';
import { api } from '../../lib/api';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { Spinner } from '../ui/Spinner';
import { SectionTitle } from '../ui/SectionTitle';
import { Star, X } from 'lucide-react';

export const MemberFeedback: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [category, setCategory] = useState<'facilities' | 'coaching' | 'cleanliness' | 'reception' | 'general'>('general');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; feedback: FeedbackItem[] }>('/me/feedback');
      if (res.feedback) {
        setFeedbackList(res.feedback);
      }
    } catch (err) {
      console.error('Failed to load feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!subject.trim()) {
      setErrorMsg('لطفاً عنوان پیام خود را وارد نمایید.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('لطفاً متن بازخورد یا پیشنهاد خود را بنویسید.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post<{ success: boolean; message: string; feedback: FeedbackItem }>('/me/feedback', {
        category,
        rating,
        subject,
        message,
      });

      if (res.success) {
        setSuccessMsg(res.message || 'دیدگاه شما ثبت شد و توسط مدیریت بررسی می‌گردد.');
        setSubject('');
        setMessage('');
        setShowForm(false);
        fetchFeedback();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ارسال پیام.');
    } finally {
      setSubmitting(false);
    }
  };

  const categoryLabels: Record<string, string> = {
    facilities: 'تجهیزات و دستگاه‌ها',
    coaching: 'کادر مربیگری',
    cleanliness: 'نظافت و بهداشت',
    reception: 'پذیرش و پرسنل',
    general: 'پیشنهاد و عمومی',
  };

  return (
    <div className="space-y-6 animate-editorial">
      <SectionTitle
        index="۰۲"
        eyebrow="MEMBER CORRESPONDENCE"
        title="ارتباط مستقیم با مدیریت"
        subtitle="دیدگاه‌ها و پیشنهادهای شما بدون واسطه توسط مدیریت باشگاه بررسی می‌شود"
        action={
          !showForm ? (
            <Button
              onClick={() => setShowForm(true)}
              variant="primary"
              size="sm"
            >
              ثبت دیدگاه جدید
            </Button>
          ) : undefined
        }
      />

      {successMsg && <Alert type="success">{successMsg}</Alert>}

      {/* Editorial Correspondence Form */}
      {showForm && (
        <Card variant="gold" className="p-6 space-y-6">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#EDE8DF]/10">
            <div>
              <span className="eyebrow-latin block mb-0.5 text-[#C9A96A]">NEW DISPATCH</span>
              <h4 className="text-sm font-black text-[#EDE8DF]">
                نگارش پیام به مدیریت باشگاه
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="w-7 h-7 flex items-center justify-center text-[#8A857B] hover:text-[#EDE8DF] cursor-pointer"
              title="بستن فرم"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {errorMsg && <Alert type="error">{errorMsg}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#8A857B] block">
                ارزیابی شما از کیفیت خدمات
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      aria-label={`${star} ستاره از ۵`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${
                          active
                            ? 'fill-[#C9A96A] text-[#C9A96A]'
                            : 'text-[#57534B]'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-xs font-medium text-[#C9A96A] mr-2">
                  {rating === 5
                    ? 'عالی'
                    : rating === 4
                    ? 'بسیار خوب'
                    : rating === 3
                    ? 'متوسط'
                    : rating === 2
                    ? 'نیازمند بهبود'
                    : 'ضعیف'}
                </span>
              </div>
            </div>

            {/* Category Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#8A857B] block">
                بخش مربوطه
              </label>
              <div className="flex flex-wrap gap-2">
                {(['facilities', 'coaching', 'cleanliness', 'reception', 'general'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-1.5 px-3 rounded-[2px] text-xs font-bold border transition-colors cursor-pointer ${
                      category === cat
                        ? 'bg-[#C9A96A] border-[#C9A96A] text-[#0A0A0B]'
                        : 'bg-transparent border-[#EDE8DF]/15 text-[#8A857B] hover:text-[#EDE8DF]'
                    }`}
                  >
                    {categoryLabels[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <Input
              label="عنوان موضوع"
              placeholder="مثال: کیفیت دستگاه‌های بخش وزنه آزاد"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />

            {/* Message */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#8A857B] block">
                مشروح دیدگاه یا پیشنهاد
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="متن پیام خود را بنویسید..."
                className="w-full p-3.5 rounded-[2px] bg-[#0A0A0B] border border-[#EDE8DF]/15 focus:border-[#C9A96A] text-[#EDE8DF] text-xs placeholder:text-[#57534B] outline-none transition-colors resize-none leading-relaxed"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                انصراف
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
              >
                ثبت و ارسال به مدیریت
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Correspondence Archive */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#8A857B]">
          <span>سوابق مکاتبات شما ({feedbackList.length})</span>
          <span className="eyebrow-latin">ARCHIVE</span>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-2">
            <Spinner size="md" />
            <p className="text-xs text-[#8A857B]">در حال بارگذاری سوابق...</p>
          </div>
        ) : feedbackList.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-xs text-[#8A857B]">تاکنون دیدگاهی ثبت نکرده‌اید.</p>
          </Card>
        ) : (
          <div className="divide-y divide-[#EDE8DF]/10 border-t border-b border-[#EDE8DF]/10 bg-[#111113]">
            {feedbackList.map((item) => {
              const isResponded = item.status === 'responded';

              return (
                <article key={item.id} className="p-6 space-y-4">
                  {/* Top Row: Subject & Non-Squished Status Badge */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap text-[11px] text-[#8A857B] mb-1.5">
                        <span className="text-[#C9A96A] font-bold">
                          {categoryLabels[item.category] || item.category}
                        </span>
                        <span>•</span>
                        <span className="font-mono">{item.created_at_jalali || 'اخیر'}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                item.rating >= s
                                  ? 'fill-[#C9A96A] text-[#C9A96A]'
                                  : 'text-[#57534B]'
                              }`}
                            />
                          ))}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-[#EDE8DF] leading-snug">
                        {item.subject}
                      </h4>
                    </div>

                    <div className="shrink-0">
                      {isResponded ? (
                        <Badge variant="success">پاسخ داده شد</Badge>
                      ) : (
                        <Badge variant="warning">در انتظار بررسی</Badge>
                      )}
                    </div>
                  </div>

                  {/* Direct Letter Text (No Nested Inner Box) */}
                  <p className="text-xs sm:text-[13px] text-[#EDE8DF]/85 leading-7">
                    {item.message}
                  </p>

                  {/* Management Response with Brass Vertical Hairline */}
                  {isResponded && item.staff_response && (
                    <div className="pt-3 mt-3 border-t border-[#EDE8DF]/[0.07]">
                      <div className="pr-4 border-r-2 border-[#C9A96A] space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#C9A96A]">
                            پاسخ مدیریت باشگاه پروشات
                          </span>
                          <span className="text-[#8A857B] font-mono">
                            {item.responded_at_jalali || ''}
                          </span>
                        </div>
                        <p className="text-xs sm:text-[13px] text-[#EDE8DF]/90 leading-7">
                          {item.staff_response}
                        </p>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
