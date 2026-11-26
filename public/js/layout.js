// Shared page chrome: navigation bar, contact and login modals, footer.
// Every page has <nav id="site-nav" data-active="..."> and <footer id="site-footer">,
// and this module fills them, so the markup lives in one place.

const NAV_LINKS = [
  { id: "home", href: "index.html", label: "Trang Chủ" },
  { id: "patients", href: "patient.html", label: "Tìm Bệnh Nhân" },
  { id: "caregivers", href: "care.html", label: "Tìm Người Chăm Sóc" },
  { id: "news", href: "news.html", label: "Tin Tức" },
];

const CONTACT_ITEMS = `
  <li><img src="images/email.svg" alt=""> chamsoc@nguoibenh.com.vn</li>
  <li><img src="images/phone.svg" alt=""> 0983471417</li>
  <li><img src="images/locate.svg" alt=""> 208 Giải Phóng, Hai Bà Trưng, Hà Nội</li>`;

const SOCIAL_LINKS = `
  <div class="social">
    <a href="#" aria-label="Facebook"><img src="images/facebook.png" alt=""></a>
    <a href="#" aria-label="Twitter"><img src="images/twitter.png" alt=""></a>
    <a href="#" aria-label="Instagram"><img src="images/instagram.png" alt=""></a>
  </div>`;

function navTemplate(active) {
  const links = NAV_LINKS.map(({ id, href, label }) => {
    const current = id === active ? ' class="orange" aria-current="page"' : "";
    return `<li><a href="${href}"${current}>${label}</a></li>`;
  }).join("");

  return `
    <a href="index.html"><div class="logo">Karing</div></a>
    <ul>
      ${links}
      <li>
        <button type="button" class="btn none" data-open="contact-modal">Liên Hệ</button>
        <div id="contact-modal" class="modal ver22" role="dialog" aria-modal="true" aria-labelledby="contact-title">
          <span class="close" role="button" tabindex="0" aria-label="Đóng" data-close>&times;</span>
          <div class="modal-content ver2 animate">
            <div class="popup2">
              <h1 id="contact-title">Liên hệ chúng tôi</h1>
              <div class="regis">
                <ul>${CONTACT_ITEMS}</ul>
                ${SOCIAL_LINKS}
              </div>
              <button type="button" class="cancelbtn" data-close>Hủy</button>
            </div>
          </div>
        </div>
      </li>
      <li>
        <button type="button" class="btn dark" data-open="login-modal">Đăng nhập</button>
        <div id="login-modal" class="modal" role="dialog" aria-modal="true" aria-labelledby="login-title">
          <span class="close" role="button" tabindex="0" aria-label="Đóng" data-close>&times;</span>
          <form class="modal-content animate" id="login-form" novalidate>
            <div class="popup">
              <h1 id="login-title">Đăng Nhập</h1>
              <div class="container">
                <div class="type">
                  <div class="gmail">
                    <input type="email" name="email" placeholder="Nhập email" aria-label="Email" autocomplete="email" required>
                  </div>
                  <div class="psw">
                    <input type="password" name="password" placeholder="Nhập mật khẩu" aria-label="Mật khẩu" autocomplete="current-password" required>
                  </div>
                </div>
                <p class="form-message" role="status" aria-live="polite"></p>
                <div class="login">
                  <button type="submit">Đăng nhập</button>
                </div>
              </div>
              <h4>Chưa có tài khoản?</h4>
              <div class="regis">
                <ul>
                  <li><a href="signup.html"><p>Đăng ký người nhà bệnh nhân</p></a></li>
                  <li><a href="signup.html"><p>Đăng ký người chăm sóc</p></a></li>
                </ul>
              </div>
              <button type="button" class="cancelbtn" data-close>Hủy</button>
            </div>
          </form>
        </div>
      </li>
    </ul>`;
}

const FOOTER = `
  <div class="wrapper">
    <div class="links-container">
      <div class="links">
        <h3>Về chúng tôi</h3>
        <ul>
          <li><a href="info.html">Thông tin</a></li>
          <li><a href="#">Chính sách bảo mật</a></li>
          <li><a href="#">Điều khoản sử dụng</a></li>
        </ul>
      </div>
      <div class="links">
        <h3>Trợ giúp</h3>
        <ul>
          <li><a href="signin.html">Đăng nhập</a></li>
          <li><a href="signup.html">Tạo hồ sơ</a></li>
          <li><a href="#">Kết nối</a></li>
        </ul>
      </div>
      <div class="links">
        <h3>Liên hệ chúng tôi</h3>
        <ul>${CONTACT_ITEMS}</ul>
        ${SOCIAL_LINKS}
        <form>
          <input type="email" placeholder="Email Address" aria-label="Email">
          <button type="button" class="submit-btn">Subscribe</button>
        </form>
      </div>
    </div>
    <p class="copyright">Bản quyền thuộc về nhóm tác giả Karing © 2023</p>
  </div>`;

// --- Modals ------------------------------------------------------------------

let lastTrigger = null;

function openModal(modal, trigger) {
  lastTrigger = trigger ?? null;
  modal.style.display = "block";
  modal.querySelector("input, button")?.focus();
}

function closeModal(modal) {
  modal.style.display = "none";
  lastTrigger?.focus();
  lastTrigger = null;
}

function wireModals(root) {
  root.addEventListener("click", (event) => {
    const opener = event.target.closest("[data-open]");
    if (opener) return openModal(document.getElementById(opener.dataset.open), opener);

    const modal = event.target.closest(".modal");
    // A click on the dark backdrop (the .modal itself) or on a [data-close] control closes it.
    if (modal && (event.target === modal || event.target.closest("[data-close]"))) closeModal(modal);
  });

  document.addEventListener("keydown", (event) => {
    const open = [...document.querySelectorAll(".modal")].find((m) => m.style.display === "block");
    if (!open) return;
    if (event.key === "Escape") closeModal(open);
    if (event.key === "Enter" && event.target.matches("[data-close][role=button]")) closeModal(open);
  });
}

// The Firebase SDK is only downloaded when someone actually submits the login form.
function wireLoginForm(form) {
  const message = form.querySelector(".form-message");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const { email, password } = Object.fromEntries(new FormData(form));
    message.textContent = "Đang đăng nhập...";
    let auth;
    try {
      auth = await import("./auth.js");
    } catch {
      message.textContent = "Lỗi kết nối mạng. Vui lòng thử lại.";
      return;
    }
    const { signIn, authErrorMessage } = auth;
    try {
      const user = await signIn(email, password);
      message.textContent = `Xin chào, ${user.email}`;
      form.reset();
    } catch (err) {
      message.textContent = authErrorMessage(err);
    }
  });
}

// --- Sticky nav background on scroll -------------------------------------------

function wireScroll(nav) {
  const update = () => nav.classList.toggle("scrolled", window.scrollY > 60);
  window.addEventListener("scroll", update, { passive: true });
  update();
}

const nav = document.getElementById("site-nav");
if (nav) {
  nav.innerHTML = navTemplate(nav.dataset.active);
  wireModals(nav);
  wireLoginForm(nav.querySelector("#login-form"));
  wireScroll(nav);
}

const footer = document.getElementById("site-footer");
if (footer) footer.innerHTML = FOOTER;
