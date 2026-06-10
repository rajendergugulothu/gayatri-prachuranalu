# Phase 2 — Optimize PDFs & serve them privately from Supabase

Goal: the paid PDFs (a) become small enough to read online, and (b) stop being publicly
downloadable. They move into a **private** Supabase Storage bucket, and a tiny **Vercel function**
(`api/book-url.js`) checks the visitor is signed in with Firebase before handing back a 60-second
signed link. Covers stay public on Vercel. **No card / no Firebase Blaze needed.**

> **Sizes:** the original scans are **100–200 MB each (2.1 GB total)** and must be compressed first.

## 1. Install Ghostscript (one time)
```sh
winget install --id ArtifexSoftware.GhostScript -e   # or use the official installer
```
(Claude may have already installed this for you.)

## 2. Compress the PDFs
```sh
cd scripts
node compress-pdfs.mjs
```
Writes `assets/books-optimized/<id>.pdf` (default ~150 dpi). Open one and confirm the Telugu text
is sharp. Too blurry → `PDF_QUALITY=/printer node compress-pdfs.mjs`. Too big → `PDF_QUALITY=/screen ...`.

## 3. Create the Supabase bucket
Supabase → **Storage → New bucket** → name it **`books`** → keep it **Private** (leave "Public" off).

## 4. Upload the compressed PDFs
```sh
cd scripts
cp .env.example .env        # then fill in the two values
npm install
node upload-to-supabase.mjs
```
`.env` needs `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Project Settings → API).
`.env` is gitignored — never commit it. Files land at `books/<id>.pdf`.

## 5. Set the Vercel environment variables
Vercel → your project → **Settings → Environment Variables** (Production + Preview):
| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://btkukllszsqmjbpuzsde.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | the Supabase service_role secret |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase → Project settings → Service accounts → *Generate new private key* → paste the whole JSON |

Vercel installs the function's deps automatically from the root `package.json`. If the project's
framework preset isn't already "Other", set it so there's no build step (static site + `/api`).

## 6. Turn on remote reading
In `index.html`, set `const USE_REMOTE_BOOKS = true;` and redeploy to Vercel.

## 7. Verify
- Signed in → "Read Online" streams the book from Supabase. ✅
- Signed out → reader prompts for sign-in; `/api/book-url` returns 401. ✅
- A raw Supabase object URL without a fresh signed token → denied. ✅
- Old public path `…/assets/Books_to_upload/…` should 404 (PDFs are gitignored; if you deploy via the
  Vercel CLI from the working tree, also add `assets/Books_to_upload/` to a `.vercelignore`).

---

**Not done here (intentionally):** real payment + download gating. Downloads only unlock after
verified payment — that's Phase 5 (Razorpay), which reuses this same Vercel backend. Until then,
reading is free for signed-in users.
