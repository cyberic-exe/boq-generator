# BOQ Generator

A browser-based **Bill of Quantities (BOQ)** generator built with HTML, Bootstrap 5, and modular vanilla JavaScript. Designed as a static front-end tool for creating professional BOQs, managing category-based line items, saving drafts locally, and exporting results to Excel or PDF.

---

## Features

- **Project Information** — Create and edit project-level BOQ metadata
- **Dynamic Categories & Items** — Add, remove, and manage work categories with line items
- **Auto Calculations** — Quantity × Rate = Amount, with subtotal, markup, and grand total
- **Draft Management** — Save, load, preview, and delete drafts via `localStorage`
- **Construction Pricelist** — Built-in dataset with 200+ items across 20 categories
- **Excel Export** — Professional formatted `.xlsx` via ExcelJS
- **PDF Export** — Print-ready PDF via jsPDF + AutoTable
- **Responsive Design** — Mobile-optimized tables, inputs, and modals
- **XSS Protection** — All user-supplied values are HTML-escaped before rendering

---

## Project Structure
boq-generator/
├── index.html # Main UI, layout, and script loading
├── README.md # This file
├── css/
│ └── styles.css # Custom application styles (Bootstrap loaded via CDN)
└── js/
├── core.js # Category/item CRUD, totals, notifications, datalists
├── draft.js # Draft save/load/preview/delete (localStorage)
├── pricelist.js # Pricelist dataset, modal, search, add-to-BOQ
├── export-excel.js # Excel export (ExcelJS)
└── export-pdf.js # PDF export (jsPDF + AutoTable)

---

## File Overview

| File | Purpose |
|------|---------|
| `index.html` | Main UI structure, CDN dependencies, inline helpers, initialization |
| `css/styles.css` | Theme overrides, form sizing, table responsiveness, BOQ builder section styles |
| `js/core.js` | Core logic: category/item rendering, calculations, notifications, custom data persistence, `escapeHtml` utility |
| `js/draft.js` | Draft CRUD operations with overwrite confirmation and preview modals |
| `js/pricelist.js` | `CONSTRUCTION_PRICELIST` dataset, `FLAT_CONSTRUCTION_PRICELIST` index, modal rendering, search/filter, add-to-BOQ |
| `js/export-excel.js` | Professional Excel generation with formatted headers, categories, and totals |
| `js/export-pdf.js` | PDF generation with autoTable, page footers, and totals section |

---

## How To Run

1. Open `index.html` in any modern browser
2. Enter project details (name, client, location, etc.)
3. Add categories manually or select from the built-in list
4. Add line items via the pricelist or type custom descriptions
5. Adjust quantities, rates, and markup percentage
6. Save as draft or export to Excel/PDF

> **No server required.** This is a fully static front-end application.

---

## Dependencies (CDN)

| Library | Version | Purpose |
|---------|---------|---------|
| Bootstrap | 5.3.3 | UI framework |
| Bootstrap Icons | 1.8.1 | Icon set |
| ExcelJS | 4.4.0 | Excel file generation |
| FileSaver.js | 2.0.5 | File download helper |
| SheetJS (xlsx) | latest | Legacy Excel fallback |
| jsPDF | 2.5.1 | PDF generation |
| jsPDF AutoTable | 3.5.28 | PDF table plugin |

---

## Architecture Notes

### Data Flow
User Input → core.js (rendering + calculation)
↓
draft.js (localStorage persistence)
↓
export-excel.js / export-pdf.js (file generation)

### Key Patterns

- **`escapeHtml()`** — Defined in `core.js`, exposed on `window`. All user-supplied values are escaped before `innerHTML` injection to prevent XSS.
- **`FLAT_CONSTRUCTION_PRICELIST`** — A flattened index (`{ labor: [], materials: [] }`) built from the category-keyed `CONSTRUCTION_PRICELIST` object. Used for fast lookups.
- **`parseNumber()` / `formatNumber()`** — Defined inline in `index.html` as `window.*` globals. Used across all modules.
- **Custom data persistence** — User-created categories and descriptions are stored in `localStorage` under the key `boqCustomData` and marked with `✩` in datalists.

### Security

- All user-supplied strings (category names, item descriptions, project names, draft names) are passed through `escapeHtml()` before being injected into the DOM via `innerHTML`.
- Pricelist data is hardcoded and treated as trusted, but is also escaped in render functions for defense-in-depth.

---

## Browser Support

- Chrome / Edge (latest)
- Firefox (latest)
- Safari (latest, including iOS)

> Drafts are stored per-browser via `localStorage`. Clearing browser data will remove saved drafts.

---

## Future Improvements

- [ ] Event delegation for item rows (performance)
- [ ] Remove inline `onclick` handlers in favor of `addEventListener`
- [ ] Consolidate duplicate `showNotification` definitions
- [ ] Add undo/redo for category/item deletion
- [ ] Import BOQ from existing Excel file
- [ ] Multi-currency support
- [ ] Print stylesheet for direct browser printing

---

## License

MIT