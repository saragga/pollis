# US SEC EDGAR — Search Modes

EDGAR offers several ways to *find* filings before you pull their data. This page covers the three you can drive from Julia.

## Full-Text Search (EFTS)

The EDGAR full-text search service indexes the **contents** of filings from 2001 onward. Its JSON API lives at `efts.sec.gov`:

```julia
using EDGAR

res = full_text_search("climate risk"; forms = "10-K")

res.hits.total.value          # number of matching filings
for h in first(res.hits.hits, 5)
    s = h._source
    println(s.file_date, "  ", s.form, "  ", first(s.display_names))
end
```

`full_text_search` URL-encodes the query for you. Useful keyword arguments:

| Argument | Meaning |
|---|---|
| `query` (positional) | The query (wrap in quotes for an exact phrase) |
| `forms` | Restrict to form types, e.g. `"10-K"` or `"10-K,10-Q"` |
| `startdate` / `enddate` | Date range, `"YYYY-MM-DD"` |
| `from` / `size` | Paging offset and page size |

Each hit's `_id` combines the accession number and the document, so you can build the filing URL directly.

## Company / Ticker Lookup

To go from a ticker or name to a CIK, use the SEC's [company_tickers.json](https://www.sec.gov/files/company_tickers.json) map — see the Finding a Company page.

## Browsing a Filer's Index

A filer's `submissions` JSON already lists their recent filings (`filings.recent`). For the complete history (older filings spill into separate files referenced under `filings.files`), or to browse by form, the classic endpoint is:

```
https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000320193&type=10-K&output=atom
```

## Which Mode?

- **Know the company, want its filings** → `submissions` (the Submissions model).
- **Know the company, want the numbers** → the XBRL models (Facts / Concept / Frames).
- **Don't know the company, have a phrase or topic** → Full-Text Search.
- **Have a ticker, need the CIK** → `company_tickers.json`.
- **Want the raw filing documents in bulk** → ScrapeSEC.jl (see Downloading Filings).
