# Accessing Data

The core recipe: fetch JSON from `data.sec.gov` with the **mandatory `User-Agent` header**, no API key, respecting the rate limit.

## The Package

```julia
import Pkg; Pkg.add(url = "https://github.com/Trumpingtons/EDGAR.jl")
using EDGAR
```

- **EDGAR.jl** — wraps `HTTP.jl` + `JSON3.jl`, sends the mandatory `User-Agent`, caches responses, and returns the parsed JSON as a lazy, dot-accessible object. One function per endpoint: `fetch_submissions`, `company_facts`, `company_concept`, `xbrl_frames`, `full_text_search`, `cik_for_ticker`.

## The User-Agent Is Required

The SEC's [fair-access policy](https://www.sec.gov/os/webmaster-faq#developers) requires every request to identify you with a `User-Agent` header containing your name and a contact email. **Without it you get HTTP 403.** No key, no registration — just be honest about who you are.

### Set It Once

Click **Set contact** on the "Powered by:" line at the top of the webview and enter your name and email. It is stored in VS Code and, when you **Send to Julia REPL**, injected into the session as `ENV["SEC_USER_AGENT"]` — so it never has to be written into a snippet or a saved file. A green **👤 contact** indicator confirms it is set; use **change** or **clear** to manage it.

`EDGAR.jl` reads that env var automatically, so the snippets need no setup. To set the contact explicitly instead, call `set_user_agent`:

```julia
using EDGAR
set_user_agent("Your Name your.email@example.com")   # or rely on the injected ENV["SEC_USER_AGENT"]
```

**Send to Notebook** and **Send to Editor** carry the contact along by prepending a line that sets `ENV["SEC_USER_AGENT"]` (a setup cell for the notebook, a leading line for the file), because those run in their own process rather than the injected REPL. Only the non-secret contact is written this way, never a masked API key. To have it everywhere without this, set `ENV["SEC_USER_AGENT"]` in `~/.julia/config/startup.jl`.

## Fetch and Read

```julia
sub = fetch_submissions("0000320193")   # CIK zero-padded to 10 digits (Apple Inc.)

sub.name                 # "Apple Inc."
sub.tickers              # ["AAPL"]
sub.filings.recent.form  # a vector of form types
```

The returned object exposes fields as properties. When a key is not a valid Julia identifier (for example `us-gaap`), index it with a `Symbol`:

```julia
facts = company_facts("320193")
gaap  = facts.facts[Symbol("us-gaap")]
```

## Respect the Rate Limit

The SEC allows **at most 10 requests per second**. When looping over many companies or concepts, throttle:

```julia
for cik in ciks
    process(fetch_submissions(cik))
    sleep(0.15)          # stay comfortably under 10 req/s
end
```

(EDGAR.jl also caches responses, so re-fetching the same URL within a session does not hit the SEC again.)

## Tidy Into a Table

Stop at plain Julia and pick your container. Build a `Vector` of `NamedTuple`s (a Tables.jl source) and pipe it onward:

```julia
rows = [(; end_date = o.end, form = o.form, val = o.val) for o in concept.units.USD]
# using Tables;     Tables.columntable(rows)
# using TimeSeries;  TimeArray(...)
```

> Hard-coding the `User-Agent` in a saved file is fine — it is not a secret. It simply tells the SEC who is calling.

## See Also
- [XBRL Financial Data](xbrl-financial-data.md) · [Finding a Company](finding-a-company.md) · [Downloading Filings](downloading-filings.md)
