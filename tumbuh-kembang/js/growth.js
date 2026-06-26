(function (root, factory) {
  const isNode = (typeof module !== 'undefined' && module.exports);
  const WHO = isNode ? require('./who-data.js') : root.WHO_DATA;
  const api = factory(WHO);
  if (isNode) module.exports = api;
  else root.Growth = api;
})(typeof self !== 'undefined' ? self : this, function (WHO_DATA) {

  const MS_PER_DAY = 86400000;
  const DAYS_PER_MONTH = 30.4375;

  // aturan zona per indikator: ambang batas atas (z) → {zone,label}; dicek berurutan
  const ZONE_RULES = {
    wfa: [
      { lt: -3, zone: 'red',    label: 'Berat badan sangat kurang' },
      { lt: -2, zone: 'yellow', label: 'Berat badan kurang' },
      { lt: 1,  zone: 'green',  label: 'Berat badan normal' },
      { lt: Infinity, zone: 'yellow', label: 'Risiko berat badan lebih' }
    ],
    lhfa: [
      { lt: -3, zone: 'red',    label: 'Sangat pendek (stunting berat)' },
      { lt: -2, zone: 'yellow', label: 'Pendek (stunting)' },
      { lt: 3,  zone: 'green',  label: 'Normal' },
      { lt: Infinity, zone: 'yellow', label: 'Tinggi' }
    ],
    hcfa: [
      { lt: -2, zone: 'red',    label: 'Mikrosefali' },
      { lt: 2,  zone: 'green',  label: 'Normal' },
      { lt: Infinity, zone: 'red', label: 'Makrosefali' }
    ],
    wfl: [
      { lt: -3, zone: 'red',    label: 'Gizi buruk' },
      { lt: -2, zone: 'yellow', label: 'Gizi kurang' },
      { lt: 1,  zone: 'green',  label: 'Gizi baik (normal)' },
      { lt: 2,  zone: 'yellow', label: 'Berisiko gizi lebih' },
      { lt: 3,  zone: 'orange', label: 'Gizi lebih' },
      { lt: Infinity, zone: 'red', label: 'Obesitas' }
    ],
    bfa: [
      { lt: -3, zone: 'red',    label: 'Gizi buruk' },
      { lt: -2, zone: 'yellow', label: 'Gizi kurang' },
      { lt: 1,  zone: 'green',  label: 'Gizi baik (normal)' },
      { lt: 2,  zone: 'yellow', label: 'Berisiko gizi lebih' },
      { lt: 3,  zone: 'orange', label: 'Gizi lebih' },
      { lt: Infinity, zone: 'red', label: 'Obesitas' }
    ]
  };

  // indikator → fungsi pengambil nilai pengukuran & sumbu-x
  const INDICATOR_AXIS = {
    wfa:  { value: (m) => m.beratKg,         x: (m, age) => age },
    lhfa: { value: (m) => m.tinggiCm,        x: (m, age) => age },
    hcfa: { value: (m) => m.lingkarKepalaCm, x: (m, age) => age },
    bfa:  { value: (m) => (m.beratKg && m.tinggiCm) ? bmi(m.beratKg, m.tinggiCm) : null, x: (m, age) => age },
    wfl:  { value: (m) => m.beratKg,         x: (m) => m.tinggiCm }
  };

  const INDICATOR_TITLES = {
    wfa: 'Berat / Umur', lhfa: 'Tinggi / Umur', hcfa: 'Lingkar Kepala / Umur',
    wfl: 'Berat / Panjang', bfa: 'IMT / Umur'
  };

  function ageInMonths(birthISO, measureISO) {
    const days = (Date.parse(measureISO) - Date.parse(birthISO)) / MS_PER_DAY;
    return days / DAYS_PER_MONTH;
  }

  function bmi(weightKg, heightCm) {
    return weightKg / Math.pow(heightCm / 100, 2);
  }

  function lmsFor(indicator, sex, x) {
    const table = WHO_DATA[indicator] && WHO_DATA[indicator][sex];
    if (!table) return null;
    const lo = Math.floor(x), hi = Math.ceil(x);
    const a = table[String(lo)], b = table[String(hi)];
    if (!a || !b) return null;
    if (lo === hi) return { L: a.L, M: a.M, S: a.S };
    const t = (x - lo) / (hi - lo);
    return {
      L: a.L + (b.L - a.L) * t,
      M: a.M + (b.M - a.M) * t,
      S: a.S + (b.S - a.S) * t
    };
  }

  function zScore(value, lms) {
    return lms.L === 0
      ? Math.log(value / lms.M) / lms.S
      : (Math.pow(value / lms.M, lms.L) - 1) / (lms.L * lms.S);
  }

  function classify(indicator, z) {
    const rules = ZONE_RULES[indicator];
    for (const r of rules) {
      if (z < r.lt) return { category: r.label, zone: r.zone, label: r.label, safe: r.zone === 'green' };
    }
    const last = rules[rules.length - 1];
    return { category: last.label, zone: last.zone, label: last.label, safe: last.zone === 'green' };
  }

  function evaluate(indicator, sex, x, value) {
    if (value == null || x == null) return null;
    const lms = lmsFor(indicator, sex, x);
    if (!lms) return null;
    const z = zScore(value, lms);
    return Object.assign({ z }, classify(indicator, z));
  }

  function interpret(child, measurement) {
    const age = ageInMonths(child.tanggalLahir, measurement.tanggalUkur);
    const out = [];
    for (const ind of ['wfa', 'lhfa', 'hcfa', 'wfl', 'bfa']) {
      const axis = INDICATOR_AXIS[ind];
      const value = axis.value(measurement);
      const x = axis.x(measurement, age);
      const ev = evaluate(ind, child.jenisKelamin, x, value);
      if (ev) out.push(Object.assign({ indicator: ind, title: INDICATOR_TITLES[ind] }, ev));
    }
    return out;
  }

  return { ageInMonths, bmi, lmsFor, zScore, classify, evaluate, interpret,
           ZONE_RULES, INDICATOR_AXIS, INDICATOR_TITLES };
});
