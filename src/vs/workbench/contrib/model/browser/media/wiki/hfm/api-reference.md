# API Reference

The Hub exposes a public REST API at `https://huggingface.co/api/`. Most endpoints work without authentication; a token raises rate limits and unlocks gated/private content. See the **Authentication** wiki for token setup.

## Base URL and Authentication

```julia
using HTTP, JSON3

const HF_API = "https://huggingface.co/api"

# Include this header for authenticated requests
auth_headers(token=get(ENV, "HF_TOKEN", "")) =
    isempty(token) ? [] : ["Authorization" => "Bearer $token"]
```

---

## Models

### List and Search Models

```
GET /api/models
```

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Keyword filter on model ID and card text |
| `author` | string | Filter by organisation or user (e.g. `google`) |
| `filter` | string | Tag filter — repeat for AND logic (e.g. `onnx`, `pytorch`) |
| `pipeline_tag` | string | Task tag (e.g. `text-generation`, `image-classification`) |
| `sort` | string | `downloads`, `likes`, `trendingScore`, `createdAt`, `lastModified` |
| `direction` | int | `-1` = descending (default), `1` = ascending |
| `limit` | int | Results per page (max 100) |
| `full` | bool | Include `siblings`, `cardData`, `transformersInfo` in response |

```julia
function hf_list_models(; search="", pipeline_tag="", author="",
                          filter=[], sort="downloads", limit=20)
    params = ["sort=$sort", "limit=$limit", "full=true"]
    isempty(search)        || push!(params, "search=$(HTTP.escapeuri(search))")
    isempty(pipeline_tag)  || push!(params, "pipeline_tag=$pipeline_tag")
    isempty(author)        || push!(params, "author=$author")
    for f in filter        push!(params, "filter=$f") end
    url  = "$HF_API/models?" * join(params, "&")
    resp = HTTP.get(url, auth_headers())
    JSON3.read(resp.body)
end

# Examples
models = hf_list_models(pipeline_tag="text-generation", sort="likes", limit=10)
models = hf_list_models(search="whisper", filter=["onnx"])
models = hf_list_models(author="google", sort="downloads")
```

### Key Response Fields

| Field | Description |
|---|---|
| `id` | Full model ID, e.g. `meta-llama/Llama-3.2-3B-Instruct` |
| `pipeline_tag` | Primary task tag |
| `downloads` | 30-day download count |
| `likes` | Hub likes |
| `lastModified` | ISO 8601 timestamp of last push |
| `createdAt` | ISO 8601 creation timestamp |
| `tags` | All tags including framework, language, licence |
| `library_name` | Primary framework (`transformers`, `sentence-transformers`, …) |
| `siblings` | List of files in the repo (`rfilename`, `size`) |

### Get a Single Model's Metadata

```
GET /api/models/{owner}/{model}
```

```julia
function hf_model_info(model_id::String)
    resp = HTTP.get("$HF_API/models/$model_id", auth_headers())
    JSON3.read(resp.body)
end

meta = hf_model_info("openai/whisper-large-v3")
println("Task:      ", meta.pipeline_tag)
println("Downloads: ", meta.downloads)
println("Tags:      ", join(meta.tags, ", "))

# List all files in the repo
for f in meta.siblings
    println(rpad(f.rfilename, 50), "  ", get(f, :size, "?"), " B")
end
```

### List Files at a Specific Revision

```
GET /api/models/{owner}/{model}/revision/{branch_or_sha}
```

```julia
resp = HTTP.get("$HF_API/models/google/gemma-2-2b/revision/main", auth_headers())
meta = JSON3.read(resp.body)
safetensors = filter(f -> endswith(f.rfilename, ".safetensors"), meta.siblings)
```

---

## File Downloads

### Download a Single File

```
GET /{owner}/{model}/resolve/{revision}/{filename}
```

```julia
function hf_download(model_id::String, filename::String, dest::String;
                     revision="main")
    url  = "https://huggingface.co/$model_id/resolve/$revision/$filename"
    resp = HTTP.get(url, auth_headers(); redirect=true)
    write(dest, resp.body)
    println("Saved $(filesize(dest) ÷ 1024) KB → $dest")
end

hf_download("openai/whisper-base", "config.json", "whisper_config.json")
hf_download("sentence-transformers/all-MiniLM-L6-v2", "onnx/model.onnx", "minilm.onnx")
```

For large files (multi-GB weights), prefer `HuggingFaceHub.jl` which handles resumable downloads and chunk-based streaming automatically.

---

## Inference API (Serverless)

The Hub provides free, serverless inference for many models via:

```
POST https://api-inference.huggingface.co/models/{owner}/{model}
```

No local weights download required — the model runs on HF infrastructure.

```julia
function hf_infer(model_id::String, inputs; token=ENV["HF_TOKEN"])
    url  = "https://api-inference.huggingface.co/models/$model_id"
    body = JSON3.write(Dict("inputs" => inputs))
    resp = HTTP.post(url, ["Authorization" => "Bearer $token",
                           "Content-Type"  => "application/json"], body)
    JSON3.read(resp.body)
end

# Text generation
result = hf_infer("gpt2", "The capital of France is")
println(result[1].generated_text)

# Sentiment classification
result = hf_infer("distilbert/distilbert-base-uncased-finetuned-sst-2-english",
                  "This is a great product!")
println(result[1].label, "  score=", round(result[1].score, digits=3))

# Feature extraction (embeddings)
result = hf_infer("sentence-transformers/all-MiniLM-L6-v2", "Hello world")
embedding = Float32.(result[1][1])   # shape: (384,)
```

The Inference API returns a 503 if the model is loading — retry after a few seconds. Large models may not be available on the free tier.

---

## Datasets

### List Datasets

```
GET /api/datasets
```

Same query parameters as `/api/models` (`search`, `author`, `filter`, `sort`, `limit`).

```julia
resp = HTTP.get("$HF_API/datasets?search=imagenet&sort=downloads&limit=5",
                auth_headers())
datasets = JSON3.read(resp.body)
for d in datasets
    println(rpad(d.id, 45), "  ↓ ", get(d, :downloads, 0))
end
```

### Get Dataset Metadata

```julia
resp = HTTP.get("$HF_API/datasets/ylecun/mnist", auth_headers())
meta = JSON3.read(resp.body)
println("Files: ", length(meta.siblings))
```

---

## Spaces

### List Spaces

```
GET /api/spaces
```

```julia
resp = HTTP.get("$HF_API/spaces?search=stable-diffusion&sort=likes&limit=5",
                auth_headers())
spaces = JSON3.read(resp.body)
for s in spaces
    println(rpad(s.id, 50), "  ♥ ", get(s, :likes, 0))
end
```

---

## Rate Limits

| Request type | Unauthenticated | Authenticated |
|---|---|---|
| Metadata (list / info) | ~300 / hour | ~1 000 / hour |
| File downloads | ~100 GB / month | ~1 TB / month |
| Inference API | 30 000 tokens / month | higher with PRO |

Pass a token in the `Authorization` header to authenticate — see the **Authentication** wiki.

---

## Error Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 401 | Missing or invalid token (gated model, private repo) |
| 403 | Token valid but licence not accepted on the Hub |
| 404 | Model, dataset, or file does not exist |
| 429 | Rate limit exceeded — back off and retry |
| 503 | Inference API model is loading — retry in 20 s |

## See Also
- [Download & Load](download-load.md) · [Run Inference](run-inference.md) · [Access Tokens](access-tokens.md)
