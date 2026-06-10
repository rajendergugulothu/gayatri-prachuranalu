// Shared book list + slug rule for the Phase 2 scripts (compress + upload).
// slugify() mirrors the one in index.html so book ids line up everywhere:
//   index.html book.id  ===  slugify(en)  ===  Storage path books/<id>/<id>.pdf
export const slugify = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// `src` = the original large scan (relative to repo root). id is derived from `en`.
export const BOOKS = [
  { en: 'Padmodbhava Samhita',                src: 'assets/Books_to_upload/Agama Related/Padmodbhava Samhita.pdf' },
  { en: 'Shrimannarayana Samhita - Part 2',   src: 'assets/Books_to_upload/Agama Related/Part 2 Shrimannarayana Samhita.pdf' },
  { en: 'Vishnu Samhita',                     src: 'assets/Books_to_upload/Agama Related/Vishnu Samhita.pdf' },
  { en: 'Aapasthambha Kalpasuthram - Part 1', src: 'assets/Books_to_upload/Dharma Sutras/005 part 1 aapasthambha kalpasuthram.pdf' },
  { en: 'Ashvalaayana Gruhasyasuthramu',      src: 'assets/Books_to_upload/Dharma Sutras/ashvalaayana gruhasyasuthramu.pdf' },
  { en: 'Bhodhayana Dharma Suthramu',         src: 'assets/Books_to_upload/Dharma Sutras/bhodhayana dharma suthramu.pdf' },
  { en: 'Manusmruthi',                        src: 'assets/Books_to_upload/Dharma Sutras/Manusmruthi.pdf' },
  { en: 'Aapasthambha Kalpasuthram',          src: 'assets/Books_to_upload/Dharma Sutras/part 1 aapasthambha kalpasuthram.pdf' },
  { en: 'Shrimad Bhagavatham - Part 1',       src: 'assets/Books_to_upload/Puranas/Shrimad Bhagavatham/Part 1(1,2 sk) shrimad Bhagavatham.pdf' },
  { en: 'Shrimad Bhagavatham - Part 2',       src: 'assets/Books_to_upload/Puranas/Shrimad Bhagavatham/Part 2 (3 sk) Shrimad Bhagavatham.pdf' },
  { en: 'Shrimad Bhagavatham - Part 4',       src: 'assets/Books_to_upload/Puranas/Shrimad Bhagavatham/Part 4 (5,6 sk) shrimad Bhagavatham .pdf' },
  { en: 'Shrimad Bhagavatham - Part 6',       src: 'assets/Books_to_upload/Puranas/Shrimad Bhagavatham/Part 6(8,9sk) shrimad Bhagavatham.pdf' },
  { en: 'Shrimad Bhagavatam - Part 8',        src: 'assets/Books_to_upload/Puranas/Shrimad Bhagavatham/Part 8 (10 SK) Shrimadbhagavatam.pdf' },
  { en: 'Shrimad Bhagavatham - Part 9',       src: 'assets/Books_to_upload/Puranas/Shrimad Bhagavatham/Part 9(10sk) Shrimad Bagavatham .pdf' },
];
