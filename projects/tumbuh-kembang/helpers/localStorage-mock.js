function installLocalStorageMock(root) {
  const store = new Map();
  root.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear()
  };
  return root.localStorage;
}
module.exports = { installLocalStorageMock };
