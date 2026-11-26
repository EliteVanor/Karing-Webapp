// Test double for the Firebase Web SDK (v9 modular API).
// The e2e tests serve this file in place of every
// https://www.gstatic.com/firebasejs/<version>/firebase-*.js module, so pages
// run offline against fixture data instead of the real project.
// Configure it from the test with page.addInitScript:
//   globalThis.__KARING_STUB__ = { data: {...}, deny: false, user: null }

const stub = () => globalThis.__KARING_STUB__ ?? { data: {} };

export const initializeApp = (config) => ({ config });
export const getAnalytics = () => ({});

// --- Realtime Database -------------------------------------------------------
export const getDatabase = () => ({});
export function ref(_db, path = "") {
  // Same rule as the real SDK: these characters are invalid in a path.
  if (/[.#$[\]]/.test(path)) throw new Error(`Invalid Firebase Database path: ${path}`);
  return { path: String(path) };
}

function readPath(path) {
  return path
    .split("/")
    .filter(Boolean)
    .reduce((node, key) => (node == null ? null : node[key] ?? null), stub().data);
}

export function onValue(dbRef, onData, onError) {
  setTimeout(() => {
    if (stub().deny) {
      const err = Object.assign(new Error("Permission denied"), { code: "PERMISSION_DENIED" });
      if (onError) onError(err);
      return;
    }
    const value = readPath(dbRef.path);
    onData({ val: () => value, exists: () => value != null });
  }, 0);
  return () => {};
}

// --- Auth --------------------------------------------------------------------
const listeners = new Set();
let currentUser = null;
const notify = () => listeners.forEach((cb) => cb(currentUser));

export const getAuth = () => ({ get currentUser() { return currentUser; } });

export function onAuthStateChanged(_auth, cb) {
  listeners.add(cb);
  currentUser = currentUser ?? stub().user ?? null;
  setTimeout(() => cb(currentUser), 0);
  return () => listeners.delete(cb);
}

function signIn(email, password) {
  if (!email || !password || password === "wrong-password") {
    const err = Object.assign(new Error("Firebase: Error (auth/invalid-credential)."), { code: "auth/invalid-credential" });
    return Promise.reject(err);
  }
  currentUser = { uid: "test-uid", email };
  notify();
  return Promise.resolve({ user: currentUser });
}

export const signInWithEmailAndPassword = (_auth, email, password) => signIn(email, password);
export const createUserWithEmailAndPassword = (_auth, email, password) => signIn(email, password);
export function signOut() {
  currentUser = null;
  notify();
  return Promise.resolve();
}
