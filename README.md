# STRUX — Civil & Structural Engineering Suite

A professional React web app for structural and civil engineering calculations, covering IS and IRC codes with Excel report export.

---

## Quick Start

```bash
cd strux
npm install
npm run dev
# Open http://localhost:5173
```

---

## Project Structure

```
strux/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                   # React root
    ├── App.jsx                    # Router — imports from pages/
    │
    ├── pages/                     # ← ONE FILE PER PAGE
    │   ├── BeamPage.jsx           # Beam design
    │   ├── ColumnPage.jsx         # Column design
    │   ├── SlabPage.jsx           # Slab design
    │   ├── FoundationPage.jsx     # Foundation design
    │   ├── RoadPage.jsx           # Road design
    │   └── OtherPages.jsx         # Bridge + BOQ + Report
    │
    ├── components/
    │   ├── Navbar.jsx             # Top navigation
    │   ├── ui/index.jsx           # Shared UI: Card, StatBox, UtilBar...
    │   └── charts/
    │       └── DiagramCanvas.jsx  # Canvas SFD/BMD renderer
    │
    ├── engines/                   # Pure calculation logic (no React)
    │   ├── beamEngine.js          # analyzeBeam, checkBeamSection
    │   ├── structuralEngine.js    # analyzeColumn, analyzeSlab, analyzeFoundation
    │   └── roadEngine.js          # calcHorizontalCurve, calcPavement, calcBridgeLoads
    │
    ├── utils/
    │   └── excelExport.js         # Full Excel report builder (SheetJS)
    │
    └── styles/
        ├── global.css             # CSS reset
        └── tokens.js              # All colours, fonts, shared style objects
```

---

## Design Codes

| Module | Code |
|--------|------|
| Beam / Column / Slab / Foundation | IS 456:2000 · IS 800:2007 |
| Foundation (raft) | IS 2950 |
| Foundation (pile) | IS 2911 |
| Road — horizontal & vertical curves | IRC 73 · IRC 52 |
| Road — pavement | IRC 37 |
| Bridge loading | IRC:6 |

---

## Excel Export

Go to the **Report** page → fill project info → click **Export Full Report (.xlsx)**.

The workbook contains:
- Cover sheet with project details
- One sheet per module — inputs, results, code checks, utilization bars
- Colour-coded PASS/FAIL cells and professional formatting

---

## Adding a New Page

1. Create `src/pages/YourPage.jsx`
2. Add your engine function to `src/engines/`
3. Import the page in `App.jsx` and add a case in `renderPage()`
4. Add the module to `MODULES` in `src/components/Navbar.jsx`
5. Add an Excel sheet builder in `src/utils/excelExport.js`


---

## React Router (added in v1.1)

Every module now has its own real URL:

| Page | URL |
|------|-----|
| Beam Design | `/beam` |
| Column Design | `/column` |
| Slab Design | `/slab` |
| Foundation Design | `/foundation` |
| Road Design | `/road` |
| Bridge Loads | `/bridge` |
| Estimation & BOQ | `/boq` |
| Design Report | `/report` |

**What this gives you:**
- Browser back/forward works between modules
- Bookmarkable URLs — share `/foundation` directly
- `NavLink` auto-highlights the active tab
- `/` redirects to `/beam` automatically
- Unknown paths fall back to `/beam`

**Route config lives in `src/routes/index.js`** — add a new route there and it
automatically appears in the Navbar and gets a breadcrumb. No other files to touch.
