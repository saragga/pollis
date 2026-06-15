# Overview

The **Hugging Face Hub** is a public repository of machine-learning datasets, models, and demos. The *Datasets* section alone holds hundreds of thousands of datasets spanning text, images, audio, tabular data, and more. Each dataset has a **dataset card** (a README with documentation and metadata), one or more **configurations**, and **splits** such as `train`, `validation`, and `test`.

## How datasets are organised

- **Dataset id** — the unique name, e.g. `imdb` or `stanfordnlp/imdb` (namespaced by the owning user or organisation).
- **Configuration (config)** — a named variant of a dataset (for example a language subset). Many datasets have a single default config.
- **Split** — a partition of a config: `train`, `validation`, `test`, and sometimes custom splits.
- **Features** — the typed columns of each observation (e.g. `text`, `label`, `image`).

## The two access paths

This webview exposes two complementary ways to work with a dataset:

1. **The REST API (pure Julia).** Browsing the catalogue, listing the underlying files, and reading metadata are plain HTTPS GET requests that return JSON. They need only `HTTP.jl` and `JSON3.jl`, and no token for public datasets.
2. **HuggingFaceDatasets.jl.** To pull a split directly into Julia as an indexable collection, `load_dataset` wraps the mature Python `datasets` library through PythonCall. The first call provisions a one-time Conda environment via CondaPkg.

## Parquet everywhere

Hugging Face automatically converts every dataset to **Parquet** and serves the shards over the API. This means you can stream or download the raw data without the Python stack at all — list the shards, fetch one, and read it through the `Tables.jl` interface with `Parquet2.jl`.

## See Also

- Browsing the Hub — search, sort, and filter the catalogue
- Loading Datasets — `load_dataset` and `with_format("julia")`
- Dataset Files — the Parquet shards and how to read them
