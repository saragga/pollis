# Loading Datasets

**HuggingFaceDatasets.jl** loads a dataset straight into Julia. It wraps the Python `datasets` library through PythonCall; the first call provisions a one-time Conda environment via CondaPkg.

```julia
using HuggingFaceDatasets

train = load_dataset("imdb", split = "train")
```

## Splits

- Pass `split` to load one partition: `"train"`, `"test"`, `"validation"`, ...
- Omit `split` to load a **`DatasetDict`** keyed by split name:

```julia
dd = load_dataset("imdb")
train = dd["train"]
```

## Native Julia objects with `with_format`

By default observations come back as Python objects. Append `.with_format("julia")` to get native Julia objects instead:

```julia
train = load_dataset("imdb", split = "train").with_format("julia")
```

## Indexing

A `Dataset` behaves like a Julia collection:

```julia
length(train)        # number of observations
train[1]             # one observation (a Dict of fields)
train[1:4]           # a batch of observations
keys(train[1])       # the field names, e.g. "text", "label"
```

Index-based iteration keeps memory low on large splits:

```julia
for i in 1:3
    println(train[i]["label"])
end
```

## Authentication

For gated or private datasets, set a token via **Set token** (see *Authentication*). The Python stack reads `HUGGING_FACE_HUB_TOKEN` from the environment automatically.

## Troubleshooting

If CondaPkg fails to resolve its OpenSSL dependency, set this before loading:

```julia
ENV["JULIA_CONDAPKG_OPENSSL_VERSION"] = true
```

## See Also
- [Dataset Files](dataset-files.md) — read the Parquet shards without Python
- [HuggingFaceDatasets.jl](huggingfacedatasets-jl.md) — full package reference
