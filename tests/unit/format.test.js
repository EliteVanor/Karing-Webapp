import { test } from "node:test";
import assert from "node:assert/strict";
import {
  displayName, isDatabaseKey, toList, safeImageUrl, authErrorMessage, loadErrorMessage,
  LOAD_ERROR_MESSAGE, SIGN_IN_REQUIRED_MESSAGE,
} from "../../public/js/format.js";

test("displayName adds the honorific for the patient's sex", () => {
  assert.equal(displayName({ name: "Văn A", sex: "Nam" }), "Ông Văn A");
  assert.equal(displayName({ name: "Thị B", sex: "Nữ" }), "Bà Thị B");
  assert.equal(displayName({ name: "C", sex: "" }), "C");
  assert.equal(displayName(null), "");
});

test("toList turns a database object into records with ids", () => {
  assert.deepEqual(toList({ a: { x: 1 }, b: { x: 2 } }), [{ id: "a", x: 1 }, { id: "b", x: 2 }]);
  assert.deepEqual(toList(null), []);
  assert.deepEqual(toList("oops"), []);
  assert.deepEqual(toList({ a: null, b: 5, c: { ok: true } }), [{ id: "c", ok: true }]);
});

test("isDatabaseKey rejects characters Firebase forbids in keys", () => {
  assert.equal(isDatabaseKey("-NQx3abc"), true);
  for (const bad of ["a.b", "a#b", "a$b", "a[b", "a]b", "a/b", "", null, undefined]) {
    assert.equal(isDatabaseKey(bad), false, String(bad));
  }
});

test("safeImageUrl keeps http(s) and relative URLs and drops script URLs", () => {
  assert.equal(safeImageUrl("https://example.com/a.png"), "https://example.com/a.png");
  assert.equal(safeImageUrl("images/a.webp"), "images/a.webp");
  assert.equal(safeImageUrl("javascript:alert(1)"), null);
  assert.equal(safeImageUrl("data:text/html,<script>"), null);
  assert.equal(safeImageUrl(""), null);
  assert.equal(safeImageUrl(undefined), null);
});

test("authErrorMessage maps known codes and falls back for unknown ones", () => {
  assert.equal(authErrorMessage({ code: "auth/email-already-in-use" }), "Email này đã được đăng ký.");
  assert.equal(authErrorMessage({ code: "auth/invalid-credential" }), "Email hoặc mật khẩu không đúng.");
  assert.equal(authErrorMessage({ code: "auth/something-new" }), "Có lỗi xảy ra. Vui lòng thử lại.");
  assert.equal(authErrorMessage(undefined), "Có lỗi xảy ra. Vui lòng thử lại.");
});

test("loadErrorMessage asks to sign in only for permission errors on sign-in views", () => {
  const denied = { code: "PERMISSION_DENIED" };
  assert.equal(loadErrorMessage(denied, { signInRequired: true }), SIGN_IN_REQUIRED_MESSAGE);
  assert.equal(loadErrorMessage(denied), LOAD_ERROR_MESSAGE);
  assert.equal(loadErrorMessage(new Error("network"), { signInRequired: true }), LOAD_ERROR_MESSAGE);
});
