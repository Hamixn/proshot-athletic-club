import React, { useState, useEffect, useRef } from 'react';
import { SHIRAZ_BRANCHES, PROSHOT_DISCIPLINES, ShirazBranchInfo } from '../data/branches';
import { AmbientShaderCanvas } from '../components/landing/AmbientShaderCanvas';
import { ParallaxFrame, RevealBlock } from '../components/landing/ParallaxFrame';
import {
  MotionRoot,
  Parallax,
  ScrollScene,
  SplitReveal,
  Magnetic,
  VelocityMarquee,
  useScrollItem,
} from '../components/motion/Motion';
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

  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const showcaseCardRef = useRef<HTMLDivElement>(null);

  // Register hero ('exit' 0..1) and footer ('view' 0..1) with the unified rAF scroll engine
  useScrollItem(heroRef, 'exit');
  useScrollItem(footerRef, 'view');

  // Pause hero video when scrolled off-screen to save battery & GPU on mobile/desktop
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            vid.play().catch(() => {});
          } else {
            vid.pause();
          }
        });
      },
      { rootMargin: '80px 0px 80px 0px' }
    );

    io.observe(vid);
    return () => io.disconnect();
  }, []);

  const isSelectedPremium = selectedBranch.isPremium;
  const accentColor = isSelectedPremium ? '#C9A96A' : '#EDE8DF';
  const branchIndexFormatted = `0${selectedBranch.id}`;

  const handleBranchSelect = (branch: ShirazBranchInfo, scrollOnMobile = false) => {
    setSelectedBranch(branch);
    if (scrollOnMobile && typeof window !== 'undefined' && window.innerWidth < 768) {
      setTimeout(() => {
        showcaseCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 60);
    }
  };

  return (
    <MotionRoot smooth={true}>
      <div className="min-h-screen bg-[#070708] text-[#F2EFE9] selection:bg-[#C9A96A] selection:text-[#070708]">
        {/* =====================================================================
            1. ARCHITECTURAL FULL-BLEED HEADER + SCROLL PROGRESS HAIRLINE
            ===================================================================== */}
        <header className="sticky top-0 z-50 bg-[#070708]/90 backdrop-blur-md border-b border-[#F2EFE9]/12">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-10 h-16 sm:h-20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
              <a href="#top" className="flex items-center shrink-0">
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
              <a href="#recovery" className="hover:text-[#F2EFE9] transition-colors">
                مجموعه آبی و ریکاوری
              </a>
              <a href="#portal" className="hover:text-[#F2EFE9] transition-colors">
                پورتال دیجیتال اعضا
              </a>
              <a href="#contact" className="hover:text-[#F2EFE9] transition-colors">
                اطلاعات تماس
              </a>
            </nav>

            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsConsultationOpen(true)}
                className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 border border-[#C9A96A]/45 text-[#C9A96A] text-xs font-bold hover:bg-[#C9A96A] hover:text-[#070708] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>مشاوره عضویت</span>
              </button>

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
                className="md:hidden w-9 h-9 flex items-center justify-center border border-[#F2EFE9]/15 text-[#F2EFE9] active:bg-[#16161A]"
                aria-label="منو"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 2px Brass Scroll Progress Bar */}
          <div className="h-[2px] w-full bg-transparent overflow-hidden pointer-events-none">
            <div className="scroll-progress-bar h-full w-full bg-[#C9A96A]" />
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-[#F2EFE9]/12 bg-[#0A0A0C] px-5 py-5 space-y-3 text-sm font-bold">
              <a
                href="#clubs"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 border-b border-[#F2EFE9]/10 text-[#F2EFE9]"
              >
                شعب پنج‌گانه شیراز
              </a>
              <a
                href="#disciplines"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 border-b border-[#F2EFE9]/10 text-[#F2EFE9]"
              >
                رشته‌ها و امکانات
              </a>
              <a
                href="#recovery"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 border-b border-[#F2EFE9]/10 text-[#F2EFE9]"
              >
                مجموعه آبی و ریکاوری
              </a>
              <a
                href="#portal"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 border-b border-[#F2EFE9]/10 text-[#F2EFE9]"
              >
                پورتال دیجیتال اعضا
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2.5 border-b border-[#F2EFE9]/10 text-[#F2EFE9]"
              >
                اطلاعات تماس شعب
              </a>

              <div className="pt-2 grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsConsultationOpen(true);
                  }}
                  className="w-full py-3 bg-[#C9A96A] text-[#070708] text-xs font-extrabold flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>درخواست مشاوره و بازدید حضوری</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('staff', selectedBranch.slug);
                  }}
                  className="w-full py-2.5 border border-[#F2EFE9]/15 text-[#8A857B] text-xs font-bold"
                >
                  ورود پرسنل پذیرش
                </button>
              </div>
            </div>
          )}
        </header>

        {/* =====================================================================
            2. MULTI-DEPTH PARALLAX HERO (Video + WebGL + Wordmark + Split Headline)
            ===================================================================== */}
        <section
          id="top"
          ref={heroRef}
          className="relative min-h-[88svh] sm:min-h-[90vh] border-b border-[#F2EFE9]/12 flex flex-col justify-between overflow-hidden"
        >
          {/* Layer 0: Scroll & Pointer Parallax Cinema Video (with Portrait Mobile Triptych Pan) */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              loop
              muted
              playsInline
              poster={resolveAssetPath(selectedBranch.image)}
              className="hero-video absolute inset-0 w-full h-full object-cover"
            >
              <source src={resolveAssetPath('video/hero-triptych.webm')} type="video/webm" />
              <source src={resolveAssetPath('video/hero-triptych.mp4')} type="video/mp4" />
              <img
                src={resolveAssetPath(selectedBranch.image)}
                alt={selectedBranch.name}
                className="w-full h-full object-cover"
              />
            </video>
          </div>

          {/* Layer 1: Raw WebGL Volumetric Light Caustics */}
          <div className="absolute inset-0 z-[1] mix-blend-screen opacity-65 pointer-events-none">
            <AmbientShaderCanvas tone={isSelectedPremium ? 'brass' : 'silver'} />
          </div>

          {/* Layer 2: High-Contrast Architectural Vignette */}
          <div
            className="absolute inset-0 z-[2] pointer-events-none"
            style={{
              background:
                'linear-gradient(to left, rgba(7,7,8,0.93) 16%, rgba(7,7,8,0.58) 62%, rgba(7,7,8,0.85) 100%), linear-gradient(to top, #070708 5%, transparent 48%)',
            }}
          />

          {/* Layer 3: Giant Outlined Architectural Wordmark (PROSHOT) */}
          <div
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-[3] overflow-hidden pointer-events-none flex justify-end px-4 sm:px-12"
            dir="ltr"
            aria-hidden="true"
          >
            <span className="hero-wordmark block">PROSHOT</span>
          </div>

          {/* Layer 4: Multi-Plane Editorial Display Typography & Magnetic CTAs */}
          <div className="hero-copy-layer relative z-10 max-w-[1400px] w-full mx-auto px-4 sm:px-10 pt-10 sm:pt-24 pb-10 sm:pb-16 my-auto">
            <div className="max-w-4xl space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2.5 sm:gap-3 px-3 sm:px-3.5 py-1.5 border border-[#C9A96A]/45 bg-[#0A0A0C]/85 backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96A] shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold text-[#F2EFE9]">
                  مجموعه باشگاه‌های بدنسازی و تناسب اندام پروشات — شیراز
                </span>
              </div>

              <div className="space-y-1">
                <SplitReveal
                  fullText="استاندارد حرفه‌ای بدنسازی در شیراز."
                  className="text-3xl sm:text-6xl lg:text-7xl font-black text-[#F2EFE9] leading-[1.18] sm:leading-[1.12] drop-shadow-lg"
                  words={[
                    { t: 'استاندارد' },
                    { t: 'حرفه‌ای', br: true },
                    { t: 'بدنسازی' },
                    { t: 'در' },
                    { t: 'شیراز.', accent: true },
                  ]}
                />
              </div>

              <Parallax speed={-18}>
                <p className="text-xs sm:text-lg text-[#F2EFE9]/85 max-w-2xl leading-7 sm:leading-8 font-normal">
                  پنج شعبه تخصصی ویژه آقایان و بانوان در شیراز؛ مجهز به دستگاه‌های بدنسازی استاندارد، استودیوهای فیتنس، TRX، اسپینینگ و پیلاتس، مجموعه آبی و سامانه دیجیتال برنامه تمرینی و تغذیه.
                </p>
              </Parallax>

              {/* Responsive Thumb-Friendly CTA Row */}
              <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
                <Magnetic className="w-full sm:w-auto">
                  <a
                    href="#clubs"
                    className="w-full sm:w-auto px-7 py-3.5 h-12 inline-flex items-center justify-center rounded-[2px] bg-[#C9A96A] hover:bg-[#DFC690] text-[#070708] text-xs sm:text-sm font-extrabold transition-colors"
                  >
                    انتخاب شعبه و مشاهده آدرس‌ها
                  </a>
                </Magnetic>

                <Magnetic className="w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsConsultationOpen(true)}
                    className="w-full sm:w-auto px-6 py-3.5 h-12 inline-flex items-center justify-center gap-2 rounded-[2px] border border-[#C9A96A]/60 bg-[#070708]/75 backdrop-blur-md text-[#C9A96A] text-xs sm:text-sm font-bold hover:bg-[#C9A96A] hover:text-[#070708] transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>درخواست مشاوره و بازدید</span>
                  </button>
                </Magnetic>

                <Magnetic className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={() => onNavigate('member', selectedBranch.slug)}
                    icon={<ArrowUpLeft className="w-4 h-4" />}
                  >
                    ورود به پورتال اعضا
                  </Button>
                </Magnetic>
              </div>
            </div>

            {/* Subtle Architectural Scroll Cue Line (Desktop/Tablet) */}
            <div
              className="hidden sm:flex items-center gap-3 absolute left-10 bottom-8 text-[10px] font-mono text-[#8A857B]"
              dir="ltr"
              aria-hidden="true"
            >
              <span>SCROLL</span>
              <span className="w-px h-10 bg-[#F2EFE9]/15 overflow-hidden block">
                <span className="scroll-cue-line block w-full h-full bg-[#C9A96A]" />
              </span>
            </div>
          </div>

          {/* Bottom Full-Bleed 5-Branch Quick Bar (Symmetrical 1+2+2 on mobile, 5-col on desktop) */}
          <div className="relative z-10 border-t border-[#F2EFE9]/15 bg-[#070708]/92 backdrop-blur-md">
            <div className="max-w-[1400px] mx-auto grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 divide-x divide-x-reverse divide-[#F2EFE9]/12">
              {SHIRAZ_BRANCHES.map((b) => {
                const active = selectedBranch.id === b.id;
                return (
                  <a
                    key={b.id}
                    href="#clubs"
                    onClick={() => handleBranchSelect(b, true)}
                    className={`px-4 sm:px-5 py-3.5 sm:py-4 block transition-colors relative ${
                      b.isPremium ? 'col-span-2 sm:col-span-1' : ''
                    } ${active ? 'bg-[#141418]' : 'hover:bg-[#0D0D10]'}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span
                        className="text-[10px] sm:text-[11px] font-bold block truncate"
                        style={{ color: b.isPremium ? '#C9A96A' : '#8A857B' }}
                      >
                        {b.district}
                      </span>
                      <span className="text-[10px] font-mono text-[#8A857B]/70" dir="ltr">
                        0{b.id}
                      </span>
                    </div>
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
            2.5 VELOCITY-REACTIVE KINETIC MARQUEE RIBBON
            ===================================================================== */}
        <div
          className="border-b border-[#F2EFE9]/12 bg-[#0B0B0D] py-3.5 overflow-hidden select-none"
          dir="ltr"
        >
          <VelocityMarquee className="text-xs font-extrabold text-[#8A857B]">
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
          </VelocityMarquee>
        </div>

        {/* =====================================================================
            3. SHIRAZ 5-CLUB DIRECTORY (Ghost Numerals, Wipe Transitions & Dual Parallax)
            ===================================================================== */}
        <section id="clubs" className="relative border-b border-[#F2EFE9]/12 overflow-hidden">
          {/* Floating Outlined Ghost Numeral Behind Section */}
          <Parallax
            speed={-65}
            className="absolute left-3 sm:left-10 top-12 z-0 pointer-events-none select-none"
            aria-hidden="true"
          >
            <span className="ghost-numeral block" dir="ltr">
              {branchIndexFormatted}
            </span>
          </Parallax>

          <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-10 py-14 sm:py-28 space-y-8 sm:space-y-12">
            <RevealBlock className="flex flex-wrap items-end justify-between gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-[#F2EFE9]/12">
              <div>
                <span className="text-xs font-bold text-[#C9A96A] block mb-2">
                  شعب مجموعه ورزشی پروشات در شیراز
                </span>
                <h2 className="text-2xl sm:text-5xl font-black text-[#F2EFE9]">
                  پنج شعبه در نقاط اصلی شیراز
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#8A857B] max-w-md leading-7">
                شعبه مورد نظر خود را انتخاب کنید تا نشانی دقیق، شماره تماس مستقیم، تصاویر، امکانات و ورودی پورتال همان شعبه را مشاهده نمایید.
              </p>
            </RevealBlock>

            {/* 5-Branch Selector Tabs (Symmetrical 2-col on mobile, 5-col on desktop) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 border border-[#F2EFE9]/15 bg-[#0B0B0D] divide-y sm:divide-y-0 divide-x divide-x-reverse divide-[#F2EFE9]/12">
              {SHIRAZ_BRANCHES.map((branch) => {
                const active = selectedBranch.id === branch.id;
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => handleBranchSelect(branch, true)}
                    className={`p-3.5 sm:p-5 text-right transition-colors relative cursor-pointer ${
                      branch.isPremium ? 'col-span-2 sm:col-span-1' : ''
                    } ${
                      active
                        ? 'bg-[#151519] text-[#F2EFE9]'
                        : 'text-[#8A857B] hover:text-[#F2EFE9] hover:bg-[#101013]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className="text-[10px] sm:text-[11px] font-bold block truncate"
                        style={{
                          color: branch.isPremium ? '#C9A96A' : active ? '#F2EFE9' : '#8A857B',
                        }}
                      >
                        {branch.genderLabel}
                      </span>
                      <span className="text-[10px] font-mono text-[#8A857B]" dir="ltr">
                        0{branch.id}
                      </span>
                    </div>
                    <span className="text-xs sm:text-base font-black block">
                      {branch.shortName}
                    </span>
                    <span className="text-[11px] text-[#8A857B] block mt-0.5 sm:mt-1 truncate">
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

            {/* Active Branch Architectural Showcase with Directional Wipe & Dual Parallax */}
            <div
              ref={showcaseCardRef}
              className="grid grid-cols-1 lg:grid-cols-12 border border-[#F2EFE9]/15 bg-[#0C0C0E]"
            >
              {/* Photo Column First on Mobile (order-1 lg:order-2) so tapping a tab immediately shows the wipe */}
              <div
                key={`photo-${selectedBranch.slug}`}
                className="order-1 lg:order-2 lg:col-span-6 relative min-h-[300px] sm:min-h-[480px] bg-[#070708] p-4 sm:p-8 flex flex-col justify-between overflow-hidden branch-wipe"
              >
                <ParallaxFrame
                  src={resolveAssetPath(selectedBranch.image)}
                  alt={selectedBranch.name}
                  speed={0.28}
                  enableTilt={true}
                  className="w-full h-full min-h-[270px] sm:min-h-[420px] border border-[#F2EFE9]/15 flex flex-col justify-between p-4 sm:p-6"
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        'linear-gradient(to top, rgba(7,7,8,0.92) 6%, rgba(7,7,8,0.2) 55%, rgba(7,7,8,0.65) 100%)',
                    }}
                  />

                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="px-2.5 sm:px-3 py-1 bg-[#070708]/85 border border-[#F2EFE9]/15 text-[11px] sm:text-xs font-bold text-[#F2EFE9]">
                      {selectedBranch.district}
                    </span>
                    <span
                      className="text-[11px] sm:text-xs font-black px-2.5 sm:px-3 py-1 bg-[#070708]/85 border"
                      style={{
                        color: accentColor,
                        borderColor: isSelectedPremium
                          ? 'rgba(201,169,106,0.5)'
                          : 'rgba(242,239,233,0.25)',
                      }}
                      dir="ltr"
                    >
                      {isSelectedPremium ? 'PROSHOT PREMIUM' : `BRANCH 0${selectedBranch.id}`}
                    </span>
                  </div>

                  {/* Secondary Floating Counter-Parallax Inset Window (visible on both mobile & desktop) */}
                  <div className="relative z-10 mt-auto pt-12 flex items-end justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] sm:text-xs text-[#C9A96A] font-bold block">
                        فضای تمرینی استاندارد
                      </span>
                      <span className="text-base sm:text-lg font-black text-[#F2EFE9] block">
                        {selectedBranch.name}
                      </span>
                    </div>

                    <Parallax speed={-28} className="shrink-0">
                      <ParallaxFrame
                        src={resolveAssetPath(selectedBranch.secondaryImage)}
                        alt=""
                        speed={-0.18}
                        enableTilt={false}
                        className="w-28 h-20 sm:w-44 sm:h-28 border border-[#C9A96A]/55 shadow-2xl"
                      />
                    </Parallax>
                  </div>
                </ParallaxFrame>
              </div>

              {/* Details Column (order-2 lg:order-1) */}
              <div
                key={`details-${selectedBranch.slug}`}
                className="order-2 lg:order-1 lg:col-span-6 p-5 sm:p-10 flex flex-col justify-between space-y-6 sm:space-y-8 border-t lg:border-t-0 lg:border-l border-[#F2EFE9]/12 animate-editorial"
              >
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#F2EFE9]/10">
                    <div>
                      <span
                        className="text-xs font-bold block mb-1"
                        style={{ color: accentColor }}
                      >
                        {selectedBranch.genderLabel}
                      </span>
                      <h3 className="text-xl sm:text-4xl font-black text-[#F2EFE9]">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 py-1 sm:py-2">
                    <div className="space-y-1.5">
                      <span className="text-xs text-[#8A857B] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C9A96A]" />
                        نشانی در شیراز
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-[#F2EFE9] leading-relaxed">
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
                          className="text-lg sm:text-xl font-black text-[#F2EFE9] hover:text-[#C9A96A] transition-colors block"
                          dir="ltr"
                        >
                          {selectedBranch.phoneDisplay}
                        </a>
                      ) : (
                        <span className="text-xs sm:text-sm font-bold text-[#F2EFE9] block">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      {selectedBranch.facilities.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 sm:p-3.5 bg-[#070708] border border-[#F2EFE9]/10 text-xs font-bold text-[#F2EFE9] flex items-center gap-2.5"
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

                {/* Portal & Tour Actions for Selected Branch */}
                <div className="pt-5 sm:pt-6 border-t border-[#F2EFE9]/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setIsConsultationOpen(true)}
                    className="px-4 py-3 border border-[#C9A96A]/45 text-[#C9A96A] text-xs font-bold hover:bg-[#C9A96A] hover:text-[#070708] transition-colors cursor-pointer text-center"
                  >
                    هماهنگی بازدید از {selectedBranch.shortName}
                  </button>

                  <Button
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto"
                    onClick={() => onNavigate('member', selectedBranch.slug)}
                    icon={<ArrowUpLeft className="w-4 h-4" />}
                  >
                    ورود به پورتال {selectedBranch.shortName}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            4. DISCIPLINES & AMENITIES (Staggered Column Parallax + 3D Tilt Grid)
            ===================================================================== */}
        <section id="disciplines" className="border-b border-[#F2EFE9]/12 bg-[#09090B] overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-10 py-16 sm:py-28 space-y-10 sm:space-y-14">
            <RevealBlock className="flex flex-wrap items-end justify-between gap-4 sm:gap-6">
              <div>
                <span className="text-xs font-bold text-[#C9A96A] block mb-2">
                  رشته‌های ورزشی و امکانات مجموعه
                </span>
                <h2 className="text-2xl sm:text-5xl font-black text-[#F2EFE9]">
                  تجهیزات استاندارد، مربیان متخصص
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#8A857B] max-w-md leading-7">
                تمامی شعب پروشات در شیراز با تمرکز بر کیفیت دستگاه‌ها، تهویه استاندارد و برنامه‌ریزی علمی تمرین و تغذیه تجهیز شده‌اند.
              </p>
            </RevealBlock>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {PROSHOT_DISCIPLINES.map((item, idx) => {
                // Differential column parallax speeds create an editorial staggered rhythm
                const colSpeed = (idx % 3) * 18;
                return (
                  <Parallax key={item.code} speed={colSpeed}>
                    <RevealBlock delayMs={idx * 65}>
                      <ParallaxFrame
                        src={resolveAssetPath(item.image)}
                        alt={item.title}
                        speed={0.2 + (idx % 3) * 0.06}
                        enableTilt={true}
                        curtainReveal={true}
                        imgClassName="opacity-50 group-hover:opacity-70"
                        className="group h-72 sm:h-80 border border-[#F2EFE9]/15 bg-[#070708] p-6 sm:p-8 flex flex-col justify-between"
                      >
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background:
                              'linear-gradient(to top, rgba(7,7,8,0.95) 18%, rgba(7,7,8,0.42) 65%, rgba(7,7,8,0.75) 100%)',
                          }}
                        />

                        <Parallax
                          speed={14}
                          className="relative z-10 flex items-center justify-between"
                        >
                          <span
                            className="px-2.5 py-1 bg-[#070708]/85 border border-[#C9A96A]/40 text-xs font-mono font-bold text-[#C9A96A]"
                            dir="ltr"
                          >
                            /{item.code}
                          </span>
                          <span className="w-8 h-px bg-[#C9A96A]/50 block" />
                        </Parallax>

                        <div className="relative z-10 space-y-2">
                          <h3 className="text-lg sm:text-2xl font-black text-[#F2EFE9]">
                            {item.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#F2EFE9]/80 leading-7">
                            {item.subtitle}
                          </p>
                        </div>
                      </ParallaxFrame>
                    </RevealBlock>
                  </Parallax>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================================
            4.5 EXPANDING ARCHITECTURAL SCENE (Spa & Recovery Choreographed Reveal)
            ===================================================================== */}
        <div id="recovery">
          <ScrollScene
            className="border-b border-[#F2EFE9]/12 bg-[#050506]"
            stickyClassName="flex items-center justify-center py-16 sm:py-24"
          >
            {/* Expanding Architectural Frame (--open 0 -> 1 as section enters viewport) */}
            <div className="expand-frame absolute inset-0 overflow-hidden border border-[#C9A96A]/25">
              <img
                src={resolveAssetPath('img/spa-recovery.jpg')}
                alt="مجموعه آبی و ریکاوری باشگاه پروشات شیراز"
                className="w-full h-full object-cover opacity-70"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to left, rgba(7,7,8,0.92) 18%, rgba(7,7,8,0.48) 58%, rgba(7,7,8,0.88) 100%), linear-gradient(to top, rgba(7,7,8,0.9) 6%, transparent 45%)',
                }}
              />
            </div>

            {/* Choreographed Scroll-Driven Copy & Pillars (fully revealed as soon as section enters view) */}
            <div className="relative z-10 max-w-[1400px] w-full mx-auto px-5 sm:px-12 py-6">
              <div className="max-w-2xl space-y-4 sm:space-y-6">
                <span
                  className="scene-line inline-flex items-center gap-2 px-3 py-1 bg-[#070708]/85 border border-[#C9A96A]/45 text-xs font-bold text-[#C9A96A]"
                  style={{ '--start': 0.04 } as React.CSSProperties}
                >
                  ریکاوری و بازسازی عضلانی پس از تمرین
                </span>

                <h3
                  className="scene-line text-2xl sm:text-5xl font-black text-[#F2EFE9] leading-tight drop-shadow-md"
                  style={{ '--start': 0.1 } as React.CSSProperties}
                >
                  سونا خشک و بخار، جکوزی و حوضچه آب سرد در کنار سالن تمرینی.
                </h3>

                <p
                  className="scene-line text-xs sm:text-base text-[#F2EFE9]/90 leading-7 sm:leading-8 drop-shadow-xs"
                  style={{ '--start': 0.16 } as React.CSSProperties}
                >
                  ترکیب تمرینات قدرتی با پروتکل‌های ریکاوری استاندارد و کافی‌شاپ تخصصی ورزشی برای به حداکثر رساندن بازدهی هر جلسه تمرین در شعب پروشات شیراز.
                </p>

                <div
                  className="scene-line pt-2 grid grid-cols-3 gap-2.5 sm:gap-4 max-w-lg"
                  style={{ '--start': 0.22 } as React.CSSProperties}
                >
                  <div className="p-3 sm:p-4 bg-[#070708]/85 border border-[#F2EFE9]/15 backdrop-blur-xs">
                    <span className="text-xs sm:text-sm font-black text-[#C9A96A] block">
                      سونا و جکوزی
                    </span>
                    <span className="text-[10px] sm:text-xs text-[#8A857B] block mt-0.5">
                      حرارت‌درمانی و ریلکسیشن
                    </span>
                  </div>
                  <div className="p-3 sm:p-4 bg-[#070708]/85 border border-[#F2EFE9]/15 backdrop-blur-xs">
                    <span className="text-xs sm:text-sm font-black text-[#C9A96A] block">
                      حوضچه آب سرد
                    </span>
                    <span className="text-[10px] sm:text-xs text-[#8A857B] block mt-0.5">
                      کاهش التهاب عضلانی
                    </span>
                  </div>
                  <div className="p-3 sm:p-4 bg-[#070708]/85 border border-[#F2EFE9]/15 backdrop-blur-xs">
                    <span className="text-xs sm:text-sm font-black text-[#C9A96A] block">
                      بوفه تخصصی
                    </span>
                    <span className="text-[10px] sm:text-xs text-[#8A857B] block mt-0.5">
                      پروتئین و تغذیه ورزشی
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollScene>
        </div>

        {/* =====================================================================
            5. DIGITAL MEMBER PORTAL SECTION (Multi-Plane Brass Hairline Frames)
            ===================================================================== */}
        <section id="portal" className="border-b border-[#F2EFE9]/12 bg-[#070708] overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-10 py-16 sm:py-28">
            <RevealBlock className="grid grid-cols-1 lg:grid-cols-12 border border-[#C9A96A]/40 bg-[#0C0C0E]">
              <div className="lg:col-span-7 p-6 sm:p-12 flex flex-col justify-between space-y-8 border-b lg:border-b-0 lg:border-l border-[#F2EFE9]/12">
                <div className="space-y-5">
                  <span className="text-xs font-bold text-[#C9A96A] block">
                    سامانه یکپارچه اعضای پروشات
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-[#F2EFE9] leading-tight">
                    کارت عضویت دیجیتال، برنامه ماهانه تمرین و رژیم، و ارتباط مستقیم با مدیریت.
                  </h2>
                  <p className="text-xs sm:text-sm text-[#8A857B] leading-7 sm:leading-8 max-w-xl">
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

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <Magnetic className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto"
                      onClick={() => onNavigate('member', selectedBranch.slug)}
                      icon={<ArrowUpLeft className="w-4 h-4" />}
                    >
                      ورود به پورتال اعضا
                    </Button>
                  </Magnetic>
                </div>
              </div>

              {/* Parallax Still-Life Window with Offset Floating Brass Hairline Planes */}
              <div className="lg:col-span-5 min-h-[300px] sm:min-h-[360px] relative p-4 sm:p-6 bg-[#09090B] flex items-center justify-center overflow-hidden">
                <Parallax
                  speed={-24}
                  className="absolute inset-7 border border-[#C9A96A]/25 pointer-events-none z-20"
                  aria-hidden="true"
                />
                <Parallax
                  speed={22}
                  className="absolute inset-9 border border-[#F2EFE9]/10 pointer-events-none z-20"
                  aria-hidden="true"
                />

                <ParallaxFrame
                  src={resolveAssetPath('img/plans-banner.jpg')}
                  alt="پرونده دیجیتال تمرین و تغذیه پروشات"
                  speed={0.26}
                  enableTilt={true}
                  className="w-full h-full min-h-[280px] sm:min-h-[340px] border border-[#F2EFE9]/15 p-6 sm:p-8 flex flex-col justify-end"
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
            6. SHIRAZ DIRECTORY FOOTER + RISING ARCHITECTURAL WORDMARK
            ===================================================================== */}
        <footer
          id="contact"
          ref={footerRef}
          className="relative bg-[#050506] pt-14 sm:pt-16 pb-12 text-xs text-[#8A857B] overflow-hidden"
        >
          <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-10 space-y-10 sm:space-y-12">
            <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6 pb-8 border-b border-[#F2EFE9]/10">
              <div className="flex items-center gap-3.5 sm:gap-4">
                <BrandLogo branchSlug="premium" size="md" />
                <span className="w-px h-5 bg-[#F2EFE9]/15" />
                <span className="text-xs sm:text-sm font-black text-[#F2EFE9]">
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
                  <p className="text-[11px] text-[#8A857B] leading-relaxed">{b.address}</p>
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

            {/* Rising Architectural Wordmark */}
            <div className="pt-4 overflow-hidden text-center" dir="ltr" aria-hidden="true">
              <span className="footer-wordmark block">PROSHOT SHIRAZ</span>
            </div>

            <div className="pt-6 border-t border-[#F2EFE9]/10 flex flex-wrap items-center justify-between gap-4 text-[11px]">
              <span>تمامی حقوق برای مجموعه باشگاه‌های ورزشی پروشات (شیراز) محفوظ است.</span>

              <div className="flex flex-wrap items-center gap-4 sm:gap-5">
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
    </MotionRoot>
  );
};
