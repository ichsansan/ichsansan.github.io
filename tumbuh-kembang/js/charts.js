(function (root, factory) {
  const isNode = (typeof module !== 'undefined' && module.exports);
  const WHO = isNode ? require('./who-data.js') : root.WHO_DATA;
  const Growth = isNode ? require('./growth.js') : root.Growth;
  const api = factory(WHO, Growth);
  if (isNode) module.exports = api;
  else root.Charts = api;
})(typeof self !== 'undefined' ? self : this, function (WHO_DATA, Growth) {

  const DOMAINS = {
    wfa:  { from: 0,  to: 24, step: 1 },
    lhfa: { from: 0,  to: 24, step: 1 },
    hcfa: { from: 0,  to: 24, step: 1 },
    bfa:  { from: 0,  to: 24, step: 1 },
    wfl:  { from: 45, to: 95, step: 1 }
  };

  // warna isian band antar dua garis z berurutan.
  // index i = area antara garis Z_LINES[i-1] dan Z_LINES[i].
  // urut Z_LINES: [-3,-2,-1,0,1,2,3] → fill index 1..6 = (-3..-2),(-2..-1),(-1..0),(0..1),(1..2),(2..3)
  const BAND_FILL = ['#f6c2bd', '#fdeebd', '#cdeccb', '#cdeccb', '#cdeccb', '#fdeebd', '#fdeebd'];
  const Z_LINES = [-3, -2, -1, 0, 1, 2, 3];
  const ZONE_COLOR = { green: '#1f9e8e', yellow: '#caa007', orange: '#d97a25', red: '#cc352d' };

  function indicatorDomain(indicator) { return DOMAINS[indicator]; }

  function invLMS(lms, z) {
    return lms.L === 0 ? lms.M * Math.exp(lms.S * z) : lms.M * Math.pow(1 + lms.L * lms.S * z, 1 / lms.L);
  }

  function referenceLine(indicator, sex, zTarget) {
    const d = DOMAINS[indicator];
    const pts = [];
    for (let x = d.from; x <= d.to; x += d.step) {
      const lms = Growth.lmsFor(indicator, sex, x);
      if (lms) pts.push({ x, y: invLMS(lms, zTarget) });
    }
    return pts;
  }

  function buildBandDatasets(indicator, sex) {
    return Z_LINES.map((z, i) => ({
      label: 'z' + (z >= 0 ? '+' + z : z),
      data: referenceLine(indicator, sex, z),
      borderColor: z === 0 ? 'rgba(90,80,70,.6)' : 'rgba(120,110,100,.35)',
      borderWidth: z === 0 ? 1.6 : 1,
      pointRadius: 0,
      fill: i === 0 ? false : { target: '-1', above: BAND_FILL[i] },
      tension: 0.3,
      order: 1,
      zTag: z > 0 ? '+' + z : String(z),
      zTagColor: z === 0 ? '#3a2f28' : 'rgba(90,80,70,.85)'
    }));
  }

  // plugin inline: menggambar penanda garis SD (-3..+3) di ujung kanan tiap garis
  const SD_LABEL_PLUGIN = {
    id: 'sdLabels',
    afterDatasetsDraw(chart) {
      const ctx = chart.ctx;
      ctx.save();
      ctx.font = '700 11px Nunito, system-ui, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      chart.data.datasets.forEach((ds, i) => {
        if (!ds.zTag) return;
        const meta = chart.getDatasetMeta(i);
        if (!meta || !meta.data || !meta.data.length) return;
        const pt = meta.data[meta.data.length - 1];
        ctx.fillStyle = ds.zTagColor || 'rgba(90,80,70,.85)';
        ctx.fillText(ds.zTag, pt.x + 4, pt.y);
      });
      ctx.restore();
    }
  };

  function childPoints(indicator, sex, measurements, child) {
    const axis = Growth.INDICATOR_AXIS[indicator];
    const out = [];
    for (const m of measurements) {
      const age = Growth.ageInMonths(child.tanggalLahir, m.tanggalUkur);
      const value = axis.value(m);
      const x = axis.x(m, age);
      const ev = Growth.evaluate(indicator, sex, x, value);
      if (ev && x != null) out.push({ x: Math.round(x * 100) / 100, y: value, zone: ev.zone });
    }
    return out.sort((a, b) => a.x - b.x);
  }

  function buildChartConfig(indicator, sex, measurements, child) {
    const bands = buildBandDatasets(indicator, sex);
    const pts = childPoints(indicator, sex, measurements, child);
    const childDataset = {
      label: 'Anak',
      data: pts,
      borderColor: '#1b2733',
      borderWidth: 3,
      pointRadius: 6,
      pointHoverRadius: 9,
      pointBackgroundColor: pts.map(p => ZONE_COLOR[p.zone]),
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      fill: false,
      tension: 0.2,
      order: 0
    };
    return {
      type: 'line',
      data: { datasets: bands.concat([childDataset]) },
      plugins: [SD_LABEL_PLUGIN],
      options: {
        parsing: false,
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 22 } },
        plugins: { legend: { display: false } },
        scales: {
          x: { type: 'linear', min: DOMAINS[indicator].from, max: DOMAINS[indicator].to,
               title: { display: true, text: indicator === 'wfl' ? 'Panjang (cm)' : 'Umur (bulan)' } },
          y: { title: { display: true, text: indicator === 'lhfa' ? 'Tinggi (cm)'
                        : indicator === 'hcfa' ? 'Lingkar kepala (cm)'
                        : indicator === 'bfa' ? 'IMT (kg/m²)' : 'Berat (kg)' } }
        }
      }
    };
  }

  return { indicatorDomain, referenceLine, buildBandDatasets, childPoints, buildChartConfig, invLMS };
});
