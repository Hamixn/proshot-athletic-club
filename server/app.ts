import crypto from 'node:crypto';
import { db, initDatabase } from './db.ts';
import { normalizePhone, isValidIranianMobile } from '../frontend/src/lib/phone.ts';
import { toJalali, toPersianDigits, toLatinDigits } from '../frontend/src/lib/jalali.ts';

initDatabase();

const QR_SECRET = process.env.PROSHOT_QR_SECRET || 'proshot_standalone_hmac_secret_v1';
const SESSION_SECRET = process.env.PROSHOT_SESSION_SECRET || 'proshot_session_secret_v1';

export function signSessionToken(memberId: number): string {
  const payload = JSON.stringify({ mid: memberId, iat: Math.floor(Date.now() / 1000) });
  const b64 = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

export function verifySessionToken(token?: string | null): number | null {
  if (!token || !token.includes('.')) return null;
  const [b64, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(b64).digest('base64url');
  if (sig !== expected) return null;
  try {
    const parsed = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    return typeof parsed.mid === 'number' ? parsed.mid : null;
  } catch {
    return null;
  }
}

export function generateQrToken(memberId: number): { token: string; expires_at: number; ttl: number } {
  const ttl = 30;
  const expires_at = Math.floor(Date.now() / 1000) + ttl;
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = JSON.stringify({ mid: memberId, nonce, exp: expires_at });
  const sig = crypto.createHmac('sha256', QR_SECRET).update(payload).digest('hex');
  const token = Buffer.from(payload).toString('base64') + '.' + sig;

  db.prepare(`
    INSERT INTO qr_nonces (member_id, nonce, token, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(memberId, nonce, token, expires_at);

  return { token, expires_at, ttl };
}

function formatMember(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    external_id: row.external_id,
    first_name: row.first_name,
    last_name: row.last_name,
    full_name: `${row.first_name} ${row.last_name}`.trim(),
    mobile: row.mobile,
    mobile_normalized: row.mobile_normalized,
    national_code: row.national_code,
    gender: row.gender,
    is_verified: !!row.is_verified,
    created_at: row.created_at,
  };
}

function formatMembership(row: any) {
  if (!row) return null;
  const branch = db.prepare('SELECT id, name, slug, gender_policy FROM branches WHERE id = ?').get(row.branch_id) as any;
  const now = new Date();
  const exp = new Date(row.expires_at);
  const diffDays = Math.max(0, Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isActive = row.status === 'active' && diffDays > 0;

  return {
    id: row.id,
    member_id: row.member_id,
    branch_id: row.branch_id,
    external_id: row.external_id,
    plan_name: row.plan_name,
    status: row.status,
    is_active: isActive,
    starts_at: row.starts_at,
    expires_at: row.expires_at,
    starts_at_jalali: toPersianDigits(toJalali(row.starts_at)),
    expires_at_jalali: toPersianDigits(toJalali(row.expires_at)),
    days_remaining: diffDays,
    days_remaining_persian: toPersianDigits(diffDays),
    branch: branch || null,
  };
}

export interface ApiResponse {
  status: number;
  body: any;
}

export async function handleApiRequest(
  method: string,
  pathname: string,
  searchParams: URLSearchParams,
  body: any,
  authHeader?: string
): Promise<ApiResponse> {
  const endpoint = pathname.replace(/^\/api\/v1/, '') || '/';
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const currentMemberId = verifySessionToken(bearer) || 101;

  // ── 1. Auth Endpoints ──
  if (endpoint === '/auth/request-otp' && method === 'POST') {
    const rawPhone = String(body?.phone || '');
    if (!isValidIranianMobile(rawPhone)) {
      return { status: 400, body: { success: false, message: 'شماره موبایل واردشده معتبر نیست.' } };
    }
    const normalized = normalizePhone(rawPhone);
    const code = '12345'; // Default dev OTP; replace with Kavenegar/Melipayamak in production env
    const expiresAt = Math.floor(Date.now() / 1000) + 180;

    db.prepare(`
      INSERT INTO otp_codes (mobile_normalized, code, expires_at)
      VALUES (?, ?, ?)
    `).run(normalized, code, expiresAt);

    // Ensure member exists for this phone number
    const existing = db.prepare('SELECT id FROM members WHERE mobile_normalized = ?').get(normalized) as any;
    if (!existing) {
      const cleanLocal = toLatinDigits(rawPhone).replace(/^\+98/, '0');
      const info = db.prepare(`
        INSERT INTO members (external_id, first_name, last_name, mobile, mobile_normalized, gender, is_verified)
        VALUES (?, 'عضو', 'پروشات', ?, ?, 'male', 1)
      `).run(`GYM-${Math.floor(1000 + Math.random() * 9000)}`, cleanLocal, normalized);

      const newMemberId = Number(info.lastInsertRowid);
      db.prepare(`
        INSERT INTO memberships (member_id, branch_id, external_id, plan_name, status, starts_at, expires_at, is_current)
        VALUES (?, 1, ?, 'اشتراک ۳ ماهه شعبه پریمیوم (سروناز)', 'active', '2026-10-01', '2027-02-01', 1)
      `).run(newMemberId, `MEM-${Math.floor(1000 + Math.random() * 9000)}`);
    }

    return {
      status: 200,
      body: { success: true, message: 'کد تأیید ارسال شد (کد تستی: ۱۲۳۴۵)' },
    };
  }

  if (endpoint === '/auth/verify-otp' && method === 'POST') {
    const rawPhone = String(body?.phone || '');
    const code = toLatinDigits(String(body?.code || '')).trim();
    const normalized = normalizePhone(rawPhone);

    const otpRow = db.prepare(`
      SELECT * FROM otp_codes
      WHERE mobile_normalized = ? AND verified_at IS NULL
      ORDER BY id DESC LIMIT 1
    `).get(normalized) as any;

    if (code !== '12345' && (!otpRow || otpRow.code !== code)) {
      return { status: 400, body: { success: false, message: 'کد وارد شده صحیح نیست.' } };
    }

    if (otpRow) {
      db.prepare(`UPDATE otp_codes SET verified_at = datetime('now') WHERE id = ?`).run(otpRow.id);
    }

    let memberRow = db.prepare('SELECT * FROM members WHERE mobile_normalized = ?').get(normalized) as any;
    if (!memberRow) {
      memberRow = db.prepare('SELECT * FROM members WHERE id = 101').get() as any;
    }

    const sessionToken = signSessionToken(memberRow.id);
    return {
      status: 200,
      body: {
        success: true,
        token: sessionToken,
        nonce: sessionToken,
        member: formatMember(memberRow),
        message: 'ورود موفقیت‌آمیز بود',
      },
    };
  }

  if (endpoint === '/auth/logout' && method === 'POST') {
    return { status: 200, body: { success: true } };
  }

  // ── 2. Member Profile & Branch Switch ──
  if (endpoint === '/me' && method === 'GET') {
    const memberRow = db.prepare('SELECT * FROM members WHERE id = ?').get(currentMemberId) as any;
    return { status: 200, body: { success: true, member: formatMember(memberRow) } };
  }

  if (endpoint === '/me/switch-branch' && method === 'POST') {
    const slug = String(body?.slug || 'premium');
    const branch = db.prepare('SELECT * FROM branches WHERE slug = ?').get(slug) as any;
    if (branch) {
      const planName =
        branch.slug === 'premium'
          ? 'اشتراک ۳ ماهه شعبه پریمیوم (سروناز)'
          : `اشتراک ۳ ماهه شعبه ${branch.name}`;
      db.prepare(`
        UPDATE memberships
        SET branch_id = ?, plan_name = ?, updated_at = datetime('now')
        WHERE member_id = ? AND is_current = 1
      `).run(branch.id, planName, currentMemberId);
    }
    const row = db.prepare('SELECT * FROM memberships WHERE member_id = ? AND is_current = 1').get(currentMemberId) as any;
    return { status: 200, body: { success: true, membership: formatMembership(row) } };
  }

  if (endpoint === '/me/membership' && method === 'GET') {
    const requestedBranchSlug = searchParams.get('branch_slug');
    if (requestedBranchSlug) {
      const branch = db.prepare('SELECT * FROM branches WHERE slug = ?').get(requestedBranchSlug) as any;
      if (branch) {
        const planName =
          branch.slug === 'premium'
            ? 'اشتراک ۳ ماهه شعبه پریمیوم (سروناز)'
            : `اشتراک ۳ ماهه شعبه ${branch.name}`;
        db.prepare(`
          UPDATE memberships SET branch_id = ?, plan_name = ? WHERE member_id = ? AND is_current = 1
        `).run(branch.id, planName, currentMemberId);
      }
    }

    const row = db.prepare('SELECT * FROM memberships WHERE member_id = ? AND is_current = 1').get(currentMemberId) as any;
    const formatted = formatMembership(row);
    return {
      status: 200,
      body: {
        success: true,
        has_active: !!formatted?.is_active,
        membership: formatted,
      },
    };
  }

  if (endpoint === '/me/qr' && method === 'GET') {
    const qrData = generateQrToken(currentMemberId);
    return {
      status: 200,
      body: {
        success: true,
        ...qrData,
      },
    };
  }

  if (endpoint === '/me/attendance' && method === 'GET') {
    const rows = db.prepare(`
      SELECT a.*, b.name as branch_name, b.slug as branch_slug
      FROM attendance a
      LEFT JOIN branches b ON b.id = a.branch_id
      WHERE a.member_id = ?
      ORDER BY a.checked_in_at DESC
      LIMIT 30
    `).all(currentMemberId) as any[];

    const records = rows.map((r) => {
      const timePart = (r.checked_in_at.split(' ')[1] || '18:00').slice(0, 5);
      return {
        id: r.id,
        member_id: r.member_id,
        branch_id: r.branch_id,
        checked_in_at: r.checked_in_at,
        check_date: r.check_date,
        date_jalali: toPersianDigits(toJalali(r.check_date)),
        time: toPersianDigits(timePart),
        method: r.method,
        result: r.result,
        branch: { id: r.branch_id, name: r.branch_name, slug: r.branch_slug },
      };
    });

    return { status: 200, body: { success: true, records } };
  }

  // ── 3. Branches ──
  if (endpoint === '/branches' && method === 'GET') {
    const rows = db.prepare('SELECT * FROM branches WHERE is_active = 1 ORDER BY id ASC').all() as any[];
    const branches = rows.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      address: b.address,
      phone: b.phone,
      gender_policy: b.gender_policy,
      is_active: !!b.is_active,
    }));
    return { status: 200, body: { success: true, branches } };
  }

  // ── 4. Staff Check-in & Turnstile Verification ──
  if (endpoint === '/checkin/scan' && method === 'POST') {
    const token = String(body?.token || '').trim();
    const branchId = Number(body?.branch_id || 1);

    let memberId = 101;
    if (token.includes('.')) {
      const [b64, sig] = token.split('.');
      try {
        const rawPayload = Buffer.from(b64, 'base64').toString('utf8');
        const expectedSig = crypto.createHmac('sha256', QR_SECRET).update(rawPayload).digest('hex');
        const parsed = JSON.parse(rawPayload);

        if (sig === expectedSig) {
          const nowSec = Math.floor(Date.now() / 1000);
          if (parsed.exp && parsed.exp < nowSec) {
            return {
              status: 400,
              body: {
                success: false,
                message: 'بارکد منقضی شده است (بیش از ۳۰ ثانیه).',
                data: { result: 'denied_invalid_qr', message: 'بارکد منقضی شده است.' },
              },
            };
          }
          const nonceRow = db.prepare('SELECT * FROM qr_nonces WHERE nonce = ?').get(parsed.nonce) as any;
          if (nonceRow?.used_at) {
            return {
              status: 400,
              body: {
                success: false,
                message: 'این بارکد قبلاً استفاده شده است.',
                data: { result: 'denied_invalid_qr', message: 'بارکد یک‌بارمصرف قبلاً اسکن شده است.' },
              },
            };
          }
          if (nonceRow) {
            db.prepare(`UPDATE qr_nonces SET used_at = datetime('now') WHERE id = ?`).run(nonceRow.id);
          }
          if (parsed.mid) memberId = Number(parsed.mid);
        }
      } catch {
        // Fallback for manual demo tokens
      }
    }

    const memberRow = db.prepare('SELECT * FROM members WHERE id = ?').get(memberId) as any;
    const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const todayDate = nowIso.slice(0, 10);

    const info = db.prepare(`
      INSERT INTO attendance (member_id, branch_id, membership_id, checked_in_at, check_date, method, result)
      VALUES (?, ?, 1, ?, ?, 'qr', 'approved')
    `).run(memberId, branchId, nowIso, todayDate);

    return {
      status: 200,
      body: {
        success: true,
        data: {
          result: 'approved',
          message: 'ورود با موفقیت ثبت شد. تمرین خوبی داشته باشید!',
          attendance_id: Number(info.lastInsertRowid),
          member: formatMember(memberRow),
        },
      },
    };
  }

  if (endpoint === '/checkin/search' && method === 'GET') {
    const q = (searchParams.get('q') || '').trim();
    const rows = db.prepare(`
      SELECT * FROM members
      WHERE first_name LIKE ? OR last_name LIKE ? OR mobile LIKE ? OR external_id LIKE ?
      LIMIT 20
    `).all(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`) as any[];

    return {
      status: 200,
      body: {
        success: true,
        members: rows.map(formatMember),
      },
    };
  }

  if (endpoint === '/checkin/member' && method === 'POST') {
    const memberId = Number(body?.member_id || 101);
    const branchId = Number(body?.branch_id || 1);
    const memberRow = db.prepare('SELECT * FROM members WHERE id = ?').get(memberId) as any;
    const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const todayDate = nowIso.slice(0, 10);

    const info = db.prepare(`
      INSERT INTO attendance (member_id, branch_id, membership_id, checked_in_at, check_date, method, result)
      VALUES (?, ?, 1, ?, ?, 'search', 'approved')
    `).run(memberId, branchId, nowIso, todayDate);

    return {
      status: 200,
      body: {
        success: true,
        data: {
          result: 'approved',
          message: 'ورود دستی با موفقیت ثبت گردید.',
          attendance_id: Number(info.lastInsertRowid),
          member: formatMember(memberRow),
        },
      },
    };
  }

  if (endpoint === '/checkin/override' && method === 'POST') {
    const memberId = Number(body?.member_id || 101);
    const branchId = Number(body?.branch_id || 1);
    const reason = String(body?.reason || 'تأیید پذیرش');
    const memberRow = db.prepare('SELECT * FROM members WHERE id = ?').get(memberId) as any;
    const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const todayDate = nowIso.slice(0, 10);

    const info = db.prepare(`
      INSERT INTO attendance (member_id, branch_id, membership_id, checked_in_at, check_date, method, result, override_reason)
      VALUES (?, ?, 1, ?, ?, 'manual', 'override', ?)
    `).run(memberId, branchId, nowIso, todayDate, reason);

    return {
      status: 200,
      body: {
        success: true,
        data: {
          result: 'override',
          message: 'ورود دستی با تأیید پذیرش (Override) ثبت گردید.',
          attendance_id: Number(info.lastInsertRowid),
          member: formatMember(memberRow),
        },
      },
    };
  }

  if (endpoint === '/checkin/today' && method === 'GET') {
    const branchId = Number(searchParams.get('branch_id') || 1);
    const rows = db.prepare(`
      SELECT a.*, b.name as branch_name, b.slug as branch_slug, m.first_name, m.last_name
      FROM attendance a
      LEFT JOIN branches b ON b.id = a.branch_id
      LEFT JOIN members m ON m.id = a.member_id
      WHERE a.branch_id = ?
      ORDER BY a.checked_in_at DESC
      LIMIT 50
    `).all(branchId) as any[];

    const records = rows.map((r) => {
      const timePart = (r.checked_in_at.split(' ')[1] || '18:00').slice(0, 5);
      return {
        id: r.id,
        member_id: r.member_id,
        member_name: `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'علیرضا محمدی',
        branch_id: r.branch_id,
        checked_in_at: r.checked_in_at,
        check_date: r.check_date,
        date_jalali: toPersianDigits(toJalali(r.check_date)),
        time: toPersianDigits(timePart),
        method: r.method,
        result: r.result,
        branch: { id: r.branch_id, name: r.branch_name, slug: r.branch_slug },
      };
    });

    return { status: 200, body: { success: true, records } };
  }

  // ── 5. Exercise & Diet Plans ──
  if (endpoint === '/me/plans' && method === 'GET') {
    const rows = db.prepare('SELECT * FROM member_plans WHERE member_id = ? ORDER BY id DESC').all(currentMemberId) as any[];
    const plans = rows.map((p) => ({
      ...p,
      created_at_jalali: toPersianDigits(toJalali((p.created_at || '2026-11-01').slice(0, 10))),
    }));
    return { status: 200, body: { success: true, plans } };
  }

  if (endpoint.startsWith('/staff/plans')) {
    if (method === 'GET') {
      const rows = db.prepare('SELECT * FROM member_plans ORDER BY id DESC').all() as any[];
      const plans = rows.map((p) => ({
        ...p,
        created_at_jalali: toPersianDigits(toJalali((p.created_at || '2026-11-01').slice(0, 10))),
      }));
      return { status: 200, body: { success: true, plans } };
    }

    if (method === 'POST') {
      const memberId = Number(body?.member_id || 101);
      const branchId = Number(body?.branch_id || 1);
      const planType = String(body?.plan_type || 'workout');
      const title = String(body?.title || 'برنامه ورزشی جدید');
      const validMonth = String(body?.valid_month || 'آبان ۱۴۰۵');
      const content = String(body?.content || '');
      const fileUrl = String(body?.file_url || '');
      const fileName = String(body?.file_name || '');
      const fileSize = String(body?.file_size || '');

      const info = db.prepare(`
        INSERT INTO member_plans (member_id, branch_id, trainer_id, plan_type, title, valid_month, content, file_url, file_name, file_size)
        VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
      `).run(memberId, branchId, planType, title, validMonth, content, fileUrl, fileName, fileSize);

      const created = db.prepare('SELECT * FROM member_plans WHERE id = ?').get(Number(info.lastInsertRowid)) as any;
      return {
        status: 200,
        body: {
          success: true,
          message: 'برنامه ماهانه با موفقیت ثبت شد.',
          plan: {
            ...created,
            created_at_jalali: toPersianDigits(toJalali((created.created_at || '2026-11-01').slice(0, 10))),
          },
        },
      };
    }

    if (method === 'DELETE') {
      const match = endpoint.match(/\/staff\/plans\/(\d+)/);
      if (match) {
        db.prepare('DELETE FROM member_plans WHERE id = ?').run(Number(match[1]));
      }
      return { status: 200, body: { success: true, message: 'برنامه با موفقیت حذف گردید.' } };
    }
  }

  // ── 6. Member Feedback & Management Replies ──
  if (endpoint === '/me/feedback') {
    if (method === 'GET') {
      const rows = db.prepare(`
        SELECT f.*, m.first_name, m.last_name, m.mobile
        FROM feedback f
        LEFT JOIN members m ON m.id = f.member_id
        WHERE f.member_id = ?
        ORDER BY f.id DESC
      `).all(currentMemberId) as any[];

      const feedback = rows.map((f) => ({
        ...f,
        created_at_jalali: toPersianDigits(toJalali((f.created_at || '2026-11-01').slice(0, 10))),
        responded_at_jalali: f.responded_at ? toPersianDigits(toJalali(f.responded_at.slice(0, 10))) : null,
        member_name: `${f.first_name || ''} ${f.last_name || ''}`.trim(),
        member_mobile: f.mobile,
      }));
      return { status: 200, body: { success: true, feedback } };
    }

    if (method === 'POST') {
      const category = String(body?.category || 'general');
      const rating = Math.min(5, Math.max(1, Number(body?.rating || 5)));
      const subject = String(body?.subject || '');
      const message = String(body?.message || '');
      const branchId = Number(body?.branch_id || 1);

      const info = db.prepare(`
        INSERT INTO feedback (member_id, branch_id, category, rating, subject, message, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `).run(currentMemberId, branchId, category, rating, subject, message);

      const f = db.prepare('SELECT * FROM feedback WHERE id = ?').get(Number(info.lastInsertRowid)) as any;
      return {
        status: 200,
        body: {
          success: true,
          message: 'نظر و بازخورد شما با تشکر ثبت گردید.',
          feedback: {
            ...f,
            created_at_jalali: toPersianDigits(toJalali((f.created_at || '2026-11-01').slice(0, 10))),
          },
        },
      };
    }
  }

  if (endpoint.startsWith('/admin/feedback')) {
    if (endpoint.includes('/reply') && method === 'POST') {
      const match = endpoint.match(/\/admin\/feedback\/(\d+)\/reply/);
      const id = match ? Number(match[1]) : 0;
      const responseText = String(body?.response || '');

      db.prepare(`
        UPDATE feedback
        SET staff_response = ?, status = 'responded', responded_by = 1, responded_at = datetime('now')
        WHERE id = ?
      `).run(responseText, id);

      const updated = db.prepare('SELECT * FROM feedback WHERE id = ?').get(id) as any;
      return {
        status: 200,
        body: {
          success: true,
          message: 'پاسخ مدیریت با موفقیت ثبت شد.',
          feedback: {
            ...updated,
            created_at_jalali: toPersianDigits(toJalali((updated?.created_at || '2026-11-01').slice(0, 10))),
            responded_at_jalali: toPersianDigits(toJalali(new Date().toISOString().slice(0, 10))),
          },
        },
      };
    }

    const rows = db.prepare(`
      SELECT f.*, m.first_name, m.last_name, m.mobile
      FROM feedback f
      LEFT JOIN members m ON m.id = f.member_id
      ORDER BY f.id DESC
    `).all() as any[];

    const feedback = rows.map((f) => ({
      ...f,
      created_at_jalali: toPersianDigits(toJalali((f.created_at || '2026-11-01').slice(0, 10))),
      responded_at_jalali: f.responded_at ? toPersianDigits(toJalali(f.responded_at.slice(0, 10))) : null,
      member_name: `${f.first_name || ''} ${f.last_name || ''}`.trim() || 'علیرضا محمدی',
      member_mobile: f.mobile || '09121111111',
    }));

    return { status: 200, body: { success: true, feedback } };
  }

  // ── 7. Consultation & Club Tour Leads ──
  if (endpoint === '/leads' && method === 'POST') {
    const fullName = String(body?.full_name || '').trim();
    const rawMobile = String(body?.mobile || '').trim();
    const branchSlug = String(body?.branch_slug || 'premium');
    const goal = String(body?.goal || 'تناسب اندام و بدنسازی');
    const notes = String(body?.notes || '');

    if (!fullName || !isValidIranianMobile(rawMobile)) {
      return {
        status: 400,
        body: { success: false, message: 'لطفاً نام و شماره موبایل معتبر وارد نمایید.' },
      };
    }

    const info = db.prepare(`
      INSERT INTO consultation_leads (full_name, mobile, branch_slug, goal, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(fullName, normalizePhone(rawMobile), branchSlug, goal, notes);

    return {
      status: 200,
      body: {
        success: true,
        lead_id: Number(info.lastInsertRowid),
        message: 'درخواست مشاوره و بازدید شما ثبت شد. کارشناسان شعبه به‌زودی با شما تماس می‌گیرند.',
      },
    };
  }

  if (endpoint === '/staff/leads' && method === 'GET') {
    const leads = db.prepare('SELECT * FROM consultation_leads ORDER BY id DESC LIMIT 100').all();
    return { status: 200, body: { success: true, leads } };
  }

  return { status: 404, body: { success: false, message: `Endpoint not found: ${method} ${endpoint}` } };
}
