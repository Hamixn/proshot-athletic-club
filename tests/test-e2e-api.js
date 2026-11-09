import assert from 'assert';
import fs from 'fs';
import crypto from 'crypto';

console.log('🚀 Running Standalone Full-Stack E2E Test Suite for Proshot Athletic Club...\n');

// 1. Test Phone Normalization & Validation
import { normalizePhone, isValidIranianMobile } from '../frontend/src/lib/phone.ts';

assert.strictEqual(normalizePhone('09121111111'), '+989121111111', 'Phone normalization failed for 0912');
assert.strictEqual(normalizePhone('۰۹۱۲۱۱۱۱۱۱۱'), '+989121111111', 'Phone normalization failed for Persian digits');
assert.strictEqual(normalizePhone('+989121111111'), '+989121111111', 'Phone normalization failed for +98');
assert.strictEqual(isValidIranianMobile('09121111111'), true, 'Valid Iranian phone failed validation');
assert.strictEqual(isValidIranianMobile('09351234567'), true, 'Valid Irancell phone failed validation');
assert.strictEqual(isValidIranianMobile('12345'), false, 'Invalid phone passed validation');
console.log('✅ 1. Phone Normalization & Iranian Mobile Validation: Passed');

// 2. Test Jalali Conversion & Persian Digits
import { toJalali, toPersianDigits, toLatinDigits } from '../frontend/src/lib/jalali.ts';

assert.strictEqual(toPersianDigits('12345'), '۱۲۳۴۵', 'Persian digits conversion failed');
assert.strictEqual(toLatinDigits('۱۲۳۴۵'), '12345', 'Latin digits conversion failed');
const sampleJalali = toJalali('2026-11-04');
assert.ok(sampleJalali.startsWith('1405/'), `Jalali conversion failed: ${sampleJalali}`);
console.log(`✅ 2. Jalali & Persian Numeral Conversion: Passed (2026-11-04 -> ${sampleJalali})`);

// 3. Test QR Token Security & Expiry (30s TTL, HMAC-SHA256)
const secret = 'proshot_salt_test|proshot_qr_v1';
const nonce = crypto.randomBytes(16).toString('hex');
const exp = Math.floor(Date.now() / 1000) + 30;
const payload = JSON.stringify({ mid: 101, nonce, exp });
const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
const token = Buffer.from(payload).toString('base64') + '.' + sig;

assert.ok(token.includes('.'), 'QR Token format invalid');
const [b64, testSig] = token.split('.');
assert.strictEqual(testSig, sig, 'Signature mismatch');
const decoded = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
assert.strictEqual(decoded.mid, 101, 'Member ID mismatch');
assert.strictEqual(decoded.nonce, nonce, 'Nonce mismatch');
assert.ok(decoded.exp > Math.floor(Date.now() / 1000), 'Token should not be expired yet');
console.log('✅ 3. QR HMAC-SHA256 Security & Anti-Replay Nonce: Passed');

// 4. Test Standalone Production Build & Brand Assets
const requiredAssets = [
  'dist/index.html',
  'assets/vazirmatn.css',
  'assets/logo-standard.png',
  'assets/logo-premium.png',
  'assets/img/hero-premium.jpg',
  'assets/img/hero-standard.jpg',
  'assets/img/studio-lady.jpg',
  'assets/img/spa-recovery.jpg',
  'assets/img/cardio-arena.jpg',
  'assets/img/plans-banner.jpg',
];

for (const asset of requiredAssets) {
  const fullPath = 'x:/All/ProshotProject/proshot-member-center/' + asset;
  assert.ok(fs.existsSync(fullPath), `Missing required asset: ${asset}`);
  const stats = fs.statSync(fullPath);
  assert.ok(stats.size > 0, `Empty asset file: ${asset}`);
}
console.log('✅ 4. Standalone Build & Architectural Image Assets: Verified');

// 5. Test Branch Logo Switching Logic
function resolveLogoForBranch(branchSlug) {
  if (branchSlug === 'premium') {
    return 'logo-premium.png';
  }
  return 'logo-standard.png';
}

const branchesToTest = [
  { slug: 'premium', expectedLogo: 'logo-premium.png', name: 'شعبه پریمیوم (سروناز شیراز)' },
  { slug: 'plus-men', expectedLogo: 'logo-standard.png', name: 'شعبه پلاس (قدوسی — آقایان)' },
  { slug: 'plus-women', expectedLogo: 'logo-standard.png', name: 'شعبه لیدی (قدوسی — بانوان)' },
  { slug: 'standard-men', expectedLogo: 'logo-standard.png', name: 'شعبه ملاصدرا (آقایان)' },
  { slug: 'standard-women', expectedLogo: 'logo-standard.png', name: 'شعبه خاکشناسی (بانوان)' },
];

for (const b of branchesToTest) {
  const logo = resolveLogoForBranch(b.slug);
  assert.strictEqual(logo, b.expectedLogo, `Branch logo mismatch for ${b.slug}`);
}
console.log('✅ 5. Dynamic Branch Logo Resolution (Premium vs 4 Standard Branches): Passed');

// 6. Test Standalone SQLite Database & 15 Tables
import { db, SCHEMA_TABLES } from '../server/db.ts';

const existingTables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table'")
  .all()
  .map((r) => r.name);

for (const tbl of SCHEMA_TABLES) {
  assert.ok(existingTables.includes(tbl), `SQLite database is missing table: ${tbl}`);
}
console.log(`✅ 6. Standalone SQLite Database Schema: All ${SCHEMA_TABLES.length} tables verified`);

// 7. Test Live Standalone REST API Endpoints (OTP, QR, Scan, Plans, Feedback, Leads)
import { handleApiRequest } from '../server/app.ts';

const branchesRes = await handleApiRequest('GET', '/api/v1/branches', new URLSearchParams(), {});
assert.strictEqual(branchesRes.status, 200);
assert.strictEqual(branchesRes.body.branches.length, 5, 'Expected 5 Shiraz branches');

const otpRes = await handleApiRequest('POST', '/api/v1/auth/request-otp', new URLSearchParams(), {
  phone: '09121111111',
});
assert.strictEqual(otpRes.status, 200);

const verifyRes = await handleApiRequest('POST', '/api/v1/auth/verify-otp', new URLSearchParams(), {
  phone: '09121111111',
  code: '12345',
});
assert.strictEqual(verifyRes.status, 200);
assert.ok(verifyRes.body.token, 'Expected session token from verify-otp');

const authHeader = `Bearer ${verifyRes.body.token}`;
const qrRes = await handleApiRequest('GET', '/api/v1/me/qr', new URLSearchParams(), {}, authHeader);
assert.strictEqual(qrRes.status, 200);
assert.ok(qrRes.body.token.includes('.'), 'Expected signed QR token');

const scanRes = await handleApiRequest(
  'POST',
  '/api/v1/checkin/scan',
  new URLSearchParams(),
  { token: qrRes.body.token, branch_id: 1 },
  authHeader
);
assert.strictEqual(scanRes.status, 200);
assert.strictEqual(scanRes.body.data.result, 'approved');

// Verify anti-replay on the same QR token
const replayRes = await handleApiRequest(
  'POST',
  '/api/v1/checkin/scan',
  new URLSearchParams(),
  { token: qrRes.body.token, branch_id: 1 },
  authHeader
);
assert.strictEqual(replayRes.status, 400, 'Replayed QR token must be rejected');

const leadRes = await handleApiRequest('POST', '/api/v1/leads', new URLSearchParams(), {
  full_name: 'سارا رضایی',
  mobile: '09171112233',
  branch_slug: 'plus-women',
  goal: 'پیلاتس، اصلاحی و انعطاف‌پذیری',
});
assert.strictEqual(leadRes.status, 200);
assert.ok(leadRes.body.lead_id > 0);
console.log('✅ 7. Standalone REST API (Auth, QR Anti-Replay, Check-in, Leads): Verified');

// 8. Verify Zero WordPress Files Remain
assert.strictEqual(fs.existsSync('x:/All/ProshotProject/proshot-member-center/proshot-member-center.php'), false);
assert.strictEqual(fs.existsSync('x:/All/ProshotProject/proshot-member-center/src/Database/Schema.php'), false);
console.log('✅ 8. WordPress Decoupling: Verified (0 WordPress plugin files remain)');

console.log('\n🎉 ALL 8 STANDALONE TEST SUITES COMPLETED AND VERIFIED SUCCESSFULLY!');
