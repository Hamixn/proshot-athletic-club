import { Member, Membership, MemberPlan, FeedbackItem } from '../types/member';
import { Branch } from '../types/branch';
import { isValidIranianMobile, normalizePhone } from './phone';
import { toLatinDigits } from './jalali';

export class ApiError extends Error {
  constructor(public message: string, public status: number = 500, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

function isStaticPreviewHost(): boolean {
  if (typeof window === 'undefined') return false;
  const { hostname, protocol } = window.location;
  return (
    hostname.endsWith('github.io') ||
    hostname === 'proshotgym.ir' ||
    hostname.endsWith('.proshotgym.ir') ||
    protocol === 'file:'
  );
}

// Mock database for local browser preview fallback
const mockState: {
  isLoggedIn: boolean;
  member: Member;
  membership: Membership;
  branches: Branch[];
  attendances: any[];
  plans: MemberPlan[];
  feedback: FeedbackItem[];
} = {
  isLoggedIn: false,
  member: {
    id: 101,
    external_id: 'GYM-8891',
    first_name: 'علیرضا',
    last_name: 'محمدی',
    full_name: 'علیرضا محمدی',
    mobile: '09121111111',
    mobile_normalized: '+989121111111',
    national_code: '0012345678',
    gender: 'male',
    is_verified: true,
    created_at: '2026-10-01 10:00:00',
  },
  membership: {
    id: 1,
    member_id: 101,
    branch_id: 1,
    external_id: 'MEM-9921',
    plan_name: 'اشتراک طلایی ۳ ماهه پرمیوم',
    status: 'active',
    is_active: true,
    starts_at: '2026-10-01',
    expires_at: '2027-01-01',
    starts_at_jalali: '۱۴۰۵/۰۷/۱۰',
    expires_at_jalali: '۱۴۰۵/۱۰/۱۱',
    days_remaining: 58,
    days_remaining_persian: '۵۸',
    branch: {
      id: 1,
      name: 'پریمیوم (سروناز)',
      slug: 'premium',
      gender_policy: 'mixed',
    },
  },
  branches: [
    { id: 1, name: 'پریمیوم (سروناز)', slug: 'premium', gender_policy: 'mixed', is_active: true },
    { id: 2, name: 'پلاس (قدوسی — آقایان)', slug: 'plus-men', gender_policy: 'men', is_active: true },
    { id: 3, name: 'لیدی (قدوسی — بانوان)', slug: 'plus-women', gender_policy: 'women', is_active: true },
    { id: 4, name: 'ملاصدرا (آقایان)', slug: 'standard-men', gender_policy: 'men', is_active: true },
    { id: 5, name: 'خاکشناسی (بانوان)', slug: 'standard-women', gender_policy: 'women', is_active: true },
  ],
  attendances: [
    {
      id: 1,
      member_id: 101,
      branch_id: 1,
      checked_in_at: '2026-11-03 18:30:00',
      check_date: '2026-11-03',
      date_jalali: '۱۴۰۵/۰۸/۱۳',
      time: '۱۸:۳۰',
      method: 'qr',
      result: 'approved',
      branch: { id: 1, name: 'پریمیوم (سروناز)', slug: 'premium' },
    },
    {
      id: 2,
      member_id: 101,
      branch_id: 1,
      checked_in_at: '2026-11-01 19:15:00',
      check_date: '2026-11-01',
      date_jalali: '۱۴۰۵/۰۸/۱۱',
      time: '۱۹:۱۵',
      method: 'qr',
      result: 'approved',
      branch: { id: 1, name: 'پریمیوم (سروناز)', slug: 'premium' },
    },
    {
      id: 3,
      member_id: 101,
      branch_id: 2,
      checked_in_at: '2026-10-28 17:00:00',
      check_date: '2026-10-28',
      date_jalali: '۱۴۰۵/۰۸/۰۷',
      time: '۱۷:۰۰',
      method: 'qr',
      result: 'approved',
      branch: { id: 2, name: 'پلاس (قدوسی — آقایان)', slug: 'plus-men' },
    },
  ],
  plans: [
    {
      id: 1,
      member_id: 101,
      branch_id: 1,
      trainer_id: 1,
      plan_type: 'workout',
      title: 'برنامه هایپرتروفی بالاتنه و پایین‌تنه (فاز ۱)',
      valid_month: 'آبان ۱۴۰۵',
      content: `### روز اول: سینه و جلو بازو
- پرس سینه هالتر: ۴ ست × ۸ الی ۱۰ تکرار (استراحت ۹۰ ثانیه)
- بالاسینه دمبل موازی: ۳ ست × ۱۲ تکرار (استراحت ۶۰ ثانیه)
- کراس اور سیم‌کش از پایین: ۳ ست × ۱۵ تکرار با تمرکز بر انقباض
- جلو بازو هالتر EZ ایستاده: ۴ ست × ۱۰ تکرار
- جلو بازو لاری دمبل تک‌دست: ۳ ست × ۱۲ تکرار

### روز دوم: پشت و سرشانه
- بارفیکس دست باز: ۴ ست تا حد ناتوانی
- زیربغل هالتر خم: ۴ ست × ۸ تکرار
- سرشانه پرس دمبل نشسته: ۴ ست × ۱۰ تکرار
- نشر از جانب دمبل: ۴ ست × ۱۵ تکرار (دراپ‌ست در ست آخر)

### روز سوم: پا و عضلات مرکزی
- اسکات هالتر از پشت: ۴ ست × ۸ تکرار با عمق استاندارد
- پرس پا دستگاه زاویه‌دار: ۳ ست × ۱۲ تکرار
- پشت پا دستگاه خوابیده: ۴ ست × ۱۲ تکرار
- پلانک شکم: ۳ ست × ۶۰ ثانیه`,
      file_url: '',
      file_name: 'Workout-Phase1-Nov2026.pdf',
      file_size: '1.2 MB',
      created_at: '2026-11-01 10:00:00',
      created_at_jalali: '۱۴۰۵/۰۸/۱۱',
    },
    {
      id: 2,
      member_id: 101,
      branch_id: 1,
      trainer_id: 1,
      plan_type: 'diet',
      title: 'رژیم غذایی افزایش حجم خالص عضلانی (۲۹۰۰ کالری)',
      valid_month: 'آبان ۱۴۰۵',
      content: `### صبحانه (ساعت ۸:۰۰)
- ۵ عدد سفیده تخم‌مرغ + ۲ عدد تخم‌مرغ کامل
- ۸۰ گرم جو دوسر پرک همراه با شیر کم‌چرب و دارچین
- ۱ عدد موز متوسط و یک قاشق عسل طبیعی

### میان‌وعده صبح (ساعت ۱۱:۰۰)
- ۱ پیمانه پروتئین وی با آب سرد
- ۳۰ گرم مغز بادام خام یا گردو

### ناهار (ساعت ۱۳:۳۰)
- ۲۰۰ گرم سینه مرغ گریل شده یا استیک فیله گوساله
- ۱۵۰ گرم برنج کته قهوه‌ای یا سفید
- یک بشقاب بزرگ سالاد سبزیجات همراه با روغن زیتون فرابکر

### وعده قبل و بعد تمرین (ساعت ۱۷:۰۰ و ۱۹:۳۰)
- قبل تمرین: ۱ عدد سیب + یک فنجان قهوه اسپرسو دوبل
- بعد تمرین: ۱ اسکوپ وی ایزوله + ۵ گرم کراتین مونوهیدرات

### شام (ساعت ۲۱:۳۰)
- ۲۰۰ گرم ماهی قزل‌آلا یا سالمون پخته‌شده
- سیب‌زمینی تنوری ۱۵۰ گرم همراه با بروکلی بخارپز`,
      file_url: '',
      file_name: 'Diet-Hypertrophy-Nov2026.pdf',
      file_size: '850 KB',
      created_at: '2026-11-01 11:30:00',
      created_at_jalali: '۱۴۰۵/۰۸/۱۱',
    },
  ],
  feedback: [
    {
      id: 1,
      member_id: 101,
      branch_id: 1,
      category: 'facilities',
      rating: 5,
      subject: 'کیفیت فوق‌العاده دستگاه‌های بخش پرمیوم',
      message: 'دستگاه‌های لاین جدید پندولوم و هک‌اسکات بسیار ارگونومیک هستند و زاویه عالی دارند. تشکر از مدیریت باشگاه.',
      status: 'responded',
      staff_response: 'سلام و درود جناب محمدی عزیز. رضایت اعضای گرانقدر اولویت اول باشگاه پروشات است. به زودی لاین تخصصی دیگری نیز افزوده خواهد شد.',
      responded_by: 1,
      responded_at: '2026-11-02 12:00:00',
      responded_at_jalali: '۱۴۰۵/۰۸/۱۲',
      created_at: '2026-11-01 16:00:00',
      created_at_jalali: '۱۴۰۵/۰۸/۱۱',
      member_name: 'علیرضا محمدی',
      member_mobile: '09121111111',
    },
  ],
};

if (typeof window !== 'undefined') {
  (window as any).setMockBranchSlug = (slug: string) => {
    localStorage.setItem('ps_mock_branch_slug', slug);
    const found = mockState.branches.find((b) => b.slug === slug) || mockState.branches[0];
    mockState.membership.branch_id = found.id;
    mockState.membership.branch = {
      id: found.id,
      name: found.name,
      slug: found.slug,
      gender_policy: found.gender_policy,
    };
    mockState.membership.plan_name =
      found.slug === 'premium'
        ? 'اشتراک ۳ ماهه شعبه پریمیوم (سروناز)'
        : `اشتراک ۳ ماهه شعبه ${found.name}`;

    if (!isStaticPreviewHost()) {
      fetch('/api/v1/me/switch-branch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      }).catch(() => {});
    }
  };
}

function handleMockRequest(endpoint: string, _method: string, _body?: any): any {
  if (endpoint === '/auth/request-otp') {
    const rawPhone = String(_body?.phone || '');
    if (!isValidIranianMobile(rawPhone)) {
      throw new ApiError('شماره موبایل واردشده معتبر نیست.', 400);
    }
    const cleanLocal = toLatinDigits(rawPhone).replace(/^\+98/, '0').replace(/\s+/g, '');
    mockState.member.mobile = cleanLocal;
    mockState.member.mobile_normalized = normalizePhone(rawPhone);
    return { success: true, message: 'کد تأیید ارسال شد (کد پیش‌نمایش: ۱۲۳۴۵)' };
  }

  if (endpoint === '/auth/verify-otp') {
    const code = toLatinDigits(String(_body?.code || '')).trim();
    if (code !== '12345') {
      throw new ApiError('کد وارد شده صحیح نیست. در نسخه پیش‌نمایش کد ۱۲۳۴۵ را وارد کنید.', 400);
    }
    mockState.isLoggedIn = true;
    return {
      success: true,
      token: 'standalone_demo_token',
      member: mockState.member,
      message: 'ورود موفقیت‌آمیز بود',
    };
  }

  if (endpoint === '/me/switch-branch') {
    const slug = String(_body?.slug || 'premium');
    const found = mockState.branches.find((b) => b.slug === slug) || mockState.branches[0];
    mockState.membership.branch_id = found.id;
    mockState.membership.branch = {
      id: found.id,
      name: found.name,
      slug: found.slug,
      gender_policy: found.gender_policy,
    };
    return { success: true, branch: found };
  }

  if (endpoint === '/auth/logout') {
    mockState.isLoggedIn = false;
    return { success: true };
  }

  if (endpoint === '/me') {
    return { success: true, member: mockState.member };
  }

  if (endpoint.startsWith('/me/membership')) {
    return {
      success: true,
      has_active: mockState.membership.is_active,
      membership: mockState.membership,
    };
  }

  if (endpoint === '/me/qr') {
    const dummyToken =
      btoa(
        JSON.stringify({
          mid: 101,
          nonce: Math.random().toString(36),
          exp: Math.floor(Date.now() / 1000) + 30,
        })
      ) + '.mock_signature';
    return {
      success: true,
      token: dummyToken,
      expires_at: Math.floor(Date.now() / 1000) + 30,
      ttl: 30,
    };
  }

  if (endpoint === '/me/attendance') {
    return { success: true, records: mockState.attendances };
  }

  if (endpoint === '/branches') {
    return { success: true, branches: mockState.branches };
  }

  if (endpoint === '/checkin/scan') {
    return {
      success: true,
      data: {
        result: 'approved',
        message: 'ورود با موفقیت ثبت شد. تمرین خوبی داشته باشید!',
        attendance_id: 99,
        member: mockState.member,
      },
    };
  }

  if (endpoint.startsWith('/checkin/search')) {
    return {
      success: true,
      members: [mockState.member],
    };
  }

  if (endpoint === '/checkin/member') {
    return {
      success: true,
      data: {
        result: 'approved',
        message: 'ورود دستی با موفقیت ثبت گردید.',
        attendance_id: 100,
        member: mockState.member,
      },
    };
  }

  if (endpoint === '/checkin/override') {
    return {
      success: true,
      data: {
        result: 'override',
        message: 'ورود دستی با تأیید پذیرش (Override) ثبت گردید.',
        attendance_id: 101,
        member: mockState.member,
      },
    };
  }

  if (endpoint.startsWith('/checkin/today')) {
    return {
      success: true,
      records: mockState.attendances,
    };
  }

  if (endpoint === '/me/plans') {
    return {
      success: true,
      plans: mockState.plans,
    };
  }

  if (endpoint.startsWith('/staff/plans')) {
    if (_method === 'POST') {
      const newPlan: MemberPlan = {
        id: Date.now(),
        member_id: _body?.member_id || 101,
        branch_id: _body?.branch_id || 1,
        trainer_id: 1,
        plan_type: _body?.plan_type || 'workout',
        title: _body?.title || 'برنامه ورزشی جدید',
        valid_month: _body?.valid_month || 'آبان ۱۴۰۵',
        content: _body?.content || '',
        file_url: _body?.file_url || '',
        file_name: _body?.file_name || 'attached-plan.pdf',
        file_size: _body?.file_size || '1.0 MB',
        created_at: new Date().toISOString(),
        created_at_jalali: '۱۴۰۵/۰۸/۱۵',
      };
      mockState.plans.unshift(newPlan);
      return {
        success: true,
        message: 'برنامه ماهانه با موفقیت ثبت شد.',
        plan: newPlan,
      };
    }
    if (_method === 'DELETE') {
      const match = endpoint.match(/\/staff\/plans\/(\d+)/);
      const id = match ? parseInt(match[1], 10) : null;
      if (id) {
        mockState.plans = mockState.plans.filter((p) => p.id !== id);
      }
      return { success: true, message: 'برنامه با موفقیت حذف گردید.' };
    }
    return {
      success: true,
      plans: mockState.plans,
    };
  }

  if (endpoint === '/me/feedback') {
    if (_method === 'POST') {
      const newFb: FeedbackItem = {
        id: Date.now(),
        member_id: 101,
        branch_id: 1,
        category: _body?.category || 'general',
        rating: _body?.rating || 5,
        subject: _body?.subject || '',
        message: _body?.message || '',
        status: 'pending',
        staff_response: null,
        created_at: new Date().toISOString(),
        created_at_jalali: '۱۴۰۵/۰۸/۱۵',
        member_name: mockState.member.full_name,
        member_mobile: mockState.member.mobile,
      };
      mockState.feedback.unshift(newFb);
      return {
        success: true,
        message: 'نظر و بازخورد شما با تشکر ثبت گردید.',
        feedback: newFb,
      };
    }
    return {
      success: true,
      feedback: mockState.feedback,
    };
  }

  if (endpoint.startsWith('/admin/feedback')) {
    if (endpoint.includes('/reply')) {
      const match = endpoint.match(/\/admin\/feedback\/(\d+)\/reply/);
      const id = match ? parseInt(match[1], 10) : null;
      const target = mockState.feedback.find((f) => f.id === id);
      if (target) {
        target.staff_response = _body?.response || 'پاسخ کادر مدیریت ثبت شد.';
        target.status = 'responded';
        target.responded_at_jalali = '۱۴۰۵/۰۸/۱۵';
      }
      return {
        success: true,
        message: 'پاسخ مدیریت با موفقیت ثبت شد.',
        feedback: target,
      };
    }
    return {
      success: true,
      feedback: mockState.feedback,
    };
  }

  if (endpoint === '/leads' && _method === 'POST') {
    if (!_body?.full_name || !String(_body.full_name).trim()) {
      throw new ApiError('لطفاً نام و نام خانوادگی خود را وارد نمایید.', 400);
    }
    if (!isValidIranianMobile(String(_body?.mobile || ''))) {
      throw new ApiError('شماره موبایل واردشده معتبر نیست.', 400);
    }
    return {
      success: true,
      lead_id: Date.now(),
      message: 'درخواست مشاوره و بازدید شما ثبت شد. کارشناسان شعبه به‌زودی با شما تماس می‌گیرند.',
    };
  }

  return { success: true };
}

export const api = {
  getBaseUrl(): string {
    return '/api/v1';
  },

  getToken(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('ps_auth_token') || '';
  },

  setToken(token: string | null): void {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem('ps_auth_token', token);
    } else {
      localStorage.removeItem('ps_auth_token');
    }
  },

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const method = options.method || 'GET';
    const parsedBody = options.body
      ? typeof options.body === 'string'
        ? JSON.parse(options.body)
        : options.body
      : null;

    // On static preview hosts (GitHub Pages), no Node/SQLite backend is present — run standalone demo state directly
    if (isStaticPreviewHost()) {
      return handleMockRequest(endpoint, method, parsedBody) as T;
    }

    const url = `${this.getBaseUrl()}${endpoint}`;
    const headers = new Headers(options.headers || {});

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const token = this.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      // Static hosts without an API server return 404/405 HTML pages instead of JSON
      if (!response.ok && !isJson && (response.status === 404 || response.status === 405 || response.status === 501)) {
        return handleMockRequest(endpoint, method, parsedBody) as T;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new ApiError(data.message || 'خطا در برقراری ارتباط با سرور', response.status, data);
      }

      return data as T;
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      // Fallback to local state if standalone server is unreachable
      return handleMockRequest(endpoint, method, parsedBody) as T;
    }
  },

  get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  },

  post<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  put<T = any>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  },
};
