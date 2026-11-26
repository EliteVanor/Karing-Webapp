# Karing

**A web platform that connects families of stroke patients in Vietnam with qualified in-home caregivers.**

[![Test and deploy](https://github.com/EliteVanor/Karing-Webapp/actions/workflows/firebase-hosting-merge.yml/badge.svg)](https://github.com/EliteVanor/Karing-Webapp/actions/workflows/firebase-hosting-merge.yml)
&nbsp;Live site: [karing-a8b53.web.app](https://karing-a8b53.web.app/) (lists stay empty until the new database rules are deployed) &nbsp;·&nbsp; Built 2023 · Revised 2026 &nbsp;·&nbsp; [Tóm tắt tiếng Việt](#tóm-tắt-tiếng-việt)

![Karing home page](docs/screenshots/home.webp)

## The problem

Many stroke patients in Vietnam recover at home, with their families as caregivers. Those families need help from people with stroke-care skills, but had no simple way to find them. Qualified caregivers had no simple way to reach those families either.

Karing puts both sides in one place. Families post a patient profile. Caregivers post their experience and rate. Both can read practical information about stroke.

## What we built (2023)

- **Patient and caregiver listings** so each side can find the other.
- **Stroke information**: what a stroke is, its causes, how to recognize it (F.A.S.T.), diagnosis and prevention.
- **News and articles** about stroke care, served from the database.
- **Accounts** with email and password sign-up and sign-in.

**Research behind it:** we interviewed 36 families, 24 caregivers and 5 healthcare institutions, and turned what we heard into the requirements and the site map.

**Results**

- Connected 60+ stroke patient families with caregivers.
- 3rd place, SV.Startup V Vietnam National Competition.
- Paper: Bui, D. K. (2023). *A Web-Based Solution to Caring for Stroke Patients at Home in Vietnam.* 17th NEU-KKU International Conference on Socio-Economic and Environmental Issues in Development.
- Project ownership transferred to O Xanh Internet Technology Company for continued development.

## My role

I was the CTO of a 7-member student team. I led the team, turned the field research into requirements and design decisions, and wrote most of the front-end code.

The code was first built in a separate team repository and later moved into this one from a teammate's account, so the commit history here does not show who wrote what.

In 2026 I came back to the code on my own and revised it. That work is described [below](#2026-revision-what-i-changed-and-why).

## How it works

```mermaid
flowchart LR
    U[Browser] -->|HTML, CSS, JS| H[Firebase Hosting<br/>static files in public/]
    U -->|page scripts read data| DB[(Realtime Database)]
    U -->|sign up / sign in| A[Firebase Auth]
    DB -. "aricles: public read<br/>db/pt: signed-in users only" .- R[database.rules.json]
    G[GitHub Actions] -->|tests pass| H
```

In words:

1. Firebase Hosting serves plain static pages from `public/`. There is no build step.
2. Each page loads two ES modules: `js/layout.js` draws the shared navigation and footer, and one page script in `js/pages/` describes how to render that page's data. `js/view.js` does the loading, error and sign-in handling for all of them.
3. Page scripts read articles and patient profiles from the Realtime Database. `database.rules.json` makes articles public and patient profiles readable only by signed-in users.
4. Firebase Authentication handles email and password accounts.
5. GitHub Actions runs the tests on every pull request and on `main`. A deploy happens only when the tests pass.

## 2026 revision: what I changed and why

The original 2023 code is kept under the tag [`v1-2023`](https://github.com/EliteVanor/Karing-Webapp/tree/v1-2023) for comparison. I kept the visual design the same and changed the engineering underneath. Every change has a test, or a pixel comparison of every page against screenshots of the original.

| Problem in the 2023 code | What I changed | How I checked it |
|---|---|---|
| Every page loaded one `main.js` that ran every database query, so pages crashed on data that was not theirs | One small module per page, plus shared `firebase.js`, `auth.js`, `dom.js`, `format.js` and `view.js` (loading, errors and sign-in handling in one place) | No JS errors on any page (e2e test) |
| Database text was inserted as raw HTML, so a stored record could run scripts (XSS) | All database content is rendered as text through one helper. Image URLs must be `http(s)` | Tests feed hostile records and check that nothing runs |
| The database rules were in test mode and expired in June 2026. Anyone could read and write while they were active | `database.rules.json`: no client writes, public articles, patient data for signed-in users only | Tests cover signed-out, signed-in and permission-denied states |
| The 110-line nav and the footer were copied into 8 pages, and the copies had drifted (a typo in one footer email, a wrong active link) | One nav and footer template in `layout.js` | Pixel diff against the original pages |
| About 2,800 lines of CSS across 5 files, most of the rules copied between them | `base.css` for shared rules, one small file per page type | Pixel diff: identical apart from the intended fixes |
| The fixed nav was wider than a 1280px laptop screen, so the Contact and Login buttons could not be reached | The nav shrinks to the screen width | e2e test clicks both buttons at 1280px |
| The age row overlapped the patient name and swallowed clicks on it | The link sits above the overlap | Regression test, confirmed to fail on the old CSS |
| The login popup was a mock-up, sign-up and sign-in pages were unstyled, and links pointed to a missing `login.html` | Working login popup (loads Firebase only when used), styled pages, Vietnamese error messages, redirects for old URLs | e2e tests of sign-in, sign-out and sign-up |
| `facebook.png` was linked with the wrong letter case, so it was missing on the live (case-sensitive) server | Lower-case kebab-case file names | No 404s on any page (e2e test) |
| 2.7 MB of images, half of them unused | Unused files deleted, photos converted to WebP | Image folder is now about 360 KB |
| CI ran `npm run build`, which did not exist, so every run failed | CI installs, runs unit and e2e tests, then deploys | YAML validated locally. The first real run is the next push |

## What I would do differently today

- **Security rules on day one.** Test-mode rules are a start-up shortcut that quietly expires and leaves data open while it lasts.
- **Mobile first.** Families mostly use phones, and the 2023 layout is fixed-width. A responsive layout is the next piece of work.
- **Real access control for health data.** Signed-in-only is better than public, but any account can still sign up. Patient data needs roles (family, caregiver, admin) and consent records.
- **A data model before pages.** The database key `aricles` (sic) still carries a typo, because renaming it needs a data migration.
- **Tests from the start.** The stub-based e2e tests in `tests/` found two bugs that had been live since 2023: the unreachable nav buttons and the unclickable patient names.

## Screenshots

| Patients and caregivers on the home page | Stroke information |
|---|---|
| ![Patient and caregiver cards, photos and names blurred](docs/screenshots/home-people.webp) | ![Stroke information page](docs/screenshots/info.webp) |
| **Patient listing (sample data)** | **News** |
| ![Patient listing with sample records](docs/screenshots/patients.webp) | ![News page](docs/screenshots/news.webp) |

Photos and names of real people are blurred. The patient listing shows made-up sample records.

## Project structure

```
public/                 Everything Firebase Hosting serves
  *.html                One file per page (home, info, listings, news, detail, auth, 404)
  css/
    base.css            Shared: reset, nav, modals, footer
    home.css, info.css, listing.css, news.css, auth.css
  js/
    layout.js           Shared nav, contact and login modals, footer
    firebase.js         Firebase setup and database paths (the only file that knows the project)
    auth.js             Sign in, sign up, sign out, auth state
    dom.js              Safe element builder and small DOM helpers
    format.js           Pure helpers (names, error messages, URL and key checks), unit tested
    view.js             Binds a page element to a database path: loading, empty, error, sign-in
    pages/              One script per page that needs data or behavior
  images/
tests/
  unit/                 node:test tests for format.js
  e2e/                  Playwright tests for every page, desktop and mobile
  support/              Firebase stub, sample data, offline page server
database.rules.json     Realtime Database security rules
firebase.json           Hosting config, redirects for old URLs, cache headers
.github/workflows/      Test, then deploy (main) or preview (pull requests)
```

## Run it locally

You need Node.js 20 or newer.

```bash
npm install
npm start
```

Then open http://localhost:5000. The local site talks to the real Firebase project, so lists stay empty unless the database rules allow the read.

## Tests

```bash
npx playwright install chromium
npm test
```

`npm test` runs the unit tests (`node --test`) and the Playwright tests. The Playwright tests need no network. They serve `public/` from disk and replace the Firebase SDK with a stub (`tests/support/firebase-stub.js`) that returns made-up data, so they can test empty, error and hostile-data cases that the real database cannot produce on demand.

## Deploy

- **Hosting** deploys automatically from `main` after the tests pass. Pull requests from this repository get a preview channel.
- **Database rules** do not deploy automatically. After a change to `database.rules.json`, run:

```bash
npx firebase-tools deploy --only database --project karing-a8b53
```

## Known limitations

- The layout is fixed-width from the 2023 design, so phones show a zoomed-out page. The Playwright interaction tests run on desktop only for this reason.
- Search forms, filters, the newsletter box and the caregiver listing are static mock-ups from the 2023 prototype.
- Any visitor can create an account, and every account can read patient profiles. See "What I would do differently today".

## Team and credits

Built in 2023 by a 7-member student team in Hanoi. In 2023, ownership was transferred to O Xanh Internet Technology Company for continued development.

## Tóm tắt tiếng Việt

**Karing** là nền tảng web kết nối gia đình có người bệnh đột quỵ với người chăm sóc tại nhà có chuyên môn. Dự án được nhóm 7 sinh viên xây dựng năm 2023, dựa trên khảo sát 36 gia đình, 24 người chăm sóc và 5 cơ sở y tế. Karing đã kết nối hơn 60 gia đình, đạt giải Ba cuộc thi SV.Startup V toàn quốc và được chuyển giao cho Công ty Công nghệ Internet O Xanh.

Năm 2026, mã nguồn được viết lại phần kỹ thuật nhưng giữ nguyên giao diện: tách mã theo từng trang, chống chèn mã độc (XSS) từ cơ sở dữ liệu, thêm quy tắc bảo mật cho dữ liệu bệnh nhân, sửa lỗi điều hướng và đăng nhập, giảm dung lượng ảnh từ 2,7 MB xuống khoảng 360 KB, và thêm kiểm thử tự động chạy trên GitHub Actions. Mã gốc năm 2023 được giữ tại tag `v1-2023`.
