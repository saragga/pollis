# US SEC EDGAR — Downloading Filings

The `data.sec.gov` JSON APIs give you **metadata and XBRL facts**. They do **not** give you the filing **documents** themselves — the full 10-K/10-Q/8-K text and HTML. For that, the right tool is [**ScrapeSEC.jl**](https://github.com/tylerjthomas9/ScrapeSEC.jl), a registered, maintained package that downloads filings in bulk from EDGAR's archive.

## When to Use It

- You need the **prose** of filings (risk factors, MD&A, notes), not just the tagged numbers.
- You want **many** filings at once (a whole year of 10-Ks), not one company at a time.
- You are building a text corpus for NLP over filings.

For single, targeted documents, you can also just build the archive URL yourself (see below).

## How It Works

ScrapeSEC.jl works off EDGAR's **quarterly index files**: download the indexes for a date range, consolidate them, then download the documents they list.

```julia
import Pkg; Pkg.add("ScrapeSEC")
using ScrapeSEC

# 1) download the metadata index files for a year range
download_metadata_files(2023, 2023)

# 2) consolidate the quarterly indexes into one
create_main_index()

# 3) download just the 10-K documents listed in that index
download_filings("./metadata/main_idx.tsv"; filing_types = ["10-K"])
```

You can also download directly by year and type, skipping the explicit index step:

```julia
download_filings(2023, 2024; filing_types = ["10-K", "10-Q", "8-K"])
```

## A Single Document with EDGAR.jl

For one targeted filing you do not need ScrapeSEC — `EDGAR.jl` can download the primary document directly from a CIK and accession number:

```julia
using EDGAR

cik = "0000320193"
recent = fetch_submissions(cik).filings.recent
download_filing(cik, recent.accessionNumber[1])   # saves the primary document under ./data/
```

Or build the deterministic archive URL yourself, no download:

```julia
cik = 320193
recent = fetch_submissions(lpad(cik, 10, '0')).filings.recent
acc = replace(recent.accessionNumber[1], "-" => "")
doc = recent.primaryDocument[1]
println("https://www.sec.gov/Archives/edgar/data/$cik/$acc/$doc")
```

## The Two Tools Together

| Goal | Tool |
|---|---|
| Filing list, dates, document names | `EDGAR.jl` → `fetch_submissions` |
| XBRL financial facts | `EDGAR.jl` → `company_facts` / `company_concept` / `xbrl_frames` |
| A single filing's document | `EDGAR.jl` → `download_filing` |
| Raw filing documents in bulk | `ScrapeSEC.jl` |

> ScrapeSEC.jl downloads from `www.sec.gov`, which is also subject to the SEC's fair-access policy — keep request volume reasonable.
