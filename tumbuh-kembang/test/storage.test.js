const test = require('node:test');
const assert = require('node:assert');
const { installLocalStorageMock } = require('../helpers/localStorage-mock.js');

function freshStorage() {
  installLocalStorageMock(global);
  delete require.cache[require.resolve('../js/storage.js')];
  return require('../js/storage.js');
}

test('storage: tambah anak & jadi aktif', () => {
  const Storage = freshStorage();
  const c = Storage.addChild({ nama: 'Budi', jenisKelamin: 'L', tanggalLahir: '2024-01-01' });
  assert.ok(c.id);
  assert.strictEqual(Storage.getChildren().length, 1);
  assert.strictEqual(Storage.getActiveChildId(), c.id);
});

test('storage: measurement diurutkan naik & terikat anak', () => {
  const Storage = freshStorage();
  const c = Storage.addChild({ nama: 'Ani', jenisKelamin: 'P', tanggalLahir: '2024-01-01' });
  Storage.addMeasurement(c.id, { tanggalUkur: '2024-06-01', beratKg: 7 });
  Storage.addMeasurement(c.id, { tanggalUkur: '2024-03-01', beratKg: 6 });
  const ms = Storage.getMeasurements(c.id);
  assert.strictEqual(ms.length, 2);
  assert.strictEqual(ms[0].tanggalUkur, '2024-03-01');
});

test('storage: hapus anak menghapus measurement-nya', () => {
  const Storage = freshStorage();
  const c = Storage.addChild({ nama: 'X', jenisKelamin: 'L', tanggalLahir: '2024-01-01' });
  Storage.addMeasurement(c.id, { tanggalUkur: '2024-06-01', beratKg: 7 });
  Storage.deleteChild(c.id);
  assert.strictEqual(Storage.getChildren().length, 0);
  assert.strictEqual(Storage.getMeasurements(c.id).length, 0);
});

test('storage: update measurement', () => {
  const Storage = freshStorage();
  const c = Storage.addChild({ nama: 'Y', jenisKelamin: 'L', tanggalLahir: '2024-01-01' });
  const m = Storage.addMeasurement(c.id, { tanggalUkur: '2024-06-01', beratKg: 7 });
  Storage.updateMeasurement(m.id, { beratKg: 7.5 });
  assert.strictEqual(Storage.getMeasurements(c.id)[0].beratKg, 7.5);
});

test('storage: hapus satu anak dari dua → active pindah', () => {
  const Storage = freshStorage();
  const a = Storage.addChild({ nama: 'A', jenisKelamin: 'L', tanggalLahir: '2024-01-01' });
  const b = Storage.addChild({ nama: 'B', jenisKelamin: 'P', tanggalLahir: '2024-02-01' });
  Storage.setActiveChildId(a.id);
  Storage.deleteChild(a.id);
  assert.strictEqual(Storage.getActiveChildId(), b.id);
});
