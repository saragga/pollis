# Hugging Face Datasets — Factsheet

The **Hugging Face Hub** hosts hundreds of thousands of machine-learning datasets. It exposes a public **REST API** at `huggingface.co/api` that returns JSON — no token for public datasets — and auto-converts every dataset to **Parquet** for direct download. Datasets can also be loaded straight into Julia with **HuggingFaceDatasets.jl**.

| | |
|---|---|
| **Purpose** | Find, load, and download ML datasets from the Hugging Face Hub into Julia |
| **Auth** | None for public datasets; a token is required for gated/private (set it once via *Set token*) |
| **API host** | `https://huggingface.co/api/` |
| **Files** | Parquet shards at `https://huggingface.co/api/datasets/<id>/parquet/<config>/<split>/<n>.parquet` |
| **Julia stack** | `HTTP.jl` + `JSON3.jl` (browse / files / info); `HuggingFaceDatasets.jl` (load); `Parquet2.jl` + `Tables.jl` (files) |
| **Identifier** | Dataset id, e.g. `imdb`, `glue`, `stanfordnlp/imdb` |

## Endpoints

| Endpoint | Returns |
|---|---|
| `/api/datasets?sort=downloads&direction=-1&limit=10&full=true` | The catalogue, ranked, with full metadata |
| `/api/datasets?search=<q>` | Datasets matching a free-text query |
| `/api/datasets/<id>` | Full metadata for one dataset (tags, licence, downloads) |
| `/api/datasets/<id>/parquet` | The Parquet shard listing (config → split → URLs) |

## Two access paths

- **Pure Julia (no Python):** browse, list files, and read metadata over the REST API with `HTTP.jl` + `JSON3.jl`; read Parquet shards with `Parquet2.jl`.
- **HuggingFaceDatasets.jl:** `load_dataset("imdb", split = "train")` wraps the Python `datasets` library through PythonCall; `.with_format("julia")` returns native Julia objects.

## See Also

- Overview — what the Hub is and how datasets are organised
- Authentication — tokens, gated datasets, and Secret Storage
- Loading Datasets — `load_dataset`, splits, and indexing
