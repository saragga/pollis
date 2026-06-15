# Browsing the Catalogue

The catalogue is a public REST endpoint. Every request is a plain HTTPS GET that returns JSON, parsed here with `JSON3.jl` — no credentials needed.

```julia
using HTTP, JSON3
get_json(url) = JSON3.read(HTTP.get(url).body)
```

## List and sort

```julia
res = get_json("https://www.kaggle.com/api/v1/datasets/list?sortBy=votes&pageSize=10")
for d in res
    println(d.ref, "  votes=", d.voteCount, "  downloads=", d.downloadCount)
end
```

- `sortBy` — `hottest`, `votes`, `updated`, or `published`.
- `pageSize` / `page` — paging.
- `search` — free-text query (matches title, subtitle, and tags).

## Filter

| Parameter | Values |
|---|---|
| `fileType` | `csv`, `json`, `sqlite`, `bigQuery` |
| `license` | `cc`, `gpl`, `odb`, `other` |
| `maxSize` / `minSize` | bytes |

```julia
# CSV datasets under a permissive licence, most-voted first
url = "https://www.kaggle.com/api/v1/datasets/list?fileType=csv&license=cc&sortBy=votes&pageSize=10"
for d in get_json(url)
    println(d.ref, "  ", d.licenseName)
end
```

The **Explore** pane builds these queries for you: pick chips under **Task** and **Domain** and it runs the matching `search` queries — OR-ed within a category (separate requests, merged) and AND-ed across categories (terms joined into one search). The `fileType` and `license` parameters above remain available directly in code.

## Useful fields on each dataset

`ref`, `title`, `subtitle`, `ownerName`, `licenseName`, `totalBytes`, `voteCount`, `downloadCount`, `usabilityRating`, `lastUpdated`, `tags`.

## See Also

- Choosing a Dataset — turning a search into a decision
- Downloading & Loading — fetching the files you found
