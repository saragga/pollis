# XBRL Financial Data

Three endpoints expose the structured financial numbers tagged in filings. All return JSON and share the same `us-gaap` vocabulary.

## Company Facts — everything, one company

`/api/xbrl/companyfacts/CIK##########.json` returns **every concept** a company has reported, in one (large) document.

```julia
facts = company_facts("320193")
gaap  = facts.facts[Symbol("us-gaap")]      # us-gaap has a hyphen → index by Symbol
collect(keys(gaap))                          # all reported concept tags
```

The structure is `facts → "us-gaap" → <Tag> → units → <Unit> → [observations]`.

## Company Concept — one concept, over time

`/api/xbrl/companyconcept/CIK##########/us-gaap/<Tag>.json` is the same data narrowed to a single concept — lighter to fetch when you only want one line item.

```julia
obs = company_concept("320193", "us-gaap", "NetIncomeLoss").units.USD
```

Each observation has: `start`, `end` (the period), `val`, `fy` / `fp` (fiscal year / period), `form` (10-K, 10-Q), `filed`, `accn` (accession number), and sometimes `frame`.

## Frames — one concept, one period, all filers

`/api/xbrl/frames/us-gaap/<Tag>/<Unit>/<Frame>.json` returns one concept for one **period frame** across every filer that reported it — a cross-section rather than a time series.

```julia
data = xbrl_frames("us-gaap", "Assets", "USD", "CY2022Q4I").data   # one entry per filer: cik, entityName, val
```

## Reading the Period Frame

The frame string encodes the period:

| Frame | Meaning |
|---|---|
| `CY2022Q4I` | Instant at the end of Q4 2022 (trailing **I**) — for stocks (Assets, Cash) |
| `CY2022Q4` | The Q4 2022 quarter — for flows (Revenues, NetIncome) |
| `CY2022` | The full calendar year 2022 — for annual flows |

Use **instant** frames (`...I`) for balance-sheet items and **duration** frames (no `I`) for income/cash-flow items.

## Choosing a Tag

Concept tags follow the us-gaap taxonomy. Common ones:

| Tag | Line item |
|---|---|
| `Revenues` / `RevenueFromContractWithCustomerExcludingAssessedTax` | Revenue |
| `NetIncomeLoss` | Net income |
| `Assets` / `Liabilities` / `StockholdersEquity` | Balance sheet totals |
| `CashAndCashEquivalentsAtCarryingValue` | Cash |
| `CommonStockSharesOutstanding` | Shares outstanding |

> Different companies tag the same economic figure with different concepts (e.g. the two revenue tags above). When comparing filers, check which tag each one actually uses — `companyfacts` lists them all.

## See Also
- [Accessing Data](accessing-data.md) · [Finding a Company](finding-a-company.md) · [Factsheet](factsheet.md)
