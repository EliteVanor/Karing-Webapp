// The one place that knows about the Firebase project.
// The web config below is public by design (it identifies the project, it does
// not grant access). Access is controlled by database.rules.json.
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC4mFlIik7OqrJlOsHvrZyito-WhF4tPtk",
  authDomain: "karing-a8b53.firebaseapp.com",
  projectId: "karing-a8b53",
  storageBucket: "karing-a8b53.appspot.com",
  messagingSenderId: "284699594166",
  appId: "1:284699594166:web:fcaaf6bdad63e5b6478517",
  databaseURL: "https://karing-a8b53-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

// Database paths. "aricles" (sic) is the key used in the live database,
// so the spelling stays until the data is migrated.
export const PATHS = {
  articles: "aricles",
  article: (id) => `aricles/${id}`,
  patients: "db/pt",
  patient: (id) => `db/pt/${id}`,
};

/** Subscribe to a database path. Returns the unsubscribe function. */
export function watch(path, onData, onError) {
  return onValue(ref(db, path), (snapshot) => onData(snapshot.val()), onError);
}
