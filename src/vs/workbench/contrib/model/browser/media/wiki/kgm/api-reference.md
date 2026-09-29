# API Reference

The Kaggle REST API is available at `https://www.kaggle.com/api/v1/`. Public model metadata can be browsed without authentication; downloading files and accessing private models requires an API key. See the **Authentication** wiki for key setup.

## Base URL and Authentication

Kaggle uses HTTP Basic Auth — encode `username:key` in Base64:

```julia
using HTTP, JSON3, Base64

const KGM_API = "https://www.kaggle.com/api/v1"

function kaggle_headers()
    user = get(ENV, "KAGGLE_USERNAME", "")
    key  = get(ENV, "KAGGLE_KEY", "")
    if isempty(user) || isempty(key)
        # Fallback: read from ~/.kaggle/kaggle.json
        creds = JSON3.read(read(joinpath(homedir(), ".kaggle", "kaggle.json"), String))
        user, key = creds.username, creds.key
    end
    ["Authorization" => "Basic " * base64encode("$user:$key")]
end
```

---

## Models

### List and Search Models

```
GET /api/v1/models/list
```

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Keyword filter on model ID and description |
| `sortBy` | string | `hotness` (default), `voteCount`, `createTime`, `updateTime` |
| `pageSize` | int | Results per page (max 100) |
| `pageToken` | string | Cursor for the next page (from previous response) |

```julia
function kaggle_list_models(; search="", sort="hotness", page_size=20)
    params = ["sortBy=$sort", "pageSize=$page_size"]
    isempty(search) || push!(params, "search=$(HTTP.escapeuri(search))")
    url  = "$KGM_API/models/list?" * join(params, "&")
    resp = HTTP.get(url, kaggle_headers())
    JSON3.read(resp.body)
end

result = kaggle_list_models(search="resnet", sort="voteCount")
for m in result.models
    println(rpad(m.ref, 45), "  ★ ", m.voteCount)
end
```

### Key Response Fields

| Field | Description |
|---|---|
| `ref` | Full model reference, e.g. `google/gemma/transformers/2b-it` |
| `title` | Display name |
| `author` | Owner display name |
| `voteCount` | Total upvotes |
| `updateTime` | ISO 8601 timestamp of last update |
| `url` | Canonical URL on kaggle.com |
| `instances` | Array of framework variants (see below) |

### Model Instances

Each model has one or more **instances** — one per framework variant (e.g. a model may have both a `transformers` and a `gguf` instance):

| Instance field | Description |
|---|---|
| `framework` | Framework ID: `transformers`, `pyTorch`, `tensorFlow2`, `keras`, `gguf`, `onnx`, `scikitLearn`, `jax`, `flax`, … |
| `slug` | Variant identifier within the model |
| `versionNumber` | Current version integer |
| `downloadUrl` | Relative path for downloading this instance |
| `fineTunable` | Whether fine-tuning is supported |

```julia
result = kaggle_list_models(search="gemma")
for m in result.models
    for inst in m.instances
        println(m.ref, "/", inst.framework, "/", inst.slug, "  v", inst.versionNumber)
    end
end
```

### Get a Single Model's Metadata

```
GET /api/v1/models/{owner}/{model}/get
```

```julia
function kaggle_model_info(owner::String, model::String)
    resp = HTTP.get("$KGM_API/models/$owner/$model/get", kaggle_headers())
    JSON3.read(resp.body)
end

meta = kaggle_model_info("google", "gemma")
println("Title:    ", meta.title)
println("Votes:    ", meta.voteCount)
println("Variants: ", length(meta.instances))
```

### Get a Specific Instance

```
GET /api/v1/models/{owner}/{model}/{framework}/{variant}
```

```julia
resp = HTTP.get("$KGM_API/models/keras/gemma3/keras/gemma3_2b_en",
                kaggle_headers())
inst = JSON3.read(resp.body)
println("Version:   ", inst.currentDownloadVersionNumber)
println("Framework: ", inst.framework)
```

---

## File Downloads

### Download a Model Instance

```
GET /api/v1/models/{owner}/{model}/{framework}/{variant}/{version}/download
```

The response is a redirect to a signed download URL. Pass `redirect=true` to follow it:

```julia
function kaggle_download(owner, model, framework, variant, version, dest)
    url  = "$KGM_API/models/$owner/$model/$framework/$variant/$version/download"
    resp = HTTP.get(url, kaggle_headers(); redirect=true)
    write(dest, resp.body)
    println("Saved $(filesize(dest) ÷ 1024) KB → $dest")
end

# Download Keras Gemma 3 2B weights
kaggle_download("keras", "gemma3", "keras", "gemma3_2b_en", 2, "gemma3_2b.zip")

# Download a specific ONNX model
kaggle_download("keras", "resnet", "keras", "resnet50", 2, "resnet50.onnx")
```

For large downloads, stream the response to avoid loading the whole file into memory:

```julia
function kaggle_download_stream(owner, model, framework, variant, version, dest)
    url  = "$KGM_API/models/$owner/$model/$framework/$variant/$version/download"
    auth = ["Authorization" => "Basic " * base64encode(
                "$(ENV["KAGGLE_USERNAME"]):$(ENV["KAGGLE_KEY"])")]
    open(dest, "w") do io
        HTTP.open("GET", url, auth; redirect=true) do stream
            write(io, stream)
        end
    end
    println("Saved $(filesize(dest) ÷ 1_000_000) MB → $dest")
end
```

---

## Pagination

The model list API returns a `nextPageToken` when more results are available:

```julia
function kaggle_list_all(; search="", sort="hotness", max_pages=5)
    models = []
    token  = nothing
    for _ in 1:max_pages
        params = ["sortBy=$sort", "pageSize=100"]
        isempty(search) || push!(params, "search=$(HTTP.escapeuri(search))")
        isnothing(token) || push!(params, "pageToken=$token")
        url    = "$KGM_API/models/list?" * join(params, "&")
        resp   = HTTP.get(url, kaggle_headers())
        result = JSON3.read(resp.body)
        append!(models, result.models)
        token  = get(result, :nextPageToken, nothing)
        isnothing(token) && break
    end
    models
end
```

---

## Rate Limits and Quotas

| Property | Value |
|---|---|
| Unauthenticated metadata | ~300 requests / hour |
| Authenticated metadata | ~1 000 requests / hour |
| Model downloads | ~200 requests / hour |
| Max page size | 100 models |
| Authentication | HTTP Basic Auth (username + API key) |

---

## Error Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 400 | Invalid query parameter (e.g. unknown `sortBy` value) |
| 401 | Missing or invalid API key |
| 403 | Access denied (private model or key mismatch) |
| 404 | Model, instance, or version does not exist |
| 429 | Rate limit exceeded — back off and retry |

## See Also
- [Download & Load](download-load.md) · [Run Inference](run-inference.md) · [Kaggle API Key](api-key.md)
