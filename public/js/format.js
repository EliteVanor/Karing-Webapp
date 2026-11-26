// Pure formatting rules. No DOM and no Firebase, so they run under `node --test`.

/** Prefix a patient's name with the Vietnamese honorific for their sex. */
export function displayName(patient) {
  const name = patient?.name ?? "";
  if (patient?.sex === "Nam") return `Ông ${name}`;
  if (patient?.sex === "Nữ") return `Bà ${name}`;
  return name;
}

/** Turn a Realtime Database object ({ id: record }) into [{ id, ...record }]. */
export function toList(snapshotValue) {
  if (!snapshotValue || typeof snapshotValue !== "object") return [];
  return Object.entries(snapshotValue)
    .filter(([, record]) => record && typeof record === "object")
    .map(([id, record]) => ({ id, ...record }));
}

/** True when a string can be used as one Realtime Database key (no "." "#" "$" "[" "]" "/"). */
export function isDatabaseKey(value) {
  return typeof value === "string" && /^[^.#$[\]/]{1,768}$/.test(value);
}

/** Allow only http(s) and same-site relative image URLs from the database. */
export function safeImageUrl(url) {
  if (typeof url !== "string" || url.trim() === "") return null;
  try {
    const parsed = new URL(url, "https://karing.invalid/");
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

const AUTH_MESSAGES = {
  "auth/invalid-email": "Email không hợp lệ.",
  "auth/missing-password": "Vui lòng nhập mật khẩu.",
  "auth/invalid-credential": "Email hoặc mật khẩu không đúng.",
  "auth/wrong-password": "Email hoặc mật khẩu không đúng.",
  "auth/user-not-found": "Email hoặc mật khẩu không đúng.",
  "auth/email-already-in-use": "Email này đã được đăng ký.",
  "auth/weak-password": "Mật khẩu cần ít nhất 6 ký tự.",
  "auth/too-many-requests": "Bạn thử quá nhiều lần. Vui lòng đợi một lát.",
  "auth/network-request-failed": "Lỗi kết nối mạng. Vui lòng thử lại.",
};

/** Map a Firebase Auth error to a message a Vietnamese user can act on. */
export function authErrorMessage(error) {
  return AUTH_MESSAGES[error?.code] ?? "Có lỗi xảy ra. Vui lòng thử lại.";
}

export const LOAD_ERROR_MESSAGE = "Không tải được dữ liệu. Vui lòng thử lại sau.";
export const SIGN_IN_REQUIRED_MESSAGE = "Vui lòng đăng nhập để xem hồ sơ bệnh nhân.";

/**
 * Map a Realtime Database read error to a message for the page. A permission
 * error only means "sign in" on views that need a signed-in user.
 */
export function loadErrorMessage(error, { signInRequired = false } = {}) {
  return signInRequired && error?.code === "PERMISSION_DENIED" ? SIGN_IN_REQUIRED_MESSAGE : LOAD_ERROR_MESSAGE;
}
