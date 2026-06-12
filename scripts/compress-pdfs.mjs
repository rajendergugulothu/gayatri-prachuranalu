#!/usr/bin/env node
// Compress the large scanned PDFs with Ghostscript so they're usable online and cheap to host.
// The originals are 100-200 MB each (2.1 GB total) — far too big to read in a browser.
//
// PREREQ: install Ghostscript once -> `winget install --id ArtifexSoftware.GhostScript -e`
// RUN:    cd scripts && node compress-pdfs.mjs
// OUTPUT: assets/books-optimized/<id>.pdf
//
// These are heavy scans, so we convert to grayscale (the text is black ink) and downsample.
// Default 85 dpi keeps Telugu text readable while keeping files small/fast (and under Supabase's
// 50 MB free-tier limit). Override with PDF_DPI, e.g. `PDF_DPI=100 node compress-pdfs.mjs` for sharper.

import { existsSync, mkdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOOKS, slugify } from './books.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets', 'books-optimized');
const DPI = process.env.PDF_DPI || '85';

function findGhostscript() {
  const candidates = [process.env.GS_BIN, 'gswin64c', 'gswin32c', 'gs'].filter(Boolean);
  for (const c of candidates) {
    try {
      const r = spawnSync(c, ['--version'], { encoding: 'utf8' });
      if (r.status === 0) return c;
    } catch { /* try next */ }
  }
  return null;
}

const GS = findGhostscript();
if (!GS) {
  console.error('Ghostscript not found. Install it once:\n  winget install --id ArtifexSoftware.GhostScript -e\nthen re-open the terminal and run again.');
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
const mb = b => (b / 1048576).toFixed(1) + ' MB';

let totalIn = 0, totalOut = 0, done = 0, skipped = 0;
for (const b of BOOKS) {
  const id = slugify(b.en);
  const inAbs = path.resolve(ROOT, b.src); // resolve() so absolute src paths (external folders) work too
  const outAbs = path.join(OUT_DIR, id + '.pdf');
  if (existsSync(outAbs) && !process.env.FORCE) { console.log(`already done, skipping: ${id}.pdf`); skipped++; continue; }
  if (!existsSync(inAbs)) { console.warn('SKIP (missing):', b.src); skipped++; continue; }
  const args = [
    '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.5',
    '-dDownsampleColorImages=true', `-dColorImageResolution=${DPI}`, '-dColorImageDownsampleType=/Bicubic',
    '-dDownsampleGrayImages=true', `-dGrayImageResolution=${DPI}`, '-dGrayImageDownsampleType=/Bicubic',
    '-dDownsampleMonoImages=true', '-dMonoImageResolution=300',
    '-sColorConversionStrategy=Gray', '-dProcessColorModel=/DeviceGray',
    '-dDetectDuplicateImages=true', '-dNOPAUSE', '-dQUIET', '-dBATCH',
    `-sOutputFile=${outAbs}`, inAbs,
  ];
  process.stdout.write(`compressing ${id}.pdf ... `);
  const r = spawnSync(GS, args, { stdio: ['ignore', 'ignore', 'inherit'] });
  if (r.status !== 0 || !existsSync(outAbs)) { console.error('FAILED'); continue; }
  const inSz = statSync(inAbs).size, outSz = statSync(outAbs).size;
  totalIn += inSz; totalOut += outSz; done++;
  console.log(`${mb(inSz)} -> ${mb(outSz)}  (${Math.round((1 - outSz / inSz) * 100)}% smaller)`);
}

console.log(`\nDone. ${done} compressed, ${skipped} skipped.  Total ${mb(totalIn)} -> ${mb(totalOut)}  (grayscale ${DPI} dpi)`);
console.log('Each file should be well under 50 MB. Open one in assets/books-optimized/ to check the text.');
console.log('Too blurry? re-run with PDF_DPI=120. Too big? PDF_DPI=85.');
console.log('Happy with it? -> node upload-to-supabase.mjs');
