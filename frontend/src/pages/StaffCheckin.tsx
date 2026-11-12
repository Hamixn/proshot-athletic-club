import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Branch } from '../types/branch';
import { Header } from '../components/layout/Header';
import { CheckinScanner } from '../components/staff/CheckinScanner';
import { MemberLookup } from '../components/staff/MemberLookup';
import { CheckinResult } from '../components/staff/CheckinResult';
import { OverrideForm } from '../components/staff/OverrideForm';
import { StaffPlanManager } from '../components/staff/StaffPlanManager';
import { StaffFeedbackManager } from '../components/staff/StaffFeedbackManager';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { isPremiumBranch } from '../components/ui/BrandLogo';

interface StaffCheckinProps {
  onBackToSite?: () => void;
}

export const StaffCheckin: React.FC<StaffCheckinProps> = ({ onBackToSite }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'scanner' | 'lookup' | 'today' | 'plans' | 'feedback'>('scanner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [showOverride, setShowOverride] = useState(false);
  const [todayRecords, setTodayRecords] = useState<any[]>([]);

  useEffect(() => {
    api.get('/branches')
      .then((res) => {
        const allowedIds = window.proshotMC?.branches || [];
        const all: Branch[] = res.branches || [];
        const filtered = allowedIds.length > 0
          ? all.filter((b) => allowedIds.includes(b.id))
          : all;

        setBranches(filtered);
        if (filtered.length > 0) {
          setSelectedBranchId(filtered[0].id);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleScan = async (token: string) => {
    if (!selectedBranchId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/checkin/scan', {
        token,
        branch_id: selectedBranchId,
      });
      setResult(res.data);
    } catch (err: any) {
      if (err.data) {
        setResult(err.data);
      } else {
        setError(err.message || 'خطا در اعتبارسنجی بارکد');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckin = async (memberId: number) => {
    if (!selectedBranchId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/checkin/member', {
        member_id: memberId,
        branch_id: selectedBranchId,
      });
      setResult(res.data);
    } catch (err: any) {
      if (err.data) {
        setResult(err.data);
      } else {
        setError(err.message || 'خطا در ثبت ورود');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideConfirm = async (reason: string) => {
    if (!selectedBranchId || !result?.member?.id) return;
    setLoading(true);
    try {
      const res = await api.post('/checkin/override', {
        member_id: result.member.id,
        branch_id: selectedBranchId,
        reason,
      });
      setResult(res.data);
      setShowOverride(false);
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت ورود دستی');
    } finally {
      setLoading(false);
    }
  };

  const fetchToday = async () => {
    if (!selectedBranchId) return;
    try {
      const res = await api.get(`/checkin/today?branch_id=${selectedBranchId}`);
      setTodayRecords(res.records || []);
    } catch {}
  };

  useEffect(() => {
    if (activeTab === 'today') {
      fetchToday();
    }
  }, [activeTab, selectedBranchId]);

  const currentBranch = branches.find((b) => b.id === selectedBranchId);
  const isPremium = isPremiumBranch(currentBranch?.slug, currentBranch?.name);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#EDE8DF] pb-20">
      <Header
        subtitle="کنسول پذیرش، برنامه‌ها و کنترل تردد"
        branchSlug={currentBranch?.slug}
        branchName={currentBranch?.name}
        onBackToSite={onBackToSite}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-5 py-5 sm:py-7 space-y-5 sm:space-y-6">
        {/* Clean Architectural Branch Selector Bar */}
        <div className="p-4 sm:p-6 rounded-[3px] border border-[#EDE8DF]/12 bg-[#111113] flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div>
            <span
              className="text-[11px] font-bold block mb-1"
              style={{ color: isPremium ? '#C9A96A' : '#B9BCC2' }}
            >
              {isPremium ? 'واحد پذیرش شعبه پریمیوم — شیراز' : 'واحد پذیرش شعب پروشات — شیراز'}
            </span>
            <h2 className="text-xl font-black text-[#EDE8DF]">
              {currentBranch?.name || 'واحد پذیرش باشگاه پروشات'}
            </h2>
          </div>

          {branches.length > 0 && (
            <div className="flex items-center gap-3">
              <label htmlFor="staff-branch-select" className="text-xs text-[#8A857B]">
                شعبه فعال:
              </label>
              <select
                id="staff-branch-select"
                className="bg-[#0A0A0B] border border-[#EDE8DF]/20 rounded-[2px] px-3.5 py-2 text-xs font-bold text-[#EDE8DF] focus:outline-none focus:border-[#C9A96A] cursor-pointer"
                value={selectedBranchId || ''}
                onChange={(e) => setSelectedBranchId(Number(e.target.value))}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {error && <Alert type="error">{error}</Alert>}

        {result ? (
          showOverride ? (
            <OverrideForm
              memberId={result.member?.id}
              branchId={selectedBranchId!}
              onConfirm={handleOverrideConfirm}
              onCancel={() => setShowOverride(false)}
              loading={loading}
            />
          ) : (
            <CheckinResult
              data={result}
              onReset={() => {
                setResult(null);
                setShowOverride(false);
              }}
              onOverride={() => setShowOverride(true)}
              canOverride={result.result !== 'approved'}
            />
          )
        ) : (
          <div className="space-y-6">
            <nav
              aria-label="بخش‌های پنل پذیرش"
              className="grid grid-cols-2 sm:grid-cols-5 border-b border-[#EDE8DF]/12"
            >
              {[
                { id: 'scanner', label: 'اسکن بارکد' },
                { id: 'lookup', label: 'جستجوی عضو' },
                { id: 'today', label: 'حاضرین امروز' },
                { id: 'plans', label: 'ثبت برنامه' },
                { id: 'feedback', label: 'نظرات اعضا' },
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3.5 px-2 text-center transition-colors relative cursor-pointer ${
                      active ? 'text-[#EDE8DF]' : 'text-[#8A857B] hover:text-[#EDE8DF]'
                    }`}
                  >
                    <span className="text-xs font-extrabold">{tab.label}</span>
                    {active && (
                      <span className="absolute bottom-0 right-0 left-0 h-[2px] bg-[#C9A96A]" />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="animate-editorial">
              {activeTab === 'scanner' && (
                <CheckinScanner onScan={handleScan} loading={loading} />
              )}

              {activeTab === 'lookup' && (
                <MemberLookup
                  branchId={selectedBranchId || 1}
                  onSelectMember={handleManualCheckin}
                  loading={loading}
                />
              )}

              {activeTab === 'today' && (
                <Card>
                  <CardHeader
                    title="فهرست مراجعین امروز شعبه"
                    subtitle={`مجموع ورود ثبت‌شده امروز: ${todayRecords.length} نفر`}
                  />
                  <CardContent className="p-0 divide-y divide-[#EDE8DF]/10">
                    {todayRecords.length === 0 ? (
                      <div className="p-10 text-center text-xs text-[#8A857B]">
                        هنوز ترددی برای این شعبه در تاریخ امروز ثبت نشده است.
                      </div>
                    ) : (
                      todayRecords.map((r) => (
                        <div
                          key={r.id}
                          className="px-6 py-4 flex items-center justify-between text-xs hover:bg-[#EDE8DF]/[0.02] transition-colors"
                        >
                          <div>
                            <span className="font-bold text-[#EDE8DF] block text-sm">
                              {r.member?.full_name || `عضو #${r.member_id}`}
                            </span>
                            <span className="text-[#8A857B] font-mono text-[11px] block mt-0.5" dir="ltr">
                              {r.member?.mobile}
                            </span>
                          </div>

                          <div className="text-left font-mono font-bold text-[#C9A96A] text-sm">
                            {r.time}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'plans' && (
                <StaffPlanManager branchId={selectedBranchId || 1} />
              )}

              {activeTab === 'feedback' && (
                <StaffFeedbackManager branchId={selectedBranchId || 1} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
