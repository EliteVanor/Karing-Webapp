// Small DOM helpers. Everything that comes from the database goes through h(),
// which only ever sets text and attributes, never raw HTML. That is what keeps
// database content from injecting scripts into the page.

/**
 * Create an element.
 * h("a", { href: "x.html", class: "link" }, "text", childNode)
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    el.setAttribute(name, String(value));
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : String(child));
  }
  return el;
}

/** Read a query-string parameter, or null when it is missing or empty. */
export function queryParam(name, search = window.location.search) {
  const value = new URLSearchParams(search).get(name);
  return value ? value : null;
}

/** Hide the page's loading indicator, if it has one. */
export function hideLoading() {
  const loading = document.getElementById("loading");
  if (loading) loading.hidden = true;
}

/** Replace a container's children, skipping null/false entries (optional parts). */
export function fill(container, ...children) {
  container.replaceChildren(...children.flat().filter((c) => c != null && c !== false));
}

/** Replace a container's content with a single status message. */
export function showMessage(container, text) {
  container.replaceChildren(h("p", { class: "status-message", role: "status" }, text));
}
