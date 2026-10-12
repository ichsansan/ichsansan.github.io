(function () {
  const $ = (id) => document.getElementById(id);
  const charts = {}; // indicator → Chart instance
  let editingMeasurementId = null;
  let editingChildId = null;

  function todayISO() {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  function fmtAge(months) {
    if (months == null || isNaN(months)) return '—';
    const total = Math.max(0, Math.floor(months));
    const y = Math.floor(total / 12), m = total % 12;
    return (y ? y + ' th ' : '') + m + ' bln';
  }

  function fmtDate(iso) {
    const p = String(iso || '').split('-').map(Number);
    if (p.length !== 3 || p.some(isNaN)) return iso || '—';
    return new Date(p[0], p[1] - 1, p[2]).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function activeChild() {
    const id = Storage.getActiveChildId();
    return Storage.getChildren().find(c => c.id === id) || null;
  }

  function renderChildSelector() {
    const sel = $('child-select');
    const children = Storage.getChildren();
    sel.innerHTML = '';
    if (!children.length) {
      const o = document.createElement('option');
      o.value = ''; o.textContent = '— belum ada anak —';
      sel.appendChild(o);
    }
    children.forEach(c => {
      const o = document.createElement('option');
      o.value = c.id; o.textContent = c.nama + ' (' + (c.jenisKelamin === 'L' ? 'L' : 'P') + ')';
      sel.appendChild(o);
    });
    const active = Storage.getActiveChildId();
    if (active) sel.value = active;
    const has = children.length > 0;
    $('btn-edit-child').disabled = !has;
    $('btn-delete-child').disabled = !has;
    const child = activeChild();
    document.body.dataset.sex = child ? child.jenisKelamin : '';
    $('child-meta').textContent = child
      ? (child.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan') + ', lahir ' + fmtDate(child.tanggalLahir) +
        ', sekarang ' + fmtAge(Growth.ageInMonths(child.tanggalLahir, todayISO()))
      : '';
  }

  function updateAgeOutput() {
    const child = activeChild();
    if (child && $('m-date').value) {
      $('m-age').textContent = fmtAge(Growth.ageInMonths(child.tanggalLahir, $('m-date').value));
    } else $('m-age').textContent = '—';
  }

  function renderSummary() {
    const wrap = $('summary'); wrap.innerHTML = '';
    const meta = $('summary-meta'); meta.textContent = '';
    const child = activeChild();
    if (!child) { wrap.innerHTML = '<p class="empty">Belum ada anak. Tambahkan anak dulu untuk mulai mencatat.</p>'; return; }
    const ms = Storage.getMeasurements(child.id);
    if (!ms.length) { wrap.innerHTML = '<p class="empty">Belum ada pengukuran. Catat pengukuran pertama untuk melihat status gizi.</p>'; return; }
    const latest = ms[ms.length - 1];
    meta.textContent = 'Diukur ' + fmtDate(latest.tanggalUkur) + ', umur ' +
      fmtAge(Growth.ageInMonths(child.tanggalLahir, latest.tanggalUkur));
    const results = Growth.interpret(child, latest);
    if (!results.length) { wrap.innerHTML = '<p class="empty">Data pengukuran terbaru belum cukup untuk dinilai.</p>'; return; }
    results.forEach(r => {
      const item = document.createElement('div');
      item.className = 'status-item ' + r.zone;
      const warn = r.safe ? '' : '<span class="flag">Perlu perhatian</span>';
      item.innerHTML = '<span class="ind">' + r.title + '</span>' +
                       '<span class="val">' + r.label + warn + '</span>' +
                       '<span class="z">z = ' + r.z.toFixed(2) + '</span>';
      wrap.appendChild(item);
    });
  }

  function renderCharts() {
    const child = activeChild();
    const ms = child ? Storage.getMeasurements(child.id) : [];
    ['wfa', 'lhfa', 'hcfa', 'wfl', 'bfa'].forEach(ind => {
      const canvas = $('chart-' + ind);
      if (charts[ind]) { charts[ind].destroy(); delete charts[ind]; }
      if (!child) return;
      const cfg = Charts.buildChartConfig(ind, child.jenisKelamin, ms, child);
      charts[ind] = new Chart(canvas.getContext('2d'), cfg);
    });
  }

  function renderHistory() {
    const tbody = $('history-table').querySelector('tbody');
    tbody.innerHTML = '';
    const child = activeChild();
    const ms = child ? Storage.getMeasurements(child.id) : [];
    if (!ms.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty">' +
        (child ? 'Belum ada pengukuran yang tersimpan.' : 'Riwayat muncul setelah ada anak dan pengukuran.') + '</td></tr>';
      return;
    }
    ms.slice().reverse().forEach(m => {
      const age = fmtAge(Growth.ageInMonths(child.tanggalLahir, m.tanggalUkur));
      const tr = document.createElement('tr');
      const show = (v) => (v == null ? '—' : v);
      tr.innerHTML = '<td>' + fmtDate(m.tanggalUkur) + '</td><td>' + age + '</td>' +
        '<td>' + show(m.beratKg) + '</td><td>' + show(m.tinggiCm) + '</td><td>' + show(m.lingkarKepalaCm) + '</td>' +
        '<td class="text-nowrap"><button class="btn btn-sm btn-quiet" data-edit="' + m.id + '">Edit</button> ' +
        '<button class="btn btn-sm btn-quiet is-danger" data-del="' + m.id + '">Hapus</button></td>';
      tbody.appendChild(tr);
    });
  }

  function updateSubmitLabel() {
    $('measure-submit').textContent = editingMeasurementId ? 'Simpan perubahan' : 'Simpan pengukuran';
  }

  function renderAll() { renderChildSelector(); updateAgeOutput(); renderSummary(); renderCharts(); renderHistory(); }

  function resizeCharts() { Object.keys(charts).forEach(k => charts[k] && charts[k].resize()); }

  function exitFullscreen() {
    const open = document.querySelector('.chart-card.fs-active');
    if (!open) return;
    open.classList.remove('fs-active');
    document.body.classList.remove('fs-open');
    setTimeout(resizeCharts, 60);
  }

  function toggleFullscreen(card) {
    const isActive = card.classList.contains('fs-active');
    exitFullscreen();
    if (!isActive) {
      card.classList.add('fs-active');
      document.body.classList.add('fs-open');
      setTimeout(resizeCharts, 60);
    }
  }

  function setupFullscreenButtons() {
    document.querySelectorAll('.chart-card').forEach(card => {
      if (card.querySelector('.fs-btn')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-quiet fs-btn';
      btn.title = 'Layar penuh';
      btn.setAttribute('aria-label', 'Layar penuh / keluar');
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 6.5v-4h4M11.5 2.5h4v4M15.5 11.5v4h-4M6.5 15.5h-4v-4"/></svg>';
      btn.addEventListener('click', () => toggleFullscreen(card));
      (card.querySelector('figcaption') || card).appendChild(btn);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') exitFullscreen(); });
    window.addEventListener('resize', () => { if (document.querySelector('.chart-card.fs-active')) setTimeout(resizeCharts, 60); });
    window.addEventListener('orientationchange', () => setTimeout(resizeCharts, 200));
  }

  let childModal = null;
  function getChildModal() {
    if (!childModal) childModal = new bootstrap.Modal($('child-dialog'));
    return childModal;
  }

  function openChildDialog(child) {
    editingChildId = child ? child.id : null;
    $('child-dialog-title').textContent = child ? 'Edit Anak' : 'Tambah Anak';
    $('c-name').value = child ? child.nama : '';
    $('c-sex').value = child ? child.jenisKelamin : 'L';
    $('c-birth').value = child ? child.tanggalLahir : '';
    getChildModal().show();
  }

  function wire() {
    Chart.defaults.font.family = '"Plus Jakarta Sans", system-ui, sans-serif';
    Chart.defaults.color = '#51647a';
    Chart.defaults.borderColor = 'rgba(22,40,58,.08)';

    $('m-date').value = todayISO();

    $('child-select').addEventListener('change', (e) => {
      if (e.target.value) { Storage.setActiveChildId(e.target.value); renderAll(); }
    });
    $('btn-add-child').addEventListener('click', () => openChildDialog(null));
    $('btn-edit-child').addEventListener('click', () => { const c = activeChild(); if (c) openChildDialog(c); });
    $('btn-delete-child').addEventListener('click', () => {
      const c = activeChild();
      if (c && confirm('Hapus anak "' + c.nama + '" beserta semua pengukurannya?')) { Storage.deleteChild(c.id); renderAll(); }
    });

    $('child-save').addEventListener('click', () => {
      const form = $('child-form');
      if (!form.reportValidity()) return;
      const data = { nama: $('c-name').value.trim(), jenisKelamin: $('c-sex').value, tanggalLahir: $('c-birth').value };
      if (editingChildId) Storage.updateChild(editingChildId, data);
      else { const c = Storage.addChild(data); Storage.setActiveChildId(c.id); }
      getChildModal().hide();
      renderAll();
    });

    $('m-date').addEventListener('change', updateAgeOutput);

    $('measure-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const child = activeChild();
      if (!child) { alert('Tambahkan anak terlebih dahulu.'); return; }
      const num = (v) => v === '' ? null : Number(v);
      const data = {
        tanggalUkur: $('m-date').value,
        beratKg: num($('m-weight').value),
        tinggiCm: num($('m-height').value),
        lingkarKepalaCm: num($('m-head').value)
      };
      if (data.beratKg == null && data.tinggiCm == null && data.lingkarKepalaCm == null) {
        alert('Isi minimal satu nilai pengukuran (berat / tinggi / lingkar kepala).');
        return;
      }
      if (editingMeasurementId) { Storage.updateMeasurement(editingMeasurementId, data); editingMeasurementId = null; }
      else Storage.addMeasurement(child.id, data);
      e.target.reset(); $('m-date').value = todayISO(); updateAgeOutput(); updateSubmitLabel();
      renderAll();
    });

    $('history-table').addEventListener('click', (e) => {
      const delId = e.target.getAttribute('data-del');
      const editId = e.target.getAttribute('data-edit');
      if (delId && confirm('Hapus pengukuran ini?')) { Storage.deleteMeasurement(delId); renderAll(); }
      if (editId) {
        const child = activeChild();
        const m = Storage.getMeasurements(child.id).find(x => x.id === editId);
        if (m) {
          $('m-date').value = m.tanggalUkur; $('m-weight').value = m.beratKg ?? '';
          $('m-height').value = m.tinggiCm ?? ''; $('m-head').value = m.lingkarKepalaCm ?? '';
          editingMeasurementId = m.id; updateAgeOutput(); updateSubmitLabel();
          $('form-section').scrollIntoView({ behavior: 'smooth' });
        }
      }
    });

    setupFullscreenButtons();
    renderAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire);
  else wire();
})();
