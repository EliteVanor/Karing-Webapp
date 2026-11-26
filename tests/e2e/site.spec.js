// End-to-end checks of every page, run offline against a Firebase stub
// (tests/support/firebase-stub.js) and made-up data (tests/support/fixtures.js).
import { test, expect } from "@playwright/test";
import { installRoutes, ORIGIN } from "../support/harness.mjs";
import { sampleData, xssData } from "../support/fixtures.js";

const SIGNED_IN = { uid: "u1", email: "family@example.com" };

async function open(page, path, stub = { data: sampleData }) {
  const problems = [];
  page.on("pageerror", (e) => problems.push(`JS error: ${e.message}`));
  page.on("response", (r) => {
    if (r.url().startsWith(ORIGIN) && r.status() >= 400) problems.push(`${r.status()} ${r.url()}`);
  });
  await installRoutes(page, stub);
  await page.goto(`${ORIGIN}/${path}`);
  return problems;
}

const PAGES = ["index.html", "info.html", "care.html", "patient.html", "news.html",
  "article.html?id=a1", "patient-detail.html?id=p1", "signin.html", "signup.html"];

for (const path of PAGES) {
  test(`${path} loads with no JS errors or broken local files`, async ({ page }) => {
    const problems = await open(page, path, { data: sampleData, user: SIGNED_IN });
    await expect(page.locator("#site-nav .logo")).toHaveText("Karing");
    await expect(page.locator("#site-footer .copyright")).toContainText("Karing");
    await page.waitForLoadState("networkidle");
    expect(problems).toEqual([]);
  });
}

test("unknown pages get the 404 page, styled, at any depth", async ({ page }) => {
  for (const path of ["nope.html", "a/b/c"]) {
    await open(page, path);
    await expect(page.locator("main h1")).toHaveText("404");
    await expect(page.locator("#site-nav .logo")).toHaveText("Karing");
    await expect(page.locator("main .auth-card")).toHaveCSS("border-radius", "16px");
  }
});

// The 2023 layout is fixed-width, so phones zoom out and the fixed nav ends up
// off-screen (see README, known limitations). Interaction tests run on desktop;
// the mobile project still checks every page loads and renders its data.
const desktopOnly = () => test.skip(({ isMobile }) => isMobile, "fixed-width layout: nav is off-screen on phones");

test.describe("navigation", () => {
  desktopOnly();
  test("marks the current page", async ({ page }) => {
    await open(page, "news.html");
    await expect(page.locator('#site-nav a[aria-current="page"]')).toHaveText("Tin Tức");
  });

  test("contact modal opens, and closes with the button, Escape and the backdrop", async ({ page }) => {
    await open(page, "index.html");
    const modal = page.locator("#contact-modal");
    const opener = page.getByRole("button", { name: "Liên Hệ" });

    await opener.click();
    await expect(modal).toBeVisible();
    await modal.getByRole("button", { name: "Hủy" }).click();
    await expect(modal).toBeHidden();

    await opener.click();
    await page.keyboard.press("Escape");
    await expect(modal).toBeHidden();
    await expect(opener).toBeFocused();

    await opener.click();
    await modal.click({ position: { x: 5, y: 5 } });
    await expect(modal).toBeHidden();
  });

  test("login modal signs in through Firebase and reports errors in Vietnamese", async ({ page }) => {
    await open(page, "index.html");
    await page.getByRole("button", { name: "Đăng nhập" }).first().click();
    const form = page.locator("#login-form");
    await form.getByLabel("Email").fill("family@example.com");
    await form.getByLabel("Mật khẩu").fill("wrong-password");
    await form.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(form.locator(".form-message")).toHaveText("Email hoặc mật khẩu không đúng.");

    await form.getByLabel("Mật khẩu").fill("correct-horse");
    await form.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(form.locator(".form-message")).toHaveText("Xin chào, family@example.com");
  });
});

test.describe("news", () => {
  test("lists articles and links to each one", async ({ page }) => {
    await open(page, "news.html");
    await expect(page.locator("#loading")).toBeHidden();
    const titles = page.locator("#news-list .article h3");
    await expect(titles).toHaveCount(3);
    await titles.first().click();
    await expect(page).toHaveURL(/article\.html\?id=a1$/);
    await expect(page.locator("#detail h1")).toHaveText(sampleData.aricles.a1.title);
    await expect(page).toHaveTitle(`${sampleData.aricles.a1.title} | Karing`);
  });

  test("article without an id, with an unknown id or an invalid id says not found", async ({ page }) => {
    const problems = await open(page, "article.html");
    for (const query of ["", "?id=missing", "?id=a.b", "?id=x%23y"]) {
      await page.goto(`${ORIGIN}/article.html${query}`);
      await expect(page.locator("#detail")).toHaveText("Không tìm thấy bài viết.");
    }
    expect(problems).toEqual([]);
  });

  test("article with no image shows no stray text", async ({ page }) => {
    await open(page, "article.html?id=noimage");
    await expect(page.locator("#detail h1")).toHaveText("Sample article without an image");
    await expect(page.locator("#detail")).not.toContainText("null");
    await expect(page.locator("#detail img")).toHaveCount(0);
  });

  test("shows an empty state and an error state", async ({ page }) => {
    await open(page, "news.html", { data: {} });
    await expect(page.locator("#news-list")).toHaveText("Chưa có bài viết nào.");
    await page.addInitScript(() => { globalThis.__KARING_STUB__ = { deny: true }; });
    await page.reload();
    await expect(page.locator("#news-list")).toHaveText("Không tải được dữ liệu. Vui lòng thử lại sau.");
  });
});

test.describe("patients", () => {
  test("asks signed-out visitors to sign in and does not show records", async ({ page }) => {
    await open(page, "patient.html");
    await expect(page.locator("#patient-list")).toHaveText("Vui lòng đăng nhập để xem hồ sơ bệnh nhân.");
    await expect(page.locator(".profile-card")).toHaveCount(0);
  });

  test("lists patients with honorifics for signed-in users", async ({ page, isMobile }) => {
    await open(page, "patient.html", { data: sampleData, user: SIGNED_IN });
    const names = page.locator("#patient-list .profile-card h3");
    await expect(names).toHaveText(["Ông Nguyễn Văn A", "Bà Trần Thị B"]);
    // Click the middle of the name: the age row overlaps it, and used to swallow this click.
    if (isMobile) await page.goto(`${ORIGIN}/patient-detail.html?id=p1`);
    else await names.first().click({ position: { x: 200, y: 16 } });
    await expect(page).toHaveURL(/patient-detail\.html\?id=p1$/);
    await expect(page.locator("#detail h1")).toHaveText("Ông Nguyễn Văn A");
  });

  test("permission errors from the database ask the user to sign in", async ({ page }) => {
    await open(page, "patient.html", { deny: true, user: SIGNED_IN });
    await expect(page.locator("#patient-list")).toHaveText("Vui lòng đăng nhập để xem hồ sơ bệnh nhân.");
  });
});

test.describe("database content is shown as text, never run as code", () => {
  for (const path of ["news.html", "article.html?id=evil", "patient.html", "patient-detail.html?id=evil"]) {
    test(path, async ({ page }) => {
      await open(page, path, { data: xssData, user: SIGNED_IN });
      await page.waitForLoadState("networkidle");
      await expect(page.locator("body")).toContainText("<img src=x");
      expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
    });
  }
});

test.describe("accounts", () => {
  test("sign in, see the greeting, sign out", async ({ page }) => {
    await open(page, "signin.html");
    const form = page.locator("#signin-form");
    await form.getByLabel("Email").fill("family@example.com");
    await form.getByLabel("Mật khẩu").fill("wrong-password");
    await form.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page.locator("#form-message")).toHaveText("Email hoặc mật khẩu không đúng.");

    await form.getByLabel("Mật khẩu").fill("correct-horse");
    await form.getByRole("button", { name: "Đăng nhập" }).click();
    await expect(page.locator("#greeting")).toHaveText("Xin chào, family@example.com");
    await page.getByRole("button", { name: "Đăng xuất" }).click();
    await expect(form).toBeVisible();
  });

  test("sign up shows the success message", async ({ page }) => {
    await open(page, "signup.html");
    const form = page.locator("#signup-form");
    await form.getByLabel("Email").fill("new@example.com");
    await form.getByLabel("Mật khẩu").fill("secret123");
    await form.getByRole("button", { name: "Đăng ký" }).click();
    await expect(page.locator("#signup-done")).toContainText("Bạn đã đăng ký thành công.");
  });
});
