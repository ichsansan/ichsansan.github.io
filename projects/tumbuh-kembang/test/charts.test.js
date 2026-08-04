const test = require('node:test');
const assert = require('node:assert');
const Charts = require('../js/charts.js');
const WHO = require('../js/who-data.js');

test('indicatorDomain: wfa umur 0..24', () => {
  const d = Charts.indicatorDomain('wfa');
  assert.strictEqual(d.from, 0); assert.strictEqual(d.to, 24);
});

test('indicatorDomain: wfl panjang 45..95', () => {
  const d = Charts.indicatorDomain('wfl');
  assert.strictEqual(d.from, 45); assert.strictEqual(d.to, 95);
});

test('referenceLine: z=0 menghasilkan ~ median M', () => {
  const line = Charts.referenceLine('wfa', 'L', 0);
  const p = line.find(pt => pt.x === 12);
  assert.ok(Math.abs(p.y - WHO.wfa.L["12"].M) < 1e-6);
});

test('buildBandDatasets: ada 7 garis z', () => {
  const ds = Charts.buildBandDatasets('wfa', 'L');
  assert.strictEqual(ds.length, 7);
});

test('childPoints: titik di luar hijau dapat zone non-green', () => {
  const child = { jenisKelamin: 'L', tanggalLahir: '2024-01-01' };
  const meas = [{ tanggalUkur: '2025-01-01', beratKg: 7.7, tinggiCm: null, lingkarKepalaCm: null }];
  const pts = Charts.childPoints('wfa', 'L', meas, child);
  assert.strictEqual(pts.length, 1);
  assert.strictEqual(pts[0].zone, 'yellow');
});

test('buildChartConfig: type line dan ada dataset anak', () => {
  const child = { jenisKelamin: 'L', tanggalLahir: '2024-01-01' };
  const cfg = Charts.buildChartConfig('wfa', 'L', [], child);
  assert.strictEqual(cfg.type, 'line');
  assert.ok(cfg.data.datasets.length >= 8); // 7 band + 1 anak
});
