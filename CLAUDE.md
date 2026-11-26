# Karing Webapp: notes for Claude

Static site on Firebase Hosting. No build step: `public/` is served as-is.

## Layout
- `public/*.html`: one file per page. Each page has `<nav id="site-nav" data-active="...">` and
  `<footer id="site-footer">`, which `public/js/layout.js` fills. Edit the nav and footer there, never in pages.
- `public/js/firebase.js` is the only file that knows the Firebase project and database paths.
- Database text must go through `h()` in `public/js/dom.js` (text only). Never use innerHTML with data.
- The database key `aricles` (sic) is real. Do not "fix" the spelling without a data migration.
- Patient records are real people's data: readable by signed-in users only (`database.rules.json`).
  Never put real patient data in tests, fixtures or screenshots.

## Commands
- `npm test`: unit tests (`node --test`) plus Playwright e2e (offline, Firebase stubbed by `tests/support/`).
- `npm start`: local server on port 5000.
- Database rules deploy by hand: `npx firebase-tools deploy --only database --project karing-a8b53`.
- Merging to `main` deploys to production. Do not merge without the owner's approval.

## When compacting
Keep the list of modified files, the test commands and open decisions.
