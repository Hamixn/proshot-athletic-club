import React, { useState, useEffect } from 'react';
import { FeedbackItem } from '../../types/member';
import { api } from '../../lib/api';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { Spinner } from '../ui/Spinner';
import { SectionTitle } from '../ui/SectionTitle';
import { Star } from 'lucide-react';

interface StaffFeedbackManagerProps {
  branchId: number;
}

export const StaffFeedbackManager: React.FC<StaffFeedbackManagerProps> = ({ branchId }) => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'responded'>('all');

  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchFeedback();
  }, [branchId]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; feedback: FeedbackItem[] }>(
        `/admin/feedback?branch_id=${branchId}`
      );
      if (res.feedback) {
        setFeedbackList(res.feedback);
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'خطا در بارگذاری بازخوردها' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (id: number) => {
    if (!replyText.trim()) {
      setFeedbackMsg({ type: 'error', text: 'متن پاسخ نمی‌تواند خالی باشد.' });
      return;
    }

    setReplying(true);
    setFeedbackMsg(null);
    try {
      const res = await api.post<{ success: boolean; message: string; feedback: FeedbackItem }>(
        `/admin/feedback/${id}/reply`,
        { response: replyText }
      );

      if (res.success) {
        setFeedbackMsg({ type: 'success', text: 'پاسخ مدیریت ثبت شد.' });
        setActiveReplyId(null);
        setReplyText('');
        fetchFeedback();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'خطا در ثبت پاسخ' });
    } finally {
      setReplying(false);
    }
  };

  const filtered = feedbackList.filter((f) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return f.status === 'pending';
    if (statusFilter === 'responded') return f.status === 'responded';
    return true;
  });

  const categoryLabels: Record<string, string> = {
    facilities: 'تجهیزات و دستگاه‌ها',
    coaching: 'کادر مربیگری',
    cleanliness: 'نظافت و بهداشت',
    reception: 'پذیرش و پرسنل',
    general: 'پیشنهاد و عمومی',
  };

  return (
    <Card className="p-6 sm:p-8 space-y-6">
      <SectionTitle
        index="۰۵"
        eyebrow="EXECUTIVE FEEDBACK LEDGER"
        title="رسیدگی به مکاتبات و دیدگاه‌های اعضا"
        subtitle="بررسی مستقیم بازخوردها و ثبت پاسخ رسمی مدیریت"
      />

      {feedbackMsg && <Alert type={feedbackMsg.type}>{feedbackMsg.text}</Alert>}

      {/* Hairline Filter Bar */}
      <div className="flex items-center border-b border-[#EDE8DF]/10 text-xs">
        {[
          { key: 'all', label: `همه (${feedbackList.length})` },
          {
            key: 'pending',
            label: `در انتظار پاسخ (${feedbackList.filter((f) => f.status === 'pending').length})`,
          },
          {
            key: 'responded',
            label: `پاسخ داده شده (${feedbackList.filter((f) => f.status === 'responded').length})`,
          },
        ].map((tab) => {
          const active = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as any)}
              className={`py-3 px-4 font-bold transition-colors relative cursor-pointer ${
                active ? 'text-[#C9A96A]' : 'text-[#8A857B] hover:text-[#EDE8DF]'
              }`}
            >
              {tab.label}
              {active && (
                <span className="absolute bottom-0 right-0 left-0 h-[1.5px] bg-[#C9A96A]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="py-12 text-center space-y-2">
          <Spinner size="md" />
          <p className="text-xs text-[#8A857B]">در حال بارگذاری مکاتبات...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center border border-[#EDE8DF]/10 bg-[#0A0A0B]">
          <p className="text-xs text-[#8A857B]">موردی با این وضعیت یافت نشد.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#EDE8DF]/10 border-t border-b border-[#EDE8DF]/10">
          {filtered.map((item) => {
            const isResponded = item.status === 'responded';
            const isReplying = activeReplyId === item.id;

            return (
              <div key={item.id} className="py-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap text-xs mb-1">
                      <span className="font-bold text-[#EDE8DF]">
                        {item.member_name || `عضو #${item.member_id}`}
                      </span>
                      {item.member_mobile && (
                        <span className="text-[11px] text-[#8A857B] font-mono" dir="ltr">
                          {item.member_mobile}
                        </span>
                      )}
                      <span className="text-[#57534B]">•</span>
                      <span className="text-[11px] text-[#C9A96A] font-bold">
                        {categoryLabels[item.category] || item.category}
                      </span>
                      <span className="text-[#57534B]">•</span>
                      <span className="text-[11px] text-[#8A857B] font-mono">
                        {item.created_at_jalali || 'اخیر'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
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
                    </div>

                    <h5 className="text-sm sm:text-base font-black text-[#EDE8DF]">
                      {item.subject}
                    </h5>
                  </div>

                  <div className="shrink-0">
                    {isResponded ? (
                      <Badge variant="success">پاسخ داده شد</Badge>
                    ) : (
                      <Badge variant="warning">در انتظار پاسخ</Badge>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-[13px] text-[#EDE8DF]/85 leading-7">
                  {item.message}
                </p>

                {isResponded && item.staff_response && !isReplying && (
                  <div className="pr-4 border-r-2 border-[#C9A96A] space-y-1">
                    <span className="text-[11px] font-bold text-[#C9A96A] block">
                      پاسخ ثبت‌شده مدیریت:
                    </span>
                    <p className="text-xs text-[#EDE8DF]/90 leading-7">
                      {item.staff_response}
                    </p>
                  </div>
                )}

                {!isReplying ? (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant={isResponded ? 'outline' : 'primary'}
                      onClick={() => {
                        setActiveReplyId(item.id);
                        setReplyText(item.staff_response || '');
                      }}
                    >
                      {isResponded ? 'ویرایش پاسخ' : 'نگارش پاسخ مدیریت'}
                    </Button>
                  </div>
                ) : (
                  <div className="p-5 bg-[#0A0A0B] border border-[#C9A96A]/40 space-y-4">
                    <label className="text-[11px] font-bold text-[#C9A96A] block">
                      پاسخ رسمی مدیریت باشگاه پروشات:
                    </label>
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="متن پاسخ را وارد نمایید..."
                      className="w-full p-3 rounded-[2px] bg-[#111113] border border-[#EDE8DF]/15 focus:border-[#C9A96A] text-[#EDE8DF] text-xs outline-none resize-none leading-7"
                    />
                    <div className="flex items-center justify-end gap-2.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveReplyId(null);
                          setReplyText('');
                        }}
                      >
                        انصراف
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        loading={replying}
                        onClick={() => handleSendReply(item.id)}
                      >
                        ثبت و ارسال پاسخ
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
