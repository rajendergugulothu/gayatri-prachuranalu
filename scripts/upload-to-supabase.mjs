#!/usr/bin/env node
// Upload the COMPRESSED book PDFs to a PRIVATE Supabase Storage bucket named "books".
// Run compress-pdfs.mjs first.
//
// SETUP:
//   1) In Supabase -> Storage, create a bucket named  books  (PRIVATE — leave "Public" off).
//   2) Create  scripts/.env  (copy from scripts/.env.example) with:
//        SUPABASE_URL=https://btkukllszsqmjbpuzsde.supabase.co
//        SUPABASE_SERVICE_ROLE_KEY=<service_role key from Supabase -> Settings -> API>
//      scripts/.env is gitignored — never commit it.
//   3) npm install        (from scripts/)
//   4) node upload-to-supabase.mjs

import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { BOOKS, slugify } from './books.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
const ROOT = path.resolve(__dirname, '..');
const OPT_DIR = path.join(ROOT, 'assets', 'books-optimized');
const BUCKET = 'Books';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in scripts/.env first (see scripts/.env.example).');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

let ok = 0, missing = 0, failed = 0;
for (const b of BOOKS) {
  const id = slugify(b.en);
  const optAbs = path.join(OPT_DIR, id + '.pdf');
  if (!existsSync(optAbs)) {
    console.warn(`SKIP (no compressed file): assets/books-optimized/${id}.pdf — run compress-pdfs.mjs first`);
    missing++;
    continue;
  }
  const bytes = await readFile(optAbs);
  const { error } = await supabase.storage.from(BUCKET).upload(`${id}.pdf`, bytes, {
    contentType: 'application/pdf',
    upsert: true,
  });
  if (error) { console.error('FAILED', id, '-', error.message); failed++; continue; }
  console.log('uploaded ->', `${BUCKET}/${id}.pdf`);
  ok++;
}

console.log(`\nDone. uploaded=${ok} missing=${missing} failed=${failed}`);
if (failed === 0 && missing === 0) {
  console.log('Next: add the 3 env vars in Vercel, set USE_REMOTE_BOOKS=true in index.html, redeploy.');
}
