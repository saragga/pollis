# Dataset Files

Hugging Face automatically converts every dataset to **Parquet** and serves the shards over the API. This lets you stream or download the raw data with no Python stack at all.

## List the shards

```julia
using HTTP, JSON3

auth = haskey(ENV, "HUGGING_FACE_HUB_TOKEN") ? ["Authorization" => "Bearer $(ENV["HUGGING_FACE_HUB_TOKEN"])"] : Pair{String, String}[]
listing = JSON3.read(HTTP.get("https://huggingface.co/api/datasets/imdb/parquet", auth).body)
```

The response is nested: **config → split → array of shard URLs**. Each URL has the form:

```
https://huggingface.co/api/datasets/<id>/parquet/<config>/<split>/<n>.parquet
```

## Download and read one shard

`Parquet2.jl` reads a Parquet file lazily and exposes it through the `Tables.jl` interface, so you never need DataFrames.jl.

```julia
using HTTP, Parquet2, Tables

shard = "https://huggingface.co/api/datasets/imdb/parquet/plain_text/train/0.parquet"
path = download(shard)
ds = Parquet2.Dataset(path)

println(Tables.schema(ds))                 # column names and types, without loading all rows
rows = [NamedTuple(r) for r in Tables.rows(ds)]   # materialise rows when you need them
```

## When to use files vs `load_dataset`

- **Files** — large or out-of-core workflows, streaming, or when you want to avoid the Python dependency entirely.
- **`load_dataset`** — interactive exploration and quick access to observations as Julia objects.

## See Also

- Loading Datasets — the HuggingFaceDatasets.jl path
- Browsing the Hub — finding a dataset id first
