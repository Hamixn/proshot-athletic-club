import React, { useState, useEffect } from 'react';
import { MemberPlan } from '../../types/member';
import { api } from '../../lib/api';
import { Card } from '../ui/Card';
import { Spinner } from '../ui/Spinner';
import { resolveAssetPath } from '../ui/BrandLogo';
import { ChevronDown, ChevronUp, ArrowUpLeft } from 'lucide-react';

export const MemberPlans: React.FC = () => {
  const [plans, setPlans] = useState<MemberPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'workout' | 'diet'>('all');
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; plans: MemberPlan[] }>('/me/plans');
      if (res.plans) {
        setPlans(res.plans);
        if (res.plans.length > 0) {
          setExpandedPlanId(res.plans[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load member plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter((p) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'workout') return p.plan_type === 'workout' || p.plan_type === 'both';
    if (activeFilter === 'diet') return p.plan_type === 'diet' || p.plan_type === 'both';
    return true;
  });

  const toggleExpand = (id: number) => {
    setExpandedPlanId(expandedPlanId === id ? null : id);
  };

  const typeLabel = (t: MemberPlan['plan_type']) => {
    if (t === 'workout') return 'برنامه تمرینی';
    if (t === 'diet') return 'رژیم تغذیه';
    return 'برنامه جامع تمرین و تغذیه';
  };

  return (
    <div className="space-y-6 animate-editorial">
      {/* Still-Life Banner */}
      <div className="relative h-40 rounded-[3px] overflow-hidden border border-[#EDE8DF]/12 bg-[#111113]">
        <img
          src={resolveAssetPath('img/plans-banner.jpg')}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to left, rgba(10,10,11,0.92) 25%, rgba(10,10,11,0.55) 100%)',
          }}
        />
        <div className="relative z-10 h-full p-6 flex flex-col justify-end">
          <h2 className="text-xl sm:text-2xl font-black text-[#EDE8DF]">
            برنامه‌های ماهانه تمرین و تغذیه
          </h2>
          <p className="text-xs text-[#8A857B] mt-1 leading-relaxed">
            برنامه‌های اختصاصی ثبت‌شده توسط مربی شما در باشگاه پروشات
          </p>
        </div>
      </div>

      {/* Hairline Filter Bar */}
      <div className="flex items-center border-b border-[#EDE8DF]/10 text-xs">
        {[
          { key: 'all', label: `همه (${plans.length})` },
          { key: 'workout', label: 'برنامه تمرینی' },
          { key: 'diet', label: 'رژیم تغذیه' },
        ].map((tab) => {
          const active = activeFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key as any)}
              className={`py-3 px-4 font-bold transition-colors relative cursor-pointer ${
                active ? 'text-[#C9A96A]' : 'text-[#8A857B] hover:text-[#EDE8DF]'
              }`}
            >
              {tab.label}
              {active && (
                <span className="absolute bottom-0 right-0 left-0 h-[2px] bg-[#C9A96A]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Dossier List */}
      {loading ? (
        <div className="py-14 text-center space-y-3">
          <Spinner size="md" />
          <p className="text-xs text-[#8A857B]">در حال دریافت برنامه‌ها...</p>
        </div>
      ) : filteredPlans.length === 0 ? (
        <Card className="p-10 text-center space-y-2">
          <p className="text-sm font-bold text-[#EDE8DF]">
            هنوز برنامه‌ای در این بخش ثبت نشده است.
          </p>
          <p className="text-xs text-[#8A857B] max-w-xs mx-auto leading-relaxed">
            پس از تنظیم برنامه توسط مربی شعبه، جزئیات تمرین و رژیم غذایی در این صفحه قابل مشاهده و دانلود خواهد بود.
          </p>
        </Card>
      ) : (
        <div className="divide-y divide-[#EDE8DF]/10 border-t border-b border-[#EDE8DF]/10 bg-[#111113]">
          {filteredPlans.map((plan) => {
            const isExpanded = expandedPlanId === plan.id;

            return (
              <div key={plan.id} className="transition-colors">
                <div
                  onClick={() => toggleExpand(plan.id)}
                  className="p-5 sm:p-6 flex items-start justify-between gap-4 cursor-pointer select-none hover:bg-[#EDE8DF]/[0.02]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap mb-1">
                      <span className="text-[11px] font-bold text-[#C9A96A]">
                        {typeLabel(plan.plan_type)}
                      </span>
                      <span className="text-[#57534B]">•</span>
                      <span className="text-[11px] text-[#8A857B]">
                        دوره: {plan.valid_month}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-[#EDE8DF] leading-snug">
                      {plan.title}
                    </h4>

                    <p className="text-[11px] text-[#8A857B] mt-1">
                      تاریخ ثبت: {plan.created_at_jalali || 'اخیر'}
                      {plan.file_name && ` — ضمیمه: ${plan.file_name}`}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="w-7 h-7 flex items-center justify-center text-[#8A857B] hover:text-[#EDE8DF] shrink-0 mt-1"
                    aria-label="نمایش جزئیات برنامه"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#C9A96A]" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-[#EDE8DF]/[0.06] space-y-5 bg-[#0D0D0F]">
                    {plan.content && (
                      <div className="text-xs sm:text-[13px] text-[#EDE8DF]/90 leading-7 whitespace-pre-wrap pr-4 border-r border-[#C9A96A]/45">
                        {plan.content}
                      </div>
                    )}

                    {plan.file_url && (
                      <div className="flex items-center justify-end pt-2 border-t border-[#EDE8DF]/[0.06]">
                        <a
                          href={plan.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C9A96A] hover:text-[#DFC690] border-b border-[#C9A96A] pb-0.5 transition-colors"
                        >
                          <span>دانلود فایل PDF برنامه ({plan.file_size || 'PDF'})</span>
                          <ArrowUpLeft className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
