# US SEC EDGAR — Finding a Company

Every filer is identified by a **CIK** (Central Index Key). Once you have it, every data API is one request away. This page covers how to get from a name or ticker to a CIK.

## The CIK

The CIK is an integer assigned by the SEC. Two rules matter:

- In the **`data.sec.gov`** APIs it must be **zero-padded to 10 digits**: `lpad(320193, 10, '0')` → `"0000320193"`, used as `CIK0000320193`.
- In the **filing archive** URLs (`www.sec.gov/Archives/edgar/data/...`) the CIK is **not** padded.

## Ticker to CIK

The SEC publishes a ticker → CIK map at [company_tickers.json](https://www.sec.gov/files/company_tickers.json). It is a JSON object keyed by row number; each value has `cik_str`, `ticker`, and `title`.

```julia
using EDGAR

cik_for_ticker("AAPL")   # "0000320193"
```

`cik_for_ticker` fetches the SEC's ticker map, matches case-insensitively, and returns the zero-padded CIK (or `nothing`). The map is cached, so repeated lookups in a session do not re-request it.

## Name to CIK

For a name rather than a ticker, fetch the raw map with `company_tickers()` and filter on `title`:

```julia
tickers = company_tickers()
matches = [v for (_, v) in tickers if occursin("TESLA", uppercase(String(v.title)))]
```

For anything fuzzier, use the **Full-Text Search** model or the EDGAR company-search UI at [sec.gov/cgi-bin/browse-edgar](https://www.sec.gov/cgi-bin/browse-edgar).

## A Few CIKs

| Company | Ticker | CIK |
|---|---|---|
| Apple Inc. | AAPL | 320193 |
| Microsoft Corp. | MSFT | 789019 |
| Tesla, Inc. | TSLA | 1318605 |
| Amazon.com, Inc. | AMZN | 1018724 |
| Berkshire Hathaway | BRK-B | 1067983 |

> The submission JSON for a CIK also echoes the company's `tickers`, `sicDescription`, and addresses — handy for confirming you have the right filer.
