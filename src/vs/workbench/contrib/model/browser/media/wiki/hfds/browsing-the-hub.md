# Browsing the Hub

The catalogue is a public REST API. Every request is a plain HTTPS GET that returns JSON, parsed here with `JSON3.jl`.

```julia
using HTTP, JSON3

auth = haskey(ENV, "HUGGING_FACE_HUB_TOKEN") ? ["Authorization" => "Bearer $(ENV["HUGGING_FACE_HUB_TOKEN"])"] : Pair{String, String}[]
get_json(url) = JSON3.read(HTTP.get(url, auth).body)
```

## List and sort

```julia
url = "https://huggingface.co/api/datasets?sort=downloads&direction=-1&limit=10&full=true"
for d in get_json(url)
    println(d.id, "  downloads=", get(d, :downloads, 0))
end
```

- `sort` — `downloads`, `likes`, `trending`, `lastModified`, `createdAt`.
- `direction` — `-1` for descending, `1` for ascending.
- `limit` — page size.
- `full=true` — include full metadata (tags, licence, ...) on each item.

## Search

```julia
q = HTTP.escapeuri("sentiment")
get_json("https://huggingface.co/api/datasets?search=$q&limit=10")
```

## Filter by tag

Tags follow the form `<group>:<value>`. Useful groups:

| Group | Example value |
|---|---|
| `task_categories` | `text-classification`, `question-answering` |
| `language` | `en`, `fr` |
| `size_categories` | `1K<n<10K`, `100K<n<1M` |
| `license` | `mit`, `apache-2.0` |

```julia
url = "https://huggingface.co/api/datasets?filter=task_categories:text-classification&sort=downloads&direction=-1&limit=10"
get_json(url)
```

Combine multiple `filter=` parameters to AND them together.

## See Also
- [Loading Datasets](loading-datasets.md) — `load_dataset` and `with_format("julia")`
- [Choosing a Dataset](choosing-a-dataset.md) — turning a search into a decision
