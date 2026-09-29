# Overview

Every public company in the United States files its disclosures with the SEC through **EDGAR**. Since 2009 the financial statements in those filings are tagged in **XBRL** (eXtensible Business Reporting Language), which is what makes them machine-readable. The SEC publishes this data through open JSON REST APIs at `data.sec.gov`.

## The Two Halves of EDGAR

- **Filings** — the documents themselves: 10-K (annual report), 10-Q (quarterly), 8-K (material events), Forms 3/4/5 (insider trades), 13F (institutional holdings), and many more.
- **XBRL facts** — the structured financial numbers extracted from those filings: revenue, assets, net income, shares outstanding, and hundreds of other concepts, each tagged with a standard **us-gaap** name, a unit, and a reporting period.

## How You Identify a Company

Companies are keyed by **CIK** (Central Index Key), an integer. In the `data.sec.gov` URLs the CIK is **zero-padded to 10 digits** (Apple's `320193` becomes `CIK0000320193`). If you only have a ticker, resolve it first via `company_tickers.json` (see Finding a Company).

## The Five Topics in This Webview

- **Submissions** — a filer's filing history (`/submissions/`).
- **Company Facts** — every XBRL fact for one company (`/api/xbrl/companyfacts/`).
- **Company Concept** — one concept over time (`/api/xbrl/companyconcept/`).
- **Frames** — one concept across all filers for a period (`/api/xbrl/frames/`).
- **Full-Text Search** — search filing text and resolve tickers (`efts.sec.gov`).

## Typical Workflow

1. Set the required `User-Agent` (see Accessing Data).
2. Find the company's CIK (see Finding a Company).
3. Call the `EDGAR.jl` function for what you need — `fetch_submissions`, `company_concept`, `xbrl_frames`, ...
4. Tidy the returned JSON3 object into a table or time series.

## EDGAR vs FRED

- **EDGAR** — company-level disclosures and financial statements, by CIK.
- **FRED** (`FredData.jl`) — aggregate macroeconomic series, by series ID.

The **Compare** link in the Concept Map cross-references the two.

## See Also
- [Factsheet](factsheet.md) · [Finding a Company](finding-a-company.md) · [Search Modes](search-modes.md)
