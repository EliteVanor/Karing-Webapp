// signup.html: create an account with email and password.
import { signUp, authErrorMessage } from "../auth.js";

const form = document.getElementById("signup-form");
const message = document.getElementById("form-message");
const done = document.getElementById("signup-done");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const { email, password } = Object.fromEntries(new FormData(form));
  message.textContent = "Đang tạo tài khoản...";
  try {
    await signUp(email, password);
    form.hidden = true;
    done.hidden = false;
  } catch (err) {
    message.textContent = authErrorMessage(err);
  }
});
