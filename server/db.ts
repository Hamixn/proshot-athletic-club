import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const DB_PATH = path.join(DATA_DIR, 'proshot.sqlite');
export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode and foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

export const SCHEMA_TABLES = [
  'branches',
  'members',
  'memberships',
  'member_branch_access',
  'attendance',
  'qr_nonces',
  'devices',
  'sync_jobs',
  'sync_conflicts',
  'notifications',
  'audit_logs',
  'otp_codes',
  'member_plans',
  'feedback',
  'consultation_leads',
] as const;

export function initDatabase(): void {
  db.exec(`
    -- 1. Branches
    CREATE TABLE IF NOT EXISTS branches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      address TEXT DEFAULT NULL,
      phone TEXT DEFAULT NULL,
      gender_policy TEXT NOT NULL DEFAULT 'mixed',
      is_active INTEGER NOT NULL DEFAULT 1,
      settings TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 2. Members
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      external_id TEXT UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      mobile_normalized TEXT NOT NULL UNIQUE,
      national_code TEXT DEFAULT NULL,
      gender TEXT DEFAULT NULL,
      date_of_birth TEXT DEFAULT NULL,
      profile_image_url TEXT DEFAULT NULL,
      is_verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 3. Memberships
    CREATE TABLE IF NOT EXISTS memberships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      branch_id INTEGER NOT NULL,
      external_id TEXT UNIQUE,
      plan_name TEXT DEFAULT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      starts_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      freeze_starts_at TEXT DEFAULT NULL,
      freeze_ends_at TEXT DEFAULT NULL,
      freeze_reason TEXT DEFAULT NULL,
      is_current INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 4. Member Branch Access
    CREATE TABLE IF NOT EXISTS member_branch_access (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      branch_id INTEGER NOT NULL,
      granted_by INTEGER DEFAULT NULL,
      granted_at TEXT NOT NULL DEFAULT (datetime('now')),
      revoked_at TEXT DEFAULT NULL
    );

    -- 5. Attendance
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      branch_id INTEGER NOT NULL,
      membership_id INTEGER DEFAULT NULL,
      checked_in_at TEXT NOT NULL,
      check_date TEXT NOT NULL,
      method TEXT NOT NULL DEFAULT 'qr',
      result TEXT NOT NULL,
      override_reason TEXT DEFAULT NULL,
      verified_by INTEGER DEFAULT NULL,
      device_id INTEGER DEFAULT NULL,
      qr_nonce_id INTEGER DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 6. QR Nonces
    CREATE TABLE IF NOT EXISTS qr_nonces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      nonce TEXT NOT NULL UNIQUE,
      token TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      used_at TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 7. Devices
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      device_token TEXT NOT NULL UNIQUE,
      device_type TEXT NOT NULL DEFAULT 'reception',
      is_active INTEGER NOT NULL DEFAULT 1,
      last_seen_at TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 8. Sync Jobs
    CREATE TABLE IF NOT EXISTS sync_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      total_records INTEGER DEFAULT 0,
      processed_records INTEGER DEFAULT 0,
      failed_records INTEGER DEFAULT 0,
      error_message TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 9. Sync Conflicts
    CREATE TABLE IF NOT EXISTS sync_conflicts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sync_job_id INTEGER DEFAULT NULL,
      member_id INTEGER DEFAULT NULL,
      external_id TEXT DEFAULT NULL,
      conflict_type TEXT NOT NULL,
      resolution TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 10. Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id INTEGER DEFAULT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'announcement',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 11. Audit Logs
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER DEFAULT NULL,
      action TEXT NOT NULL,
      entity_type TEXT DEFAULT NULL,
      entity_id INTEGER DEFAULT NULL,
      branch_id INTEGER DEFAULT NULL,
      details TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 12. OTP Codes
    CREATE TABLE IF NOT EXISTS otp_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mobile_normalized TEXT NOT NULL,
      code TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 5,
      expires_at INTEGER NOT NULL,
      verified_at TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 13. Monthly Exercise & Diet Plans
    CREATE TABLE IF NOT EXISTS member_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      branch_id INTEGER NOT NULL,
      trainer_id INTEGER DEFAULT 1,
      plan_type TEXT NOT NULL DEFAULT 'workout',
      title TEXT NOT NULL,
      valid_month TEXT NOT NULL,
      content TEXT DEFAULT NULL,
      file_url TEXT DEFAULT NULL,
      file_name TEXT DEFAULT NULL,
      file_size TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 14. Member Feedback & Reviews
    CREATE TABLE IF NOT EXISTS feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL,
      branch_id INTEGER NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      rating INTEGER NOT NULL DEFAULT 5,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      staff_response TEXT DEFAULT NULL,
      responded_by INTEGER DEFAULT NULL,
      responded_at TEXT DEFAULT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- 15. Prospective Member Consultation & Tour Leads
    CREATE TABLE IF NOT EXISTS consultation_leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      branch_slug TEXT NOT NULL,
      goal TEXT NOT NULL,
      notes TEXT DEFAULT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seedInitialData();
}

function seedInitialData(): void {
  const branchCount = db.prepare('SELECT COUNT(*) as cnt FROM branches').get() as { cnt: number };
  if (branchCount.cnt === 0) {
    const insertBranch = db.prepare(`
      INSERT INTO branches (name, slug, address, phone, gender_policy, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `);
    insertBranch.run(
      'پریمیوم (سروناز)',
      'premium',
      'شیراز، بلوار ارم، خیابان جهاد سازندگی، خیابان سروناز',
      '07138440107',
      'mixed'
    );
    insertBranch.run(
      'پلاس (قدوسی — آقایان)',
      'plus-men',
      'شیراز، میدان مطهری، ابتدای بلوار قدوسی شرقی، مجتمع تجاری سلطانیه',
      '07138440107',
      'men'
    );
    insertBranch.run(
      'لیدی (قدوسی — بانوان)',
      'plus-women',
      'شیراز، میدان مطهری، ابتدای بلوار قدوسی شرقی، مجتمع تجاری سلطانیه',
      '07138440112',
      'women'
    );
    insertBranch.run(
      'ملاصدرا (آقایان)',
      'standard-men',
      'شیراز، خیابان ملاصدرا، خیابان جمالی',
      '07136473300',
      'men'
    );
    insertBranch.run(
      'خاکشناسی (بانوان)',
      'standard-women',
      'شیراز، خیابان خاکشناسی، کوچه ۷',
      '07132283545',
      'women'
    );
  }

  const memberCount = db.prepare('SELECT COUNT(*) as cnt FROM members').get() as { cnt: number };
  if (memberCount.cnt === 0) {
    db.prepare(`
      INSERT INTO members (id, external_id, first_name, last_name, mobile, mobile_normalized, national_code, gender, is_verified)
      VALUES (101, 'GYM-8891', 'علیرضا', 'محمدی', '09121111111', '+989121111111', '0012345678', 'male', 1)
    `).run();

    db.prepare(`
      INSERT INTO memberships (member_id, branch_id, external_id, plan_name, status, starts_at, expires_at, is_current)
      VALUES (101, 1, 'MEM-9921', 'اشتراک ۳ ماهه شعبه پریمیوم (سروناز)', 'active', '2026-10-01', '2027-02-01', 1)
    `).run();

    const insertAtt = db.prepare(`
      INSERT INTO attendance (member_id, branch_id, membership_id, checked_in_at, check_date, method, result)
      VALUES (?, ?, 1, ?, ?, 'qr', 'approved')
    `);
    insertAtt.run(101, 1, '2026-11-03 18:30:00', '2026-11-03');
    insertAtt.run(101, 1, '2026-11-01 19:15:00', '2026-11-01');
    insertAtt.run(101, 2, '2026-10-28 17:00:00', '2026-10-28');

    const insertPlan = db.prepare(`
      INSERT INTO member_plans (member_id, branch_id, trainer_id, plan_type, title, valid_month, content, file_name, file_size, created_at)
      VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertPlan.run(
      101,
      1,
      'workout',
      'برنامه هایپرتروفی بالاتنه و پایین‌تنه (فاز ۱)',
      'آبان ۱۴۰۵',
      `### روز اول: سینه و جلو بازو\n- پرس سینه هالتر: ۴ ست × ۸ الی ۱۰ تکرار (استراحت ۹۰ ثانیه)\n- بالاسینه دمبل موازی: ۳ ست × ۱۲ تکرار (استراحت ۶۰ ثانیه)\n- کراس اور سیم‌کش از پایین: ۳ ست × ۱۵ تکرار با تمرکز بر انقباض\n- جلو بازو هالتر EZ ایستاده: ۴ ست × ۱۰ تکرار\n- جلو بازو لاری دمبل تک‌دست: ۳ ست × ۱۲ تکرار\n\n### روز دوم: پشت و سرشانه\n- بارفیکس دست باز: ۴ ست تا حد ناتوانی\n- زیربغل هالتر خم: ۴ ست × ۸ تکرار\n- سرشانه پرس دمبل نشسته: ۴ ست × ۱۰ تکرار\n- نشر از جانب دمبل: ۴ ست × ۱۵ تکرار (دراپ‌ست در ست آخر)\n\n### روز سوم: پا و عضلات مرکزی\n- اسکات هالتر از پشت: ۴ ست × ۸ تکرار با عمق استاندارد\n- پرس پا دستگاه زاویه‌دار: ۳ ست × ۱۲ تکرار\n- پشت پا دستگاه خوابیده: ۴ ست × ۱۲ تکرار\n- پلانک شکم: ۳ ست × ۶۰ ثانیه`,
      'Workout-Phase1-Nov2026.pdf',
      '1.2 MB',
      '2026-11-01 10:00:00'
    );

    insertPlan.run(
      101,
      1,
      'diet',
      'رژیم غذایی افزایش حجم خالص عضلانی (۲۹۰۰ کالری)',
      'آبان ۱۴۰۵',
      `### صبحانه (ساعت ۸:۰۰)\n- ۵ عدد سفیده تخم‌مرغ + ۲ عدد تخم‌مرغ کامل\n- ۸۰ گرم جو دوسر پرک همراه با شیر کم‌چرب و دارچین\n- ۱ عدد موز متوسط و یک قاشق عسل طبیعی\n\n### میان‌وعده صبح (ساعت ۱۱:۰۰)\n- ۱ پیمانه پروتئین وی با آب سرد\n- ۳۰ گرم مغز بادام خام یا گردو\n\n### ناهار (ساعت ۱۳:۳۰)\n- ۲۰۰ گرم سینه مرغ گریل شده یا استیک فیله گوساله\n- ۱۵۰ گرم برنج کته قهوه‌ای یا سفید\n- یک بشقاب بزرگ سالاد سبزیجات همراه با روغن زیتون فرابکر\n\n### وعده قبل و بعد تمرین (ساعت ۱۷:۰۰ و ۱۹:۳۰)\n- قبل تمرین: ۱ عدد سیب + یک فنجان قهوه اسپرسو دوبل\n- بعد تمرین: ۱ اسکوپ وی ایزوله + ۵ گرم کراتین مونوهیدرات\n\n### شام (ساعت ۲۱:۳۰)\n- ۲۰۰ گرم ماهی قزل‌آلا یا سالمون پخته‌شده\n- سیب‌زمینی تنوری ۱۵۰ گرم همراه با بروکلی بخارپز`,
      'Diet-Hypertrophy-Nov2026.pdf',
      '850 KB',
      '2026-11-01 11:30:00'
    );

    db.prepare(`
      INSERT INTO feedback (member_id, branch_id, category, rating, subject, message, status, staff_response, responded_by, responded_at, created_at)
      VALUES (
        101, 1, 'facilities', 5,
        'کیفیت فوق‌العاده دستگاه‌های بخش پرمیوم',
        'دستگاه‌های لاین جدید پندولوم و هک‌اسکات بسیار ارگونومیک هستند و زاویه عالی دارند. تشکر از مدیریت باشگاه.',
        'responded',
        'سلام و درود جناب محمدی عزیز. رضایت اعضای گرانقدر اولویت اول باشگاه پروشات است. به زودی لاین تخصصی دیگری نیز افزوده خواهد شد.',
        1, '2026-11-02 12:00:00', '2026-11-01 16:00:00'
      )
    `).run();
  }
}
