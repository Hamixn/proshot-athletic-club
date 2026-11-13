export interface ShirazBranchInfo {
  id: number;
  slug: 'premium' | 'plus-men' | 'plus-women' | 'standard-men' | 'standard-women';
  name: string;
  shortName: string;
  district: string;
  genderPolicy: 'mixed' | 'men' | 'women';
  genderLabel: string;
  address: string;
  phone: string | null;
  phoneDisplay: string | null;
  mapQuery: string;
  image: string;
  secondaryImage: string;
  facilities: string[];
  isPremium: boolean;
}

export const SHIRAZ_BRANCHES: ShirazBranchInfo[] = [
  {
    id: 1,
    slug: 'premium',
    name: 'پروشات پریمیوم (سروناز)',
    shortName: 'شعبه پریمیوم — سروناز',
    district: 'بلوار ارم / خیابان سروناز',
    genderPolicy: 'mixed',
    genderLabel: 'سانس‌های مجزای آقایان و بانوان',
    address: 'شیراز، بلوار ارم، خیابان جهاد سازندگی، خیابان سروناز',
    phone: '07138440107',
    phoneDisplay: '۰۷۱-۳۸۴۴۰۱۰۷',
    mapQuery: 'شیراز خیابان سروناز باشگاه پروشات',
    image: 'img/hero-premium.jpg',
    secondaryImage: 'img/spa-jacuzzi.jpg',
    facilities: [
      'تجهیزات بیومکانیکال ایتالیایی Technogym و پلتفرم‌های وزنه آزاد',
      'مجموعه آب‌درمانی: سونای فنلاندی، جکوزی هیدروماساژ و حوضچه شوک سرد',
      'لانژ تشریفات، کافی‌شاپ تخصصی و اسموتی‌بار تغذیه ورزشی',
      'تدوین پروتکل‌های انفرادی فیزیولوژی و تغذیه در پورتال دیجیتال',
    ],
    isPremium: true,
  },
  {
    id: 2,
    slug: 'plus-men',
    name: 'پروشات پلاس (قدوسی — آقایان)',
    shortName: 'شعبه پلاس — آقایان',
    district: 'میدان مطهری / قدوسی شرقی',
    genderPolicy: 'men',
    genderLabel: 'ویژه آقایان',
    address: 'شیراز، میدان مطهری، ابتدای بلوار قدوسی شرقی، مجتمع تجاری سلطانیه',
    phone: '07138440107',
    phoneDisplay: '۰۷۱-۳۸۴۴۰۱۰۷',
    mapQuery: 'شیراز میدان مطهری مجتمع سلطانیه باشگاه پروشات',
    image: 'img/hero-standard.jpg',
    secondaryImage: 'img/cardio-arena.jpg',
    facilities: [
      'ایستگاه‌های پیشرفته هایپرتروفی، رک‌های اسکات و دمبل‌های کالیبره',
      'آرنای هوازی و استودیوی تمرینات عملکردی متابولیک (TRX)',
      'سونای خشک، جکوزی ریکاوری و بوفه مکمل‌های مجاز ورزشی',
      'ارزیابی دوره‌ای ترکیب بدنی و برنامه هدفمند در پورتال اعضا',
    ],
    isPremium: false,
  },
  {
    id: 3,
    slug: 'plus-women',
    name: 'پروشات پلاس بانوان (قدوسی شرقی)',
    shortName: 'شعبه پلاس — بانوان',
    district: 'قدوسی شرقی',
    genderPolicy: 'women',
    genderLabel: 'ویژه بانوان',
    address: 'شیراز، ابتدای بلوار قدوسی شرقی، مجتمع تجاری سلطانیه',
    phone: '07138440112',
    phoneDisplay: '۰۷۱-۳۸۴۴۰۱۱۲',
    mapQuery: 'شیراز بلوار قدوسی شرقی مجتمع سلطانیه باشگاه پروشات بانوان',
    image: 'img/studio-lady.jpg',
    secondaryImage: 'img/spa-jacuzzi.jpg',
    facilities: [
      'سالن اختصاصی فرم‌دهی و دستگاه‌های بایومکانیک منطبق با فیزیولوژی بانوان',
      'استودیو تخصصی کلاس‌های گروهی: ریفورمر پیلاتس، TRX و اسپینینگ',
      'اسپای ریکاوری، سونای خشک، جکوزی و لانژ سلامت بانوان',
      'برنامه‌ریزی ماهانه تمرین و تنظیم رژیم تحت نظر مربیان ارشد فدراسیون',
    ],
    isPremium: false,
  },
  {
    id: 4,
    slug: 'standard-men',
    name: 'پروشات ملاصدرا (آقایان)',
    shortName: 'شعبه ملاصدرا — آقایان',
    district: 'خیابان ملاصدرا / جمالی',
    genderPolicy: 'men',
    genderLabel: 'ویژه آقایان',
    address: 'شیراز، خیابان ملاصدرا، خیابان جمالی',
    phone: '07136473300',
    phoneDisplay: '۰۷۱-۳۶۴۷۳۳۰۰',
    mapQuery: 'شیراز خیابان ملاصدرا خیابان جمالی باشگاه پروشات',
    image: 'img/cardio-arena.jpg',
    secondaryImage: 'img/hero-standard.jpg',
    facilities: [
      'مجموعه کامل دستگاه‌های بیومکانیک، سیم‌کش‌های چندجهته و وزنه آزاد',
      'بخش مجزای هوازی و ارتقای استقامت قلبی‌عروقی',
      'اتمسفر تمرینی متمرکز، بوفه تغذیه و کمدهای مجهز VIP',
      'ثبت و پایش مستمر برنامه‌های تمرینی در پرونده دیجیتال کلوب',
    ],
    isPremium: false,
  },
  {
    id: 5,
    slug: 'standard-women',
    name: 'پروشات خاکشناسی (بانوان)',
    shortName: 'شعبه خاکشناسی — بانوان',
    district: 'خیابان خاکشناسی',
    genderPolicy: 'women',
    genderLabel: 'ویژه بانوان',
    address: 'شیراز، خیابان خاکشناسی، کوچه ۷',
    phone: '07132283545',
    phoneDisplay: '۰۷۱-۳۲۲۸۳۵۴۵',
    mapQuery: 'شیراز خیابان خاکشناسی کوچه 7 باشگاه پروشات',
    image: 'img/studio-lady.jpg',
    secondaryImage: 'img/cardio-arena.jpg',
    facilities: [
      'فضای تمرینی آرام، مدرن و اختصاصی تناسب اندام بانوان',
      'کلاس‌های هدفمند ریفورمر، پیلاتس مات، TRX و تمرینات فانکشنال',
      'لانژ اختصاصی سلامت، رختکن‌های لوکس و بوفه رژیمی ارگانیک',
      'طراحی برنامه‌های تمرین و تغذیه اختصاصی با پشتیبانی مداوم مربیان',
    ],
    isPremium: false,
  },
];

export const PROSHOT_DISCIPLINES = [
  {
    code: '01',
    title: 'بدنسازی و هایپرتروفی پیشرفته',
    subtitle: 'پلتفرم‌های بیومکانیکال Technogym ایتالیا، دامنه‌های حرکتی کنترل‌شده و رک‌های وزنه آزاد بدون محدودیت.',
    image: 'img/hero-premium.jpg',
  },
  {
    code: '02',
    title: 'تمرینات عملکردی و سیستم متابولیک',
    subtitle: 'استودیوهای اختصاصی TRX، دوچرخه‌های کالیبره اسپینینگ و پروتکل‌های تهویه قلبی‌عروقی با سنجش ضربان.',
    image: 'img/cardio-arena.jpg',
  },
  {
    code: '03',
    title: 'ریفورمر پیلاتس و اصلاح پاسچر',
    subtitle: 'تخت‌های ریفورمر استاندارد، بازیابی توازن اسکلتی‌عضلانی و آزادسازی فاشیا زیر نظر متخصصین حرکت‌شناسی.',
    image: 'img/studio-lady.jpg',
  },
  {
    code: '04',
    title: 'واترتراپی و کرایوتراپی ریکاوری',
    subtitle: 'پروتکل‌های متناوب گرمایش و غوطه‌وری در آب سرد (Contrast Bath) برای دفع لاکتات و بازسازی سریع فیبرهای عضلانی.',
    image: 'img/spa-jacuzzi.jpg',
  },
  {
    code: '05',
    title: 'نسخه‌نویسی فیزیولوژیک تمرین و تغذیه',
    subtitle: 'آنالیز ترکیب بدنی InBody، محاسبه دقیق نیازهای درشت‌مغذی و بارگذاری مستقیم برنامه در پرونده دیجیتال عضو.',
    image: 'img/plans-banner.jpg',
  },
  {
    code: '06',
    title: 'معماری آرامش، صوت و تهویه صنعتی',
    subtitle: 'طراحی آکوستیک، اکسیژن‌رسانی فیلترشده پیوسته، و لانژ اختصاصی اسموتی و مکمل‌های طبیعی ورزشی.',
    image: 'img/hero-standard.jpg',
  },
];
