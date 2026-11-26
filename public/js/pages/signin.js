// signin.html: sign in, or show who is signed in with a sign-out button.
import { signIn, signOut, onUserChange, authErrorMessage } from "../auth.js";

const form = document.getElementById("signin-form");
const message = document.getElementById("form-message");
const signedIn = document.getElementById("signed-in");
const greeting = document.getElementById("greeting");

onUserChange((user) => {
  form.hidden = Boolean(user);
  signedIn.hidden = !user;
  greeting.textContent = user ? `Xin chào, ${user.email}` : "";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const { email, password } = Object.fromEntries(new FormData(form));
  message.textContent = "Đang đăng nhập...";
  try {
    await signIn(email, password);
    message.textContent = "";
    form.reset();
  } catch (err) {
    message.textContent = authErrorMessage(err);
  }
});

document.getElementById("sign-out").addEventListener("click", () => signOut());
