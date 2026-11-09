import React, { useState, useEffect } from 'react';
import { SHIRAZ_BRANCHES, PROSHOT_DISCIPLINES, ShirazBranchInfo } from '../data/branches';
import { AmbientShaderCanvas } from '../components/landing/AmbientShaderCanvas';
import { ParallaxFrame, RevealBlock } from '../components/landing/ParallaxFrame';
import { BrandLogo, resolveAssetPath } from '../components/ui/BrandLogo';
import { Button } from '../components/ui/Button';
import { ArrowUpLeft, Phone, MapPin, Menu, X, Sparkles } from 'lucide-react';
import { ConsultationModal } from '../components/landing/ConsultationModal';

export interface LandingPageProps {
  onNavigate: (view: 'landing' | 'member' | 'staff', branchSlug?: string) => void;
  activeBranchSlug?: string;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  activeBranchSlug = 'premium',
}) => {
  const [selectedBranch, setSelectedBranch] = useState<ShirazBranchInfo>(
    () => SHIRAZ_BRANCHES.find((b) => b.slug === activeBranchSlug) || SHIRAZ_BRANCHES[0]
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [heroPointer, setHeroPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setScrollY(window.scrollY || document.documentElement.scrollTop || 0);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleHeroPointer = (e: React.PointerEvent<HTMLElement>) => {
    const nx = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
    const ny = (e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
    setHeroPointer({ x: nx, y: ny });
  };

  const isSelectedPremium = selectedBranch.isPremium;
  const accentColor = isSelectedPremium ? '#C9A96A' : '#EDE8DF';

  // Multi-layer hero parallax transforms
  const heroBgTranslateY = Math.min(scrollY * 0.42, 320);
  const heroBgScale = 1.08 + Math.min(scrollY * 0.00025, 0.14);
  const heroTextTranslateY = Math.min(scrollY * -0.14, 0);

  return (
    <div className="min-h-screen bg-[#070708] text-[#F2EFE9] selection:bg-[#C9A96A] selection:text-[#070708]">
      {/* =====================================================================
          1. ARCHITECTURAL FULL-BLEED HEADER (Equinox / Buckler Grid Bar)
          ===================================================================== */}
      <header className="sticky top-0 z-50 bg-[#070708]/88 backdrop-blur-md border-b border-[#F2EFE9]/12">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 h-20 flex items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <a href="#top" className="flex items-center">
              <BrandLogo
                branchSlug={selectedBranch.slug}
                branchName={selectedBranch.name}
                size="md"
              />
            </a>
            <span className="hidden sm:inline-block w-px h-6 bg-[#F2EFE9]/15" />
            <span className="hidden sm:inline-block text-xs font-bold text-[#8A857B]">
              شیراز • ۵ شعبه تخصصی
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-10 text-xs font-extrabold text-[#8A857B]">
            <a href="#clubs" className="hover:text-[#F2EFE9] transition-colors">
              شعب پنج‌گانه شیراز
            </a>
            <a href="#disciplines" className="hover:text-[#F2EFE9] transition-colors">
              رشته‌ها و امکانات
            </a>
            <a href="#portal" className="hover:text-[#F2EFE9] transition-colors">
              پورتال دیجیتال اعضا
            </a>
            <a href="#contact" className="hover:text-[#F2EFE9] transition-colors">
              اطلاعات تماس
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('member', selectedBranch.slug)}
              icon={<ArrowUpLeft className="w-3.5 h-3.5" />}
            >
              ورود اعضا
            </Button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center border border-[#F2EFE9]/15 text-[#F2EFE9]"
              aria-label="منو"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#F2EFE9]/12 bg-[#0A0A0C] px-6 py-5 space-y-4 text-sm font-bold">
            <a
              href="#clubs"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 border-b border-[#F2EFE9]/10 text-[#F2EFE9]"
            >
              شعب پنج‌گانه شیراز
            </a>
            <a
              href="#disciplines"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 border-b border-[#F2EFE9]/10 text-[#F2EFE9]"
            >
              رشته‌ها و امکانات
            </a>
            <a
              href="#portal"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 border-b border-[#F2EFE9]/10 text-[#F2EFE9]"
            >
              پورتال دیجیتال اعضا
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#F2EFE9]"
            >
              اطلاعات تماس شعب
            </a>
          </div>
        )}
      </header>

      {/* =====================================================================
          2. MULTI-LAYER PARALLAX HERO SECTION (Architectural Photo + WebGL Light)
          ===================================================================== */}
      <section
        id="top"
        onPointerMove={handleHeroPointer}
        className="relative min-h-[88vh] border-b border-[#F2EFE9]/12 flex flex-col justify-between overflow-hidden"
      >
        {/* Layer 1: Scroll & Pointer Parallax Architectural Gym Photograph */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={resolveAssetPath(selectedBranch.image)}
            alt={selectedBranch.name}
            className="w-full h-full object-cover opacity-55 will-change-transform transition-opacity duration-700"
            style={{
              transform: `translate3d(${(heroPointer.x * -14).toFixed(1)}px, ${(
                heroBgTranslateY +
                heroPointer.y * -10
              ).toFixed(1)}px, 0) scale(${heroBgScale.toFixed(3)})`,
            }}
          />
        </div>

        {/* Layer 2: Raw WebGL Volumetric Light Caustics blended over photography */}
        <div className="absolute inset-0 z-[1] mix-blend-screen opacity-65 pointer-events-none">
          <AmbientShaderCanvas tone={isSelectedPremium ? 'brass' : 'silver'} />
        </div>

        {/* Layer 3: High-Contrast Architectural Vignette */}
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background:
              'linear-gradient(to left, rgba(7,7,8,0.92) 18%, rgba(7,7,8,0.55) 62%, rgba(7,7,8,0.82) 100%), linear-gradient(to top, #070708 4%, transparent 45%)',
          }}
        />

        {/* Layer 4: Counter-Parallax Editorial Display Typography */}
        <div
          className="relative z-10 max-w-[1400px] w-full mx-auto px-5 sm:px-10 pt-16 sm:pt-24 pb-16 my-auto will-change-transform"
          style={{
            transform: `translate3d(0, ${heroTextTranslateY.toFixed(1)}px, 0)`,
          }}
        >
          <div className="max-w-4xl space-y-8">
            <div className="inline-flex items-center gap-3 px-3.5 py-1.5 border border-[#C9A96A]/40 bg-[#0A0A0C]/85 backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96A]" />
              <span className="text-xs font-bold text-[#F2EFE9]">
                مجموعه باشگاه‌های بدنسازی و تناسب اندام پروشات — شیراز
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#F2EFE9] leading-[1.12] drop-shadow-lg">
              استاندارد حرفه‌ای
              <br />
              بدنسازی در <span className="text-[#C9A96A]">شیراز.</span>
            </h1>

            <p className="text-sm sm:text-lg text-[#F2EFE9]/85 max-w-2xl leading-8 font-normal">
              پنج شعبه تخصصی ویژه آقایان و بانوان در شیراز؛ مجهز به دستگاه‌های بدنسازی استاندارد، استودیوهای فیتنس، TRX، اسپینینگ و پیلاتس، مجموعه آبی و سامانه دیجیتال برنامه تمرینی و تغذیه.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#clubs"
                className="px-7 py-3.5 h-12 inline-flex items-center justify-center rounded-[2px] bg-[#C9A96A] hover:bg-[#DFC690] text-[#070708] text-xs sm:text-sm font-extrabold transition-colors"
              >
                انتخاب شعبه و مشاهده آدرس‌ها
              </a>

              <button
                type="button"
                onClick={() => setIsConsultationOpen(true)}
                className="px-6 py-3.5 h-12 inline-flex items-center justify-center gap-2 rounded-[2px] border border-[#C9A96A]/60 bg-[#070708]/70 backdrop-blur-md text-[#C9A96A] text-xs sm:text-sm font-bold hover:bg-[#C9A96A] hover:text-[#070708] transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                درخواست مشاوره و بازدید
              </button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => onNavigate('member', selectedBranch.slug)}
                icon={<ArrowUpLeft className="w-4 h-4" />}
              >
                ورود به پورتال اعضا
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Full-Bleed 5-Branch Quick Bar */}
        <div className="relative z-10 border-t border-[#F2EFE9]/15 bg-[#070708]/90 backdrop-blur-md">
          <div className="max-w-[1400px] mx-auto grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-[#F2EFE9]/12">
            {SHIRAZ_BRANCHES.map((b) => {
              const active = selectedBranch.id === b.id;
              return (
                <a
                  key={b.id}
                  href="#clubs"
                  onClick={() => setSelectedBranch(b)}
                  className={`px-5 py-4 block transition-colors relative ${
                    active ? 'bg-[#141418]' : 'hover:bg-[#0D0D10]'
                  }`}
                >
                  <span
                    className="text-[11px] font-bold block mb-1"
                    style={{ color: b.isPremium ? '#C9A96A' : '#8A857B' }}
                  >
                    {b.district}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-[#F2EFE9] block">
                    {b.shortName}
                  </span>
                  {active && (
                    <span
                      className="absolute top-0 right-0 left-0 h-[2px]"
                      style={{ backgroundColor: b.isPremium ? '#C9A96A' : '#F2EFE9' }}
                    />
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          2.5 KINETIC MARQUEE RIBBON (Buckler Fit / Equinox Motion Strip)
          ===================================================================== */}
      <div
        className="border-b border-[#F2EFE9]/12 bg-[#0B0B0D] py-3.5 overflow-hidden select-none"
        dir="ltr"
      >
        <div className="animate-marquee-rtl flex items-center gap-10 text-xs font-extrabold text-[#8A857B] whitespace-nowrap">
          {[...Array(2)].map((_, loopIdx) => (
            <React.Fragment key={loopIdx}>
              <span className="text-[#C9A96A]">PROSHOT PREMIUM • SARVENAZ</span>
              <span>—</span>
              <span>PROSHOT PLUS • GHODOUSI</span>
              <span>—</span>
              <span>PROSHOT LADY • GHODOUSI</span>
              <span>—</span>
              <span>PROSHOT MOLLASADRA • JAMALI</span>
              <span>—</span>
              <span>PROSHOT KHAKSHENASI</span>
              <span>—</span>
              <span className="text-[#F2EFE9]">TECHNOGYM STRENGTH & CARDIO</span>
              <span>—</span>
              <span>TRX • SPINNING • REFORMER PILATES</span>
              <span>—</span>
              <span>SAUNA • JACUZZI • COLD PLUNGE</span>
              <span>—</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* =====================================================================
          3. SHIRAZ 5-CLUB DIRECTORY (Dual-Layer Parallax Windows & 3D Tilt)
          ===================================================================== */}
      <section id="clubs" className="border-b border-[#F2EFE9]/12">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 py-20 sm:py-28 space-y-12">
          <RevealBlock className="flex flex-wrap items-end justify-between gap-6 pb-8 border-b border-[#F2EFE9]/12">
            <div>
              <span className="text-xs font-bold text-[#C9A96A] block mb-2">
                شعب مجموعه ورزشی پروشات در شیراز
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-[#F2EFE9]">
                پنج شعبه در نقاط اصلی شیراز
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#8A857B] max-w-md leading-7">
              شعبه مورد نظر خود را انتخاب کنید تا نشانی دقیق، شماره تماس مستقیم، تصاویر، امکانات و ورودی پورتال همان شعبه را مشاهده نمایید.
            </p>
          </RevealBlock>

          {/* 5-Branch Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-5 border border-[#F2EFE9]/15 bg-[#0B0B0D] divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-[#F2EFE9]/12">
            {SHIRAZ_BRANCHES.map((branch) => {
              const active = selectedBranch.id === branch.id;
              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => setSelectedBranch(branch)}
                  className={`p-5 text-right transition-colors relative cursor-pointer ${
                    active
                      ? 'bg-[#151519] text-[#F2EFE9]'
                      : 'text-[#8A857B] hover:text-[#F2EFE9] hover:bg-[#101013]'
                  }`}
                >
                  <span
                    className="text-[11px] font-bold block mb-1"
                    style={{
                      color: branch.isPremium ? '#C9A96A' : active ? '#F2EFE9' : '#8A857B',
                    }}
                  >
                    {branch.genderLabel}
                  </span>
                  <span className="text-sm sm:text-base font-black block">
                    {branch.shortName}
                  </span>
                  <span className="text-[11px] text-[#8A857B] block mt-1 truncate">
                    {branch.district}
                  </span>
                  {active && (
                    <span
                      className="absolute bottom-0 right-0 left-0 h-[2px]"
                      style={{ backgroundColor: branch.isPremium ? '#C9A96A' : '#F2EFE9' }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Branch Architectural Showcase with Parallax Photography */}
          <div className="grid grid-cols-1 lg:grid-cols-12 border border-[#F2EFE9]/15 bg-[#0C0C0E]">
            {/* Right Column (in RTL): Branch Details, Address, Phone & Actions */}
            <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-8 border-b lg:border-b-0 lg:border-l border-[#F2EFE9]/12">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#F2EFE9]/10">
                  <div>
                    <span
                      className="text-xs font-bold block mb-1"
                      style={{ color: accentColor }}
                    >
                      {selectedBranch.genderLabel}
                    </span>
                    <h3 className="text-2xl sm:text-4xl font-black text-[#F2EFE9]">
                      {selectedBranch.name}
                    </h3>
                  </div>

                  <BrandLogo
                    branchSlug={selectedBranch.slug}
                    branchName={selectedBranch.name}
                    size="md"
                  />
                </div>

                {/* Address & Direct Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2">
                  <div className="space-y-1.5">
                    <span className="text-xs text-[#8A857B] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C9A96A]" />
                      نشانی در شیراز
                    </span>
                    <p className="text-sm font-bold text-[#F2EFE9] leading-relaxed">
                      {selectedBranch.address}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        selectedBranch.mapQuery
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#C9A96A] hover:underline pt-1"
                    >
                      <span>مسیریابی روی نقشه</span>
                      <ArrowUpLeft className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs text-[#8A857B] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#C9A96A]" />
                      تلفن پذیرش شعبه
                    </span>
                    {selectedBranch.phone ? (
                      <a
                        href={`tel:${selectedBranch.phone}`}
                        className="text-xl font-black text-[#F2EFE9] hover:text-[#C9A96A] transition-colors block"
                        dir="ltr"
                      >
                        {selectedBranch.phoneDisplay}
                      </a>
                    ) : (
                      <span className="text-sm font-bold text-[#F2EFE9] block">
                        {selectedBranch.phoneDisplay}
                      </span>
                    )}
                    <span className="text-[11px] text-[#8A857B] block">
                      پاسخگویی در ساعات فعالیت مجموعه
                    </span>
                  </div>
                </div>

                {/* Branch Facilities List */}
                <div className="pt-4 border-t border-[#F2EFE9]/10 space-y-3">
                  <span className="text-xs font-bold text-[#8A857B] block">
                    امکانات و خدمات این شعبه:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedBranch.facilities.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-[#070708] border border-[#F2EFE9]/10 text-xs font-bold text-[#F2EFE9] flex items-center gap-2.5"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: accentColor }}
                        />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Portal Entry for Selected Branch */}
              <div className="pt-6 border-t border-[#F2EFE9]/10 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-[#8A857B]">
                  {selectedBranch.isPremium
                    ? 'اعضای شعبه سروناز با نشان اختصاصی PROSHOT PREMIUM وارد پورتال می‌شوند.'
                    : 'اعضای این شعبه با نشان رسمی PROSHOT GYM وارد پورتال می‌شوند.'}
                </span>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onNavigate('member', selectedBranch.slug)}
                  icon={<ArrowUpLeft className="w-4 h-4" />}
                >
                  ورود به پورتال {selectedBranch.shortName}
                </Button>
              </div>
            </div>

            {/* Left Column (in RTL): Dual-Layer Interactive Parallax Viewport */}
            <div className="lg:col-span-6 relative min-h-[380px] sm:min-h-[480px] bg-[#070708] p-6 sm:p-8 flex flex-col justify-between overflow-hidden">
              {/* Primary Parallax Background Image with 3D Pointer Tilt */}
              <ParallaxFrame
                src={resolveAssetPath(selectedBranch.image)}
                alt={selectedBranch.name}
                speed={0.26}
                enableTilt={true}
                className="w-full h-full min-h-[340px] sm:min-h-[420px] border border-[#F2EFE9]/15 flex flex-col justify-between p-6"
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(7,7,8,0.92) 6%, rgba(7,7,8,0.2) 55%, rgba(7,7,8,0.65) 100%)',
                  }}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-3 py-1 bg-[#070708]/85 border border-[#F2EFE9]/15 text-xs font-bold text-[#F2EFE9]">
                    {selectedBranch.district}
                  </span>
                  <span
                    className="text-xs font-black px-3 py-1 bg-[#070708]/85 border"
                    style={{
                      color: accentColor,
                      borderColor: isSelectedPremium
                        ? 'rgba(201,169,106,0.5)'
                        : 'rgba(242,239,233,0.25)',
                    }}
                    dir="ltr"
                  >
                    {isSelectedPremium ? 'PROSHOT PREMIUM' : 'PROSHOT GYM'}
                  </span>
                </div>

                {/* Secondary Floating Counter-Parallax Inset Window */}
                <div className="relative z-10 mt-auto flex items-end justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-[#C9A96A] font-bold block">
                      فضای تمرینی استاندارد
                    </span>
                    <span className="text-lg font-black text-[#F2EFE9] block">
                      {selectedBranch.name}
                    </span>
                  </div>

                  <ParallaxFrame
                    src={resolveAssetPath(selectedBranch.secondaryImage)}
                    alt=""
                    speed={-0.18}
                    enableTilt={false}
                    className="hidden sm:block w-44 h-28 border border-[#C9A96A]/45 shadow-2xl shrink-0"
                  />
                </div>
              </ParallaxFrame>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. DISCIPLINES & AMENITIES (Interactive Image + 3D Tilt Spec Grid)
          ===================================================================== */}
      <section id="disciplines" className="border-b border-[#F2EFE9]/12 bg-[#09090B]">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 py-20 sm:py-28 space-y-12">
          <RevealBlock className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-[#C9A96A] block mb-2">
                رشته‌های ورزشی و امکانات مجموعه
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-[#F2EFE9]">
                تجهیزات استاندارد، مربیان متخصص
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#8A857B] max-w-md leading-7">
              تمامی شعب پروشات در شیراز با تمرکز بر کیفیت دستگاه‌ها، تهویه استاندارد و برنامه‌ریزی علمی تمرین و تغذیه تجهیز شده‌اند.
            </p>
          </RevealBlock>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROSHOT_DISCIPLINES.map((item, idx) => (
              <RevealBlock key={item.code} delayMs={idx * 70}>
                <ParallaxFrame
                  src={resolveAssetPath(item.image)}
                  alt={item.title}
                  speed={0.18 + (idx % 3) * 0.06}
                  enableTilt={true}
                  imgClassName="opacity-45 group-hover:opacity-65"
                  className="group h-80 border border-[#F2EFE9]/15 bg-[#070708] p-7 sm:p-8 flex flex-col justify-between"
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(to top, rgba(7,7,8,0.95) 18%, rgba(7,7,8,0.45) 65%, rgba(7,7,8,0.75) 100%)',
                    }}
                  />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-[#070708]/85 border border-[#C9A96A]/40 text-xs font-mono font-bold text-[#C9A96A]" dir="ltr">
                      /{item.code}
                    </span>
                    <span className="w-8 h-px bg-[#C9A96A]/50 block" />
                  </div>

                  <div className="relative z-10 space-y-2.5">
                    <h3 className="text-xl sm:text-2xl font-black text-[#F2EFE9]">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#F2EFE9]/80 leading-7">
                      {item.subtitle}
                    </p>
                  </div>
                </ParallaxFrame>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          4.5 FULL-BLEED PARALLAX ARCHITECTURAL INTERLUDE WINDOW
          ===================================================================== */}
      <section className="relative h-[46vh] min-h-[340px] border-b border-[#F2EFE9]/12 overflow-hidden">
        <ParallaxFrame
          src={resolveAssetPath('img/spa-recovery.jpg')}
          alt="مجموعه آبی و ریکاوری باشگاه پروشات شیراز"
          speed={0.34}
          enableTilt={false}
          className="w-full h-full flex items-center"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to left, rgba(7,7,8,0.92) 20%, rgba(7,7,8,0.45) 60%, rgba(7,7,8,0.88) 100%)',
            }}
          />
          <div className="relative z-10 max-w-[1400px] w-full mx-auto px-5 sm:px-10">
            <RevealBlock className="max-w-xl space-y-3">
              <span className="text-xs font-bold text-[#C9A96A] block">
                ریکاوری و بازسازی عضلانی
              </span>
              <h3 className="text-2xl sm:text-4xl font-black text-[#F2EFE9] leading-tight">
                سونا خشک و بخار، جکوزی و حوضچه آب سرد در کنار سالن تمرینی.
              </h3>
              <p className="text-xs sm:text-sm text-[#F2EFE9]/80 leading-7">
                ترکیب تمرینات قدرتی با پروتکل‌های ریکاوری استاندارد و کافی‌شاپ تخصصی ورزشی برای به حداکثر رساندن بازدهی هر جلسه تمرین.
              </p>
            </RevealBlock>
          </div>
        </ParallaxFrame>
      </section>

      {/* =====================================================================
          5. DIGITAL MEMBER PORTAL SECTION (High-Contrast Equinox Split Block)
          ===================================================================== */}
      <section id="portal" className="border-b border-[#F2EFE9]/12 bg-[#070708]">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 py-20 sm:py-28">
          <RevealBlock className="grid grid-cols-1 lg:grid-cols-12 border border-[#C9A96A]/40 bg-[#0C0C0E]">
            <div className="lg:col-span-7 p-7 sm:p-12 flex flex-col justify-between space-y-8 border-b lg:border-b-0 lg:border-l border-[#F2EFE9]/12">
              <div className="space-y-5">
                <span className="text-xs font-bold text-[#C9A96A] block">
                  سامانه یکپارچه اعضای پروشات
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-[#F2EFE9] leading-tight">
                  کارت عضویت دیجیتال، برنامه ماهانه تمرین و رژیم، و ارتباط مستقیم با مدیریت.
                </h2>
                <p className="text-xs sm:text-sm text-[#8A857B] leading-8 max-w-xl">
                  اعضای هر ۵ شعبه پروشات در شیراز می‌توانند با شماره موبایل ثبت‌شده خود وارد پورتال شوند، بارکد تردد گیت را دریافت کنند، برنامه تمرینی و غذایی ماهانه خود را مشاهده و دانلود نمایند و نظرات خود را مستقیماً برای مدیریت ارسال کنند.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    num: '۱',
                    title: 'کارت عضویت و بارکد تردد گیت',
                    desc: 'نمایش اعتبار اشتراک، شعبه ثبت‌نامی و بارکد پویا برای ورود سریع به باشگاه.',
                  },
                  {
                    num: '۲',
                    title: 'دریافت برنامه ماهانه تمرینی و تغذیه',
                    desc: 'ارسال مستقیم برنامه تمرین و رژیم غذایی توسط مربی شعبه به پروفایل عضو.',
                  },
                  {
                    num: '۳',
                    title: 'ثبت نظر و پاسخگویی مدیریت',
                    desc: 'امکان ثبت بازخورد درباره تجهیزات، مربیان و خدمات و دریافت پاسخ مدیریت.',
                  },
                ].map((step) => (
                  <div
                    key={step.num}
                    className="pb-4 border-b border-[#F2EFE9]/10 last:border-b-0 last:pb-0 flex items-start gap-4"
                  >
                    <span className="w-6 h-6 rounded-[2px] bg-[#C9A96A]/15 border border-[#C9A96A]/40 text-[#C9A96A] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      {step.num}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-[#F2EFE9]">{step.title}</h4>
                      <p className="text-xs text-[#8A857B] mt-1 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => onNavigate('member', selectedBranch.slug)}
                  icon={<ArrowUpLeft className="w-4 h-4" />}
                >
                  ورود به پورتال اعضا
                </Button>
              </div>
            </div>

            {/* Parallax Still-Life Window */}
            <div className="lg:col-span-5 min-h-[320px] relative">
              <ParallaxFrame
                src={resolveAssetPath('img/plans-banner.jpg')}
                alt="پرونده دیجیتال تمرین و تغذیه پروشات"
                speed={0.22}
                enableTilt={true}
                className="w-full h-full min-h-[340px] p-8 flex flex-col justify-end"
              >
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(9,9,11,0.95) 12%, rgba(9,9,11,0.25) 65%, rgba(9,9,11,0.6) 100%)',
                  }}
                />
                <div className="relative z-10 space-y-2">
                  <BrandLogo branchSlug={selectedBranch.slug} size="md" />
                  <p className="text-sm font-black text-[#F2EFE9] pt-2">
                    ورود بدون رمز عبور با کد پیامکی
                  </p>
                  <p className="text-xs text-[#8A857B]">
                    پشتیبانی از هر ۵ شعبه شیراز با تفکیک خودکار شعبه پریمیوم و سایر شعب
                  </p>
                </div>
              </ParallaxFrame>
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* =====================================================================
          6. SHIRAZ DIRECTORY FOOTER
          ===================================================================== */}
      <footer id="contact" className="bg-[#050506] pt-16 pb-12 text-xs text-[#8A857B]">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-10 space-y-12">
          <div className="flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-[#F2EFE9]/10">
            <div className="flex items-center gap-4">
              <BrandLogo branchSlug="premium" size="md" />
              <span className="w-px h-5 bg-[#F2EFE9]/15" />
              <span className="text-sm font-black text-[#F2EFE9]">
                مجموعه باشگاه‌های ورزشی پروشات — شیراز
              </span>
            </div>

            <a
              href="https://www.instagram.com/proshot__gym/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-[#F2EFE9]/20 hover:border-[#C9A96A] text-[#F2EFE9] font-bold transition-colors"
              dir="ltr"
            >
              Instagram: @proshot__gym
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {SHIRAZ_BRANCHES.map((b) => (
              <div key={b.id} className="space-y-2 border-r border-[#F2EFE9]/12 pr-4">
                <span
                  className="text-xs font-black block"
                  style={{ color: b.isPremium ? '#C9A96A' : '#F2EFE9' }}
                >
                  {b.name}
                </span>
                <p className="text-[11px] text-[#8A857B] leading-relaxed">
                  {b.address}
                </p>
                {b.phone ? (
                  <a
                    href={`tel:${b.phone}`}
                    className="text-xs font-bold text-[#F2EFE9] hover:text-[#C9A96A] block pt-1"
                    dir="ltr"
                  >
                    {b.phoneDisplay}
                  </a>
                ) : (
                  <span className="text-[11px] text-[#8A857B] block pt-1">
                    {b.phoneDisplay}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-[#F2EFE9]/10 flex flex-wrap items-center justify-between gap-4 text-[11px]">
            <span>تمامی حقوق برای مجموعه باشگاه‌های ورزشی پروشات (شیراز) محفوظ است.</span>

            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => onNavigate('member', 'premium')}
                className="hover:text-[#C9A96A] transition-colors cursor-pointer"
              >
                پورتال شعبه پریمیوم
              </button>
              <button
                type="button"
                onClick={() => onNavigate('member', 'plus-men')}
                className="hover:text-[#F2EFE9] transition-colors cursor-pointer"
              >
                پورتال سایر شعب
              </button>
              <button
                type="button"
                onClick={() => onNavigate('staff', selectedBranch.slug)}
                className="text-[#57534B] hover:text-[#8A857B] transition-colors cursor-pointer"
              >
                ورود پرسنل پذیرش
              </button>
            </div>
          </div>
        </div>
      </footer>

      <ConsultationModal
        isOpen={isConsultationOpen}
        defaultBranchSlug={selectedBranch.slug}
        onClose={() => setIsConsultationOpen(false)}
      />
    </div>
  );
};
