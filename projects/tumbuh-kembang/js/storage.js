const K_CHILDREN = 'tk_children';
const K_ACTIVE = 'tk_activeChildId';
const K_MEAS = 'tk_measurements';

function read(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch (e) { return fallback; }
}
function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function uid() { return 'id-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e6).toString(36); }

function getChildren() { return read(K_CHILDREN, []); }
function getActiveChildId() { return localStorage.getItem(K_ACTIVE) || null; }
function setActiveChildId(id) { if (id) localStorage.setItem(K_ACTIVE, id); else localStorage.removeItem(K_ACTIVE); }

function addChild(data) {
  const children = getChildren();
  const child = { id: uid(), nama: data.nama, jenisKelamin: data.jenisKelamin, tanggalLahir: data.tanggalLahir };
  children.push(child);
  write(K_CHILDREN, children);
  if (!getActiveChildId()) setActiveChildId(child.id);
  return child;
}

function updateChild(id, patch) {
  const children = getChildren();
  const i = children.findIndex(c => c.id === id);
  if (i < 0) return null;
  children[i] = Object.assign({}, children[i], patch, { id });
  write(K_CHILDREN, children);
  return children[i];
}

function getAllMeasurements() { return read(K_MEAS, []); }

function deleteChild(id) {
  write(K_CHILDREN, getChildren().filter(c => c.id !== id));
  write(K_MEAS, getAllMeasurements().filter(m => m.childId !== id));
  if (getActiveChildId() === id) {
    const rest = getChildren();
    setActiveChildId(rest.length ? rest[0].id : null);
  }
}

function getMeasurements(childId) {
  return getAllMeasurements()
    .filter(m => m.childId === childId)
    .sort((a, b) => a.tanggalUkur < b.tanggalUkur ? -1 : a.tanggalUkur > b.tanggalUkur ? 1 : 0);
}

function addMeasurement(childId, data) {
  const all = getAllMeasurements();
  const m = {
    id: uid(), childId,
    tanggalUkur: data.tanggalUkur,
    beratKg: data.beratKg != null ? Number(data.beratKg) : null,
    tinggiCm: data.tinggiCm != null ? Number(data.tinggiCm) : null,
    lingkarKepalaCm: data.lingkarKepalaCm != null ? Number(data.lingkarKepalaCm) : null
  };
  all.push(m);
  write(K_MEAS, all);
  return m;
}

function updateMeasurement(id, patch) {
  const all = getAllMeasurements();
  const i = all.findIndex(m => m.id === id);
  if (i < 0) return null;
  all[i] = Object.assign({}, all[i], patch, { id });
  write(K_MEAS, all);
  return all[i];
}

function deleteMeasurement(id) {
  write(K_MEAS, getAllMeasurements().filter(m => m.id !== id));
}

(function (root) {
  const api = { getChildren, addChild, updateChild, deleteChild,
                getActiveChildId, setActiveChildId,
                getMeasurements, addMeasurement, updateMeasurement, deleteMeasurement };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Storage = api;
})(typeof self !== 'undefined' ? self : this);
