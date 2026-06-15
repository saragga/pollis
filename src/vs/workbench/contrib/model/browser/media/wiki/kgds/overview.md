# Overview

**Kaggle** is a data-science community whose *Datasets* section hosts hundreds of thousands of public datasets across every domain — finance, health, images, text, sport, and more. Most are **tabular** (CSV or SQLite), which makes them a natural fit for Julia's `CSV.jl` + `Tables.jl` stack.

## How datasets are organised

- **Ref** — the unique identifier `ownerSlug/datasetSlug` (e.g. `uciml/iris`). The owner is a user or organisation; the slug names the dataset.
- **Versions** — datasets are versioned; you can pin a specific `datasetVersionNumber` when downloading.
- **Files** — a dataset is a set of files (often a single CSV, sometimes many). The download endpoint returns them as a `.zip`.
- **Metadata** — every dataset carries a title, subtitle, licence, file types, size, vote count, download count, and a **usability rating** that scores documentation and completeness.

## The two access paths

1. **The public catalogue (no credentials).** `datasets/list` returns JSON and supports `search`, `sortBy`, `fileType`, and `license` filters. This is all you need to browse, rank, and read metadata — `HTTP.jl` + `JSON3.jl`, no token.
2. **Authenticated download.** Listing a dataset's files and downloading it require a free Kaggle API token (username + key). The download is a `.zip`; unpack it with `ZipFile.jl` and read the CSVs with `CSV.jl`.

## Kaggle vs Hugging Face datasets

Both host community datasets, but the centre of gravity differs: Kaggle leans **tabular and competition-oriented**, with rich human-written documentation; Hugging Face leans **ML-training-oriented** (text, audio, image), auto-converted to Parquet. Pollis ships a webview for each.

## See Also

- Browsing the Catalogue — search, sort, and filter
- Downloading & Loading — get the files into Julia
- Choosing a Dataset — usability, size, licence
