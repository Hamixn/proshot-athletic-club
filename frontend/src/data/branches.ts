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
    phone: null,
    phoneDisplay: 'هماهنگی از طریق پذیرش مجموعه',
    mapQuery: 'شیراز خیابان سروناز باشگاه پروشات',
    image: 'img/hero-premium.jpg',
    secondaryImage: 'img/spa-recovery.jpg',
    facilities: [
      'لاین کامل دستگاه‌های بدنسازی و وزنه آزاد Technogym',
      'سونا خشک، سونا بخار، جکوزی و حوضچه آب سرد',
      'کافی‌شاپ تخصصی ورزشی و لانژ ریکاوری',
      'تدوین ماهانه برنامه تمرینی و رژیم غذایی در پورتال اعضا',
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
      'تجهیزات مدرن بدنسازی، رک‌های اسکات و وزنه آزاد',
      'ایستگاه‌های کامل هوازی، فیتنس و تمرینات عملکردی (TRX)',
      'سونا، جکوزی و بوفه مکمل و تغذیه ورزشی',
      'ارائه برنامه تمرینی و رژیم غذایی ماهانه در پورتال اعضا',
    ],
    isPremium: false,
  },
  {
    id: 3,
    slug: 'plus-women',
    name: 'پروشات لیدی (قدوسی — بانوان)',
    shortName: 'شعبه لیدی — بانوان',
    district: 'میدان مطهری / قدوسی شرقی',
    genderPolicy: 'women',
    genderLabel: 'ویژه بانوان',
    address: 'شیراز، میدان مطهری، ابتدای بلوار قدوسی شرقی، مجتمع تجاری سلطانیه',
    phone: '07138440112',
    phoneDisplay: '۰۷۱-۳۸۴۴۰۱۱۲',
    mapQuery: 'شیراز میدان مطهری مجتمع سلطانیه باشگاه پروشات بانوان',
    image: 'img/studio-lady.jpg',
    secondaryImage: 'img/spa-recovery.jpg',
    facilities: [
      'سالن اختصاصی بدنسازی و دستگاه‌های فرم‌دهی بانوان',
      'استودیو کلاس‌های گروهی: TRX، اسپینینگ و پیلاتس دستگاه',
      'سونا، جکوزی و بوفه سلامت و تغذیه',
      'برنامه‌ریزی ماهانه تمرین و رژیم زیر نظر مربیان بانوان',
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
      'مجموعه کامل دستگاه‌های بدنسازی، سیم‌کش و وزنه آزاد',
      'بخش هوازی، فیتنس و آمادگی جسمانی',
      'بوفه ورزشی و کمدهای اختصاصی',
      'ثبت و دریافت برنامه تمرینی و غذایی ماهانه در پورتال',
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
      'سالن مجهز بدنسازی، هوازی و تناسب اندام بانوان',
      'کلاس‌های فیتنس، TRX، پیلاتس و حرکات اصلاحی',
      'بوفه ورزشی و رختکن مجهز',
      'پایش ماهانه برنامه تمرینی و رژیم در پورتال اعضا',
    ],
    isPremium: false,
  },
];

export const PROSHOT_DISCIPLINES = [
  {
    code: '01',
    title: 'بدنسازی و تمرینات قدرتی',
    subtitle: 'دستگاه‌های مدرن Technogym، وزنه آزاد و پلتفرم‌های تخصصی در هر ۵ شعبه شیراز.',
    image: 'img/hero-premium.jpg',
  },
  {
    code: '02',
    title: 'فیتنس، TRX و اسپینینگ',
    subtitle: 'ایستگاه‌های تمرین عملکردی، هوازی و استودیوهای گروهی پرانرژی.',
    image: 'img/cardio-arena.jpg',
  },
  {
    code: '03',
    title: 'پیلاتس دستگاه و حرکات اصلاحی',
    subtitle: 'تقویت عضلات عمقی، بهبود راستای قامت و انعطاف‌پذیری زیر نظر مربیان مجرب.',
    image: 'img/studio-lady.jpg',
  },
  {
    code: '04',
    title: 'مجموعه آبی و ریکاوری',
    subtitle: 'سونا خشک و بخار، جکوزی و حوضچه آب سرد جهت بازسازی عضلانی پس از تمرین.',
    image: 'img/spa-recovery.jpg',
  },
  {
    code: '05',
    title: 'برنامه ماهانه تمرین و تغذیه',
    subtitle: 'طراحی اختصاصی برنامه تمرینی و رژیم غذایی توسط مربیان و ارسال مستقیم به پورتال دیجیتال عضو.',
    image: 'img/plans-banner.jpg',
  },
  {
    code: '06',
    title: 'تجهیزات کالیبره و استودیو تخصصی',
    subtitle: 'طراحی فضای تمرین استاندارد با نورپردازی معماری، تهویه صنعتی و بوفه تغذیه ورزشی.',
    image: 'img/hero-standard.jpg',
  },
];
