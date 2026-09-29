# US SEC EDGAR — Factsheet

**EDGAR** (Electronic Data Gathering, Analysis, and Retrieval) is the U.S. Securities and Exchange Commission's filing system. The SEC exposes it through open **REST APIs** at `data.sec.gov` that return JSON — no API key. The only requirement is a **`User-Agent` header** declaring your app and a contact email; without it the SEC returns HTTP 403.

| | |
|---|---|
| **Purpose** | Pull company filings and XBRL financial data from SEC EDGAR into Julia |
| **Auth** | None — but a `User-Agent` header is mandatory (set it once via *Set contact*) |
| **API host** | `https://data.sec.gov/` (full-text search: `https://efts.sec.gov/`) |
| **Rate limit** | At most 10 requests per second |
| **Julia stack** | `EDGAR.jl` (raw documents: `ScrapeSEC.jl`) |
| **Identifier** | CIK — Central Index Key, zero-padded to 10 digits |

## Endpoints

| Endpoint | Returns |
|---|---|
| `/submissions/CIK##########.json` | A filer's filing history (forms, dates, documents) |
| `/api/xbrl/companyfacts/CIK##########.json` | Every XBRL fact a company has reported |
| `/api/xbrl/companyconcept/CIK##########/us-gaap/<Tag>.json` | One concept over time |
| `/api/xbrl/frames/us-gaap/<Tag>/<Unit>/CY####Q#I.json` | One concept across all filers for a period |
| `efts.sec.gov/LATEST/search-index?q=...` | Full-text search of filing contents (2001+) |

## Minimal Example

```julia
using EDGAR

# Set your contact once via the "Set contact" link on the Powered-by line; it is
# injected into the Julia REPL as ENV["SEC_USER_AGENT"], which EDGAR.jl reads
# automatically. Or set it explicitly: set_user_agent("Your Name you@example.com").

sub = fetch_submissions("0000320193")            # Apple Inc.
println(sub.name)
```

> The JSON APIs give you metadata and XBRL facts. To download the **raw filing documents** (full 10-K/10-Q text and HTML) in bulk, use **ScrapeSEC.jl** — see the Downloading Filings page.

## See Also
- [Overview](overview.md) · [Accessing Data](accessing-data.md) · [XBRL Financial Data](xbrl-financial-data.md)
