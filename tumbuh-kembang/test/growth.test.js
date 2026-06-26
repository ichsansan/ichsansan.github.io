const test = require('node:test');
const assert = require('node:assert');
const WHO = require('../js/who-data.js');

function z(value, { L, M, S }) {
  return L === 0 ? Math.log(value / M) / S : (Math.pow(value / M, L) - 1) / (L * S);
}

// ---------- Anchor kebenaran data WHO ----------

test('WHO data: boys WFA median (M) at 12 months → z ≈ 0', () => {
  const lms = WHO.wfa.L["12"];
  assert.ok(Math.abs(z(lms.M, lms)) < 1e-9);
});

test('WHO data: boys WFA -2SD line at 12 months ≈ 7.7 kg', () => {
  assert.ok(Math.abs(z(7.7, WHO.wfa.L["12"]) + 2) < 0.15);
});

test('WHO data: girls length-for-age median at 24 months sanity (70–90 cm)', () => {
  const M = WHO.lhfa.P["24"].M;
  assert.ok(M > 70 && M < 90, `M=${M}`);
});

test('WHO data: boys head-circumference median at 0 month sanity (33–36 cm)', () => {
  const M = WHO.hcfa.L["0"].M;
  assert.ok(M > 33 && M < 36, `M=${M}`);
});

test('WHO data: all age tables have keys 0..24', () => {
  for (const ind of ['wfa', 'lhfa', 'hcfa', 'bfa']) {
    for (const sex of ['L', 'P']) {
      for (let m = 0; m <= 24; m++) {
        assert.ok(WHO[ind][sex][String(m)], `${ind}.${sex}.${m} missing`);
      }
    }
  }
});

test('WHO data: wfl tables have keys 45..95', () => {
  for (const sex of ['L', 'P']) {
    for (let l = 45; l <= 95; l++) {
      assert.ok(WHO.wfl[sex][String(l)], `wfl.${sex}.${l} missing`);
    }
  }
});

// ---------- Fungsi Growth (diisi di Task 3) ----------

const Growth = require('../js/growth.js');

test('ageInMonths: 0 hari = 0 bulan', () => {
  assert.strictEqual(Growth.ageInMonths('2025-01-01', '2025-01-01'), 0);
});

test('ageInMonths: ~12 bulan', () => {
  const m = Growth.ageInMonths('2024-01-01', '2025-01-01');
  assert.ok(Math.abs(m - 12) < 0.2, `m=${m}`);
});

test('bmi: 10kg, 75cm → ~17.78', () => {
  assert.ok(Math.abs(Growth.bmi(10, 75) - 17.78) < 0.02);
});

test('zScore: nilai = M → 0', () => {
  assert.ok(Math.abs(Growth.zScore(9.6479, { L: 0.1, M: 9.6479, S: 0.1 })) < 1e-9);
});

test('lmsFor: interpolasi di tengah dua bulan', () => {
  const a = WHO.wfa.L["12"], b = WHO.wfa.L["13"];
  const mid = Growth.lmsFor('wfa', 'L', 12.5);
  assert.ok(Math.abs(mid.M - (a.M + b.M) / 2) < 1e-6);
});

test('lmsFor: di luar rentang → null', () => {
  assert.strictEqual(Growth.lmsFor('wfa', 'L', 30), null);
});

test('classify wfa: z=0 → normal hijau aman', () => {
  const c = Growth.classify('wfa', 0);
  assert.strictEqual(c.zone, 'green');
  assert.strictEqual(c.safe, true);
});

test('classify wfa: z=-2.5 → kurang kuning tidak aman', () => {
  const c = Growth.classify('wfa', -2.5);
  assert.strictEqual(c.zone, 'yellow');
  assert.strictEqual(c.safe, false);
});

test('classify wfa: z=-3.5 → sangat kurang merah', () => {
  assert.strictEqual(Growth.classify('wfa', -3.5).zone, 'red');
});

test('classify lhfa: z=-2.5 → pendek kuning', () => {
  assert.strictEqual(Growth.classify('lhfa', -2.5).zone, 'yellow');
});

test('classify bfa: z=2.5 → gizi lebih oranye', () => {
  assert.strictEqual(Growth.classify('bfa', 2.5).zone, 'orange');
});

test('classify bfa: z=3.5 → obesitas merah', () => {
  assert.strictEqual(Growth.classify('bfa', 3.5).zone, 'red');
});

test('classify hcfa: z=0 hijau, z=-2.5 merah', () => {
  assert.strictEqual(Growth.classify('hcfa', 0).zone, 'green');
  assert.strictEqual(Growth.classify('hcfa', -2.5).zone, 'red');
});

test('evaluate: boy 12mo 7.7kg wfa → z≈-2 zone yellow', () => {
  const e = Growth.evaluate('wfa', 'L', 12, 7.7);
  assert.ok(Math.abs(e.z + 2) < 0.15);
  assert.strictEqual(e.zone, 'yellow');
});

test('interpret: skip indikator tanpa data', () => {
  const child = { jenisKelamin: 'L', tanggalLahir: '2024-01-01' };
  const meas = { tanggalUkur: '2025-01-01', beratKg: 9.6, tinggiCm: null, lingkarKepalaCm: null };
  const res = Growth.interpret(child, meas);
  const inds = res.map(r => r.indicator);
  assert.ok(inds.includes('wfa'));
  assert.ok(!inds.includes('hcfa'));
});
