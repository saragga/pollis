# HuggingFaceDatasets.jl

[HuggingFaceDatasets.jl](https://github.com/CarloLucibello/HuggingFaceDatasets.jl) provides Julia wrappers around the Python [`datasets`](https://github.com/huggingface/datasets) library. It uses **PythonCall** and **CondaPkg**, so the first use provisions a Conda environment automatically — no manual Python setup.

## Install

```julia
import Pkg; Pkg.add("HuggingFaceDatasets")
```

## `load_dataset`

```julia
load_dataset(dataset_name::String; split::String)
```

- With `split` — returns a single `Dataset`.
- Without `split` — returns a `DatasetDict` keyed by split name.

```julia
using HuggingFaceDatasets
train = load_dataset("mnist", split = "train")
```

## `with_format`

Converts returned observations to native Julia objects rather than Python objects:

```julia
train = load_dataset("mnist", split = "train").with_format("julia")
```

## Indexing and length

```julia
train[1]        # one observation
train[1:2]      # a range of observations
length(train)   # number of observations
```

## Authentication

The wrapped Python stack reads the standard `HUGGING_FACE_HUB_TOKEN` environment variable, so gated and private datasets work once a token is set (see *Authentication*).

## Troubleshooting

If CondaPkg has trouble resolving OpenSSL, set this before loading:

```julia
ENV["JULIA_CONDAPKG_OPENSSL_VERSION"] = true
```

## See Also
- [Loading Datasets](loading-datasets.md) — splits, formats, and indexing in context
- [Dataset Files](dataset-files.md) — the pure-Julia Parquet alternative
