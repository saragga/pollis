# Kaggle Datasets — Factsheet

**Kaggle** hosts hundreds of thousands of public datasets, mostly tabular (CSV/SQLite), each versioned, documented, and rated for usability. Kaggle exposes a **REST API** at `www.kaggle.com/api/v1`. The dataset catalogue (`datasets/list`) is **public** — browsing, searching, and filtering need no credentials. Listing a dataset's files and downloading it require a free **API token** (username + key).

| | |
|---|---|
| **Purpose** | Find, download, and load Kaggle datasets into Julia |
| **Auth** | None to browse; a free API token (username + key) for file listing and downloads |
| **API host** | `https://www.kaggle.com/api/v1/` |
| **Identifier** | `ownerSlug/datasetSlug` (the dataset `ref`, e.g. `uciml/iris`) |
| **Julia stack** | `HTTP.jl` + `JSON3.jl` (API); `ZipFile.jl` (unpack); `CSV.jl` + `Tables.jl` (read) |

## Endpoints

| Endpoint | Returns | Auth |
|---|---|---|
| `/datasets/list?search=&sortBy=&fileType=&license=` | The catalogue, searchable and filterable | none |
| `/datasets/list-files/<ref>` | The files inside a dataset | token |
| `/datasets/download/<ref>` | The dataset as a `.zip` | token |

## Two access paths

- **Public REST (no credentials):** browse, search, and filter the catalogue with `HTTP.jl` + `JSON3.jl`.
- **Authenticated download:** with a Kaggle token in `KAGGLE_USERNAME` / `KAGGLE_KEY`, download the `.zip`, unpack it with `ZipFile.jl`, and read the CSVs with `CSV.jl` + `Tables.jl` (no DataFrames.jl).

## See Also

- Overview — what Kaggle Datasets are and how they are organised
- Authentication — creating and using a Kaggle API token
- Downloading & Loading — the download → unzip → read recipe
