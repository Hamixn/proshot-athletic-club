import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMembership } from '../hooks/useMembership';
import { api } from '../lib/api';
import { Member } from '../types/member';
import { Header } from '../components/layout/Header';
import { LoginForm } from '../components/auth/LoginForm';
import { OtpForm } from '../components/auth/OtpForm';
import { MembershipCard } from '../components/member/MembershipCard';
import { QrCard } from '../components/member/QrCard';
import { MembershipStatus } from '../components/member/MembershipStatus';
import { AttendanceHistory } from '../components/member/AttendanceHistory';
import { MemberPlans } from '../components/member/MemberPlans';
import { MemberFeedback } from '../components/member/MemberFeedback';
import { BrandLogo, isPremiumBranch, resolveAssetPath } from '../components/ui/BrandLogo';
import { Spinner } from '../components/ui/Spinner';

interface MemberPortalProps {
  onBackToSite?: () => void;
}

export const MemberPortal: React.FC<MemberPortalProps> = ({ onBackToSite }) => {
  const { isLoggedIn, requestOtp, verifyOtp, logout, loading: authLoading, error: authError } = useAuth();
  const { membership, hasActive, loading: membershipLoading } = useMembership();

  const [currentPhone, setCurrentPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [member, setMember] = useState<Member | null>(null);
  const [portalTab, setPortalTab] = useState<'pass' | 'plans' | 'feedback'>('pass');

  useEffect(() => {
    if (isLoggedIn) {
      api.get('/me')
        .then((res) => {
          if (res.member) setMember(res.member);
        })
        .catch(() => {});
    }
  }, [isLoggedIn]);

  const handlePhoneSubmit = async (phone: string) => {
    setCurrentPhone(phone);
    await requestOtp(phone);
    setStep('otp');
  };

  const handleOtpVerify = async (code: string) => {
    const res = await verifyOtp(currentPhone, code);
    if (res.member) {
      setMember(res.member);
    }
  };

  const handleResendOtp = async () => {
    await requestOtp(currentPhone);
  };

  const activeBranchSlug =
    membership?.branch?.slug ||
    (typeof window !== 'undefined' ? localStorage.getItem('ps_mock_branch_slug') : null) ||
    'premium';
  const isPremium = isPremiumBranch(activeBranchSlug, membership?.branch?.name);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#EDE8DF] pb-20">
      <Header
        subtitle={isLoggedIn ? (member?.full_name || 'پرونده اختصاصی عضو') : 'پورتال اعضای پروشات'}
        showLogout={isLoggedIn}
        onLogout={logout}
        branchSlug={activeBranchSlug}
        branchName={membership?.branch?.name}
        onBackToSite={onBackToSite}
      />

      {!isLoggedIn ? (
        <div className="max-w-md mx-auto">
          {/* Architectural Hero Image Header */}
          <div className="relative h-48 sm:h-60 overflow-hidden border-b border-[#EDE8DF]/12 bg-[#111113]">
            <img
              src={resolveAssetPath(isPremium ? 'img/hero-premium.jpg' : 'img/hero-standard.jpg')}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-55"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, #0A0A0B 8%, rgba(10,10,11,0.5) 60%, rgba(10,10,11,0.75) 100%)',
              }}
            />
            <div className="relative z-10 h-full px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col justify-end">
              <div className="mb-3 sm:mb-4">
                <BrandLogo variant="main" size="lg" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#EDE8DF] leading-tight">
                {step === 'phone' ? 'ورود به پورتال اختصاصی اعضای پروشات' : 'تأیید کد یک‌بارمصرف امن'}
              </h1>
              <p className="text-[11px] sm:text-xs text-[#8A857B] mt-1 sm:mt-1.5 leading-relaxed">
                {step === 'phone'
                  ? 'پاسپورت دیجیتال کلوب، گیت تردد هوشمند و پرونده فیزیولوژی تمرین و تغذیه'
                  : 'کد ۵ رقمی ارسال‌شده به تلفن همراه عضویت خود را وارد نمایید'}
              </p>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-6 sm:py-8">
            {step === 'phone' ? (
              <LoginForm
                onSubmit={handlePhoneSubmit}
                loading={authLoading}
                error={authError}
              />
            ) : (
              <OtpForm
                phone={currentPhone}
                onVerify={handleOtpVerify}
                onResend={handleResendOtp}
                onBack={() => setStep('phone')}
                loading={authLoading}
                error={authError}
              />
            )}

            <div className="mt-8 sm:mt-10 pt-4 sm:pt-5 border-t border-[#EDE8DF]/[0.08] flex items-center justify-between text-[10px] sm:text-[11px] text-[#8A857B]">
              <span>مجموعه باشگاه‌های پروشات — شیراز</span>
              <span>پریمیوم • پلاس آقایان • پلاس بانوان • ملاصدرا • خاکشناسی</span>
            </div>
          </div>
        </div>
      ) : membershipLoading ? (
        <div className="py-20 sm:py-28 text-center">
          <Spinner size="lg" />
          <p className="text-xs text-[#8A857B] mt-4">
            در حال بازخوانی پرونده عضویت...
          </p>
        </div>
      ) : (
        <main className="max-w-md mx-auto px-4 sm:px-5 py-4 sm:py-6 space-y-5 sm:space-y-7">
          <nav
            aria-label="بخش‌های پورتال اعضا"
            className="grid grid-cols-3 border-b border-[#EDE8DF]/12"
          >
            {[
              { id: 'pass', label: 'کارت تردد' },
              { id: 'plans', label: 'برنامه تمرین و رژیم' },
              { id: 'feedback', label: 'ارتباط با مدیریت' },
            ].map((tab) => {
              const active = portalTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setPortalTab(tab.id as any)}
                  className={`py-2.5 sm:py-3.5 text-center transition-colors relative cursor-pointer ${
                    active ? 'text-[#EDE8DF]' : 'text-[#8A857B] hover:text-[#EDE8DF]'
                  }`}
                >
                  <span className="text-[11px] sm:text-xs font-extrabold">{tab.label}</span>
                  {active && (
                    <span className="absolute bottom-0 right-0 left-0 h-[2px] bg-[#C9A96A]" />
                  )}
                </button>
              );
            })}
          </nav>

          {portalTab === 'pass' && (
            <div className="space-y-6 animate-editorial">
              <MembershipCard member={member} membership={membership} />
              <QrCard isActive={hasActive} />
              <MembershipStatus membership={membership} />
              <AttendanceHistory />
            </div>
          )}

          {portalTab === 'plans' && <MemberPlans />}

          {portalTab === 'feedback' && <MemberFeedback />}
        </main>
      )}
    </div>
  );
};
