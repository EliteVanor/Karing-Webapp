// Keep one container in sync with one database path.
// Pages only describe what to show (a render function); this module owns the
// loading indicator, error messages and, for personal data, waiting for sign-in.
import { watch } from "./firebase.js";
import { fill, hideLoading, showMessage } from "./dom.js";
import { loadErrorMessage, SIGN_IN_REQUIRED_MESSAGE } from "./format.js";

/**
 * @param {Element} container  where the content goes
 * @param {object}  options
 * @param {string|null} options.path  database path; null means "nothing to load" (render gets null)
 * @param {(value: any) => Node[]|Node|string} options.render  nodes to show, or a string to show as a message
 * @param {boolean} [options.signInRequired]  only read while a user is signed in
 */
export async function bindView(container, { path, render, signInRequired = false }) {
  const show = (content) => {
    hideLoading();
    if (typeof content === "string") showMessage(container, content);
    else fill(container, content);
  };
  const subscribe = () =>
    watch(path, (value) => show(render(value)), (error) => show(loadErrorMessage(error, { signInRequired })));

  if (path == null) return show(render(null));
  if (!signInRequired) return subscribe();

  // Only pages with personal data download the Auth SDK.
  const { onUserChange } = await import("./auth.js");
  let unsubscribe = null;
  onUserChange((user) => {
    unsubscribe?.();
    unsubscribe = user ? subscribe() : null;
    if (!user) show(SIGN_IN_REQUIRED_MESSAGE);
  });
}
