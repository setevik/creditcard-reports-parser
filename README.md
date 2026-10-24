# Credit Card Reports Parser

A browser-based tool that turns an Israeli credit card statement export into a
categorized expense summary. Upload the Excel or CSV file your provider gives
you and get spending grouped by vendor, category and billing period.

Supports **Isracard**, **Cal** (כאל) and **Max** (מקס). The UI is available in
English, Hebrew, Russian and French.

Live at <https://creditcard-reports-parser.vercel.app/>

## How your data is handled

Parsing, categorization and aggregation all run client-side. There is no
backend and no upload endpoint. Card nicknames you type are kept in
`localStorage`, and can be cleared from the upload screen.

## Getting started

```bash
npm install
npm run dev
```

## Exporting your statement

- **Isracard** — log in at `digital.isracard.co.il`, open Charge Details
  (פירוט חיובים), pick a billing period, Export to Excel.
- **Cal** — log in at `digital-web.cal-online.co.il`, open transaction details
  (פירוט עסקאות), pick the billing month, ייצוא לאקסל.
- **Max** — log in at `max.co.il`, open Charge Details (פירוט חיובים), pick the
  billing month, ייצוא לאקסל.

Only the original export format is supported. PDF statements are not.

## How it works

```
src/
  utils/parser.js       Detects the provider layout and extracts transactions
  utils/categorizer.js  Maps vendor/sector text to one of ~17 categories
  utils/aggregator.js   Groups transactions by vendor, category and period
  utils/cardAliases.js  Remembers card nicknames in localStorage
  components/           Upload, results table, summary, export guide, language picker
  contexts/             Language/translation provider
```

Categorization is keyword matching over transliterated vendor text, with a
fuzzy pass via Fuse.js for near-misses. Unrecognized vendors fall through to
`Other`.
