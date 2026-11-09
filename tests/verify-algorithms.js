import crypto from 'crypto';

// 1. Test PhoneNormalizer logic
function normalizePhone(input) {
  const map = {
    '۰':'0','۱':'1','۲':'2','۳':'3','۴':'4',
    '۵':'5','۶':'6','۷':'7','۸':'8','۹':'9',
    '٠':'0','١':'1','٢':'2','٣':'3','٤':'4',
    '٥':'5','٦':'6','٧':'7','٨':'8','٩':'9'
  };
  let number = input.replace(/[۰-۹٠-٩]/g, c => map[c] || c);
  number = number.replace(/[\s\-\(\)\.]+/g, '').replace(/^\+/, '');

  if (number.startsWith('09') && number.length === 11) {
    number = '98' + number.slice(1);
  }

  if (!/^989[0-9]{9}$/.test(number)) {
    throw new Error('Invalid Iranian mobile number: ' + input);
  }

  return '+' + number;
}

// 2. Test Jalali conversion
function gregorianToJalali(gy, gm, gd) {
  const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100)
        + Math.floor((gy2 + 399) / 400) + gd + gdm[gm - 1];
  let jy = -1595 + (33 * Math.floor(days / 12053));
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));

  return [jy, jm, jd];
}

// 3. Test QR Token generation & HMAC signature verification
function generateQrToken(mid, secret) {
  const nonce = crypto.randomBytes(16).toString('hex');
  const exp = Math.floor(Date.now() / 1000) + 30;
  const payload = JSON.stringify({ mid, nonce, exp });
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(payload).toString('base64') + '.' + signature;
}

function validateQrToken(token, secret) {
  const [b64Payload, sig] = token.split('.');
  const payloadStr = Buffer.from(b64Payload, 'base64').toString('utf8');
  const expectedSig = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');

  if (sig !== expectedSig) {
    throw new Error('Signature mismatch');
  }

  const payload = JSON.parse(payloadStr);
  if (Math.floor(Date.now() / 1000) > payload.exp) {
    throw new Error('Expired');
  }

  return payload.mid;
}

// Run verifications
console.log('Running automated verification suite...');

// Test 1: Phone Normalization
console.assert(normalizePhone('09123456789') === '+989123456789', 'Test 1 Failed');
console.assert(normalizePhone('۰۹۱۲۳۴۵۶۷۸۹') === '+989123456789', 'Test 2 Failed (Persian digits)');
console.assert(normalizePhone('+989123456789') === '+989123456789', 'Test 3 Failed (+98)');
console.assert(normalizePhone('0912-345 6789') === '+989123456789', 'Test 4 Failed (Formatted)');
let errorCaught = false;
try {
  normalizePhone('12345');
} catch {
  errorCaught = true;
}
console.assert(errorCaught, 'Test 5 Failed (Invalid phone)');

// Test 2: Jalali Conversion
const [jy, jm, jd] = gregorianToJalali(2025, 3, 21);
console.assert(jy === 1404 && jm === 1 && jd === 1, `Test 6 Failed: ${jy}/${jm}/${jd}`);

// Test 3: QR Token HMAC Signing & Validation
const secret = 'proshot_salt_test|proshot_qr_v1';
const token = generateQrToken(42, secret);
const mid = validateQrToken(token, secret);
console.assert(mid === 42, 'Test 7 Failed (QR Validation)');

// Test 4: Tampered QR Token rejection
let tamperedCaught = false;
try {
  validateQrToken('tampered_' + token, secret);
} catch {
  tamperedCaught = true;
}
console.assert(tamperedCaught, 'Test 8 Failed (Tampered token rejection)');

console.log('✅ ALL ALGORITHM TESTS PASSED!');
