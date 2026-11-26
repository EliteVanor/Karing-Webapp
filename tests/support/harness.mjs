// Shared Playwright setup: serve public/ from disk and replace every
// third-party script with a local file, so tests run offline.
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
export const PUBLIC_DIR = path.join(root, "public");
export const ORIGIN = "http://karing.test";

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".json": "application/json" };

const firebaseStub = readFileSync(path.join(here, "firebase-stub.js"), "utf8");

function jquerySource() {
  try {
    return readFileSync(createRequire(import.meta.url).resolve("jquery/dist/jquery.slim.min.js"), "utf8");
  } catch {
    return "/* jquery not installed */";
  }
}

export async function installRoutes(page, stubConfig = {}) {
  await page.addInitScript((cfg) => { globalThis.__KARING_STUB__ = cfg; }, stubConfig);

  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === "www.gstatic.com" && url.pathname.includes("/firebasejs/")) {
      return route.fulfill({ contentType: "text/javascript", body: firebaseStub });
    }
    if (url.hostname === "code.jquery.com") {
      return route.fulfill({ contentType: "text/javascript", body: jquerySource() });
    }
    if (url.origin === ORIGIN) {
      let file = path.join(PUBLIC_DIR, decodeURIComponent(url.pathname));
      if (file.endsWith("/")) file += "index.html";
      if (!file.startsWith(PUBLIC_DIR) || !existsSync(file)) {
        return route.fulfill({ status: 404, contentType: "text/html", body: readFileSync(path.join(PUBLIC_DIR, "404.html")) });
      }
      return route.fulfill({ contentType: types[path.extname(file)] ?? "application/octet-stream", body: readFileSync(file) });
    }
    // Fonts and anything else external: skip, keep tests offline and deterministic.
    return route.abort();
  });
}
