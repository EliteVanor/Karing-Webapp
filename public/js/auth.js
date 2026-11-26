// Email/password authentication, shared by the nav login modal and the
// sign-in / sign-up pages.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import { auth } from "./firebase.js";

export { authErrorMessage } from "./format.js";

export async function signIn(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function signUp(email, password) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  return user;
}

export const signOut = () => firebaseSignOut(auth);

/** Call back with the signed-in user, or null, now and on every change. */
export const onUserChange = (callback) => onAuthStateChanged(auth, callback);
