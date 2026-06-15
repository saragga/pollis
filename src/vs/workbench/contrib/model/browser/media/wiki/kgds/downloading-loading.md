# Downloading & Loading

Downloading needs a Kaggle token (see *Authentication*). The recipe is: **list files → download the zip → unpack → read the CSV**.

```julia
using HTTP, JSON3, Base64
auth = ["Authorization" => "Basic " * base64encode(ENV["KAGGLE_USERNAME"] * ":" * ENV["KAGGLE_KEY"])]
```

## List a dataset's files

```julia
ref = "uciml/iris"   # ownerSlug/datasetSlug
res = JSON3.read(HTTP.get("https://www.kaggle.com/api/v1/datasets/list-files/$ref", auth).body)
for f in res.datasetFiles
    println(f.name, "  ", f.totalBytes, " bytes")
end
```

## Download the archive

The download endpoint returns a `.zip` of the dataset's files.

```julia
using ZipFile
r = HTTP.get("https://www.kaggle.com/api/v1/datasets/download/$ref", auth)
write("dataset.zip", r.body)

z = ZipFile.Reader("dataset.zip")
for f in z.files
    println(f.name, "  ", f.uncompressedsize, " bytes")
end
close(z)
```

## Read a CSV (no DataFrames)

`CSV.File` is a `Tables.jl` source, so it composes with the whole Julia data ecosystem without DataFrames.jl.

```julia
using CSV, Tables
z = ZipFile.Reader("dataset.zip")
entry = first(filter(f -> endswith(f.name, ".csv"), z.files))

rows = CSV.File(read(entry))
println("columns: ", Tables.columnnames(rows))
println("rows:    ", length(rows))
rows_nt = [NamedTuple(r) for r in rows]   # materialise rows when you need them
close(z)
```

## Or use the Kaggle CLI

The official `kaggle` CLI reads the same `KAGGLE_*` environment variables:

```julia
run(`kaggle datasets download -d uciml/iris -p . --unzip`)
```

## See Also

- Authentication — getting the token in place
- Browsing the Catalogue — finding a dataset ref first
