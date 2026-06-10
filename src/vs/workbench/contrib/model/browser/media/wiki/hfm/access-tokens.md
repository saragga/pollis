# Access Tokens

## Why You Need a Token

The Hugging Face Hub is mostly public, but a token is required to:

- Download **gated models** (Llama, Gemma, Phi-4, Mistral, …) after accepting their licence
- Access **private repositories** you own or are a member of
- Use the **Hub REST API** at full rate limits
- Push models, datasets, or Spaces to the Hub

Public, non-gated models (BERT, DistilBERT, Whisper, …) can be downloaded without a token.

## Create an Access Token

1. Sign in at **huggingface.co**
2. Click your profile picture → **Settings** → **Access Tokens**
3. Click **New token**
4. Choose a name, select the **Read** role, and click **Generate**

Copy the token — it starts with `hf_` and is only shown once.

### Token Roles

| Role | Can do |
|---|---|
| **Read** | Download models, datasets, Spaces; call the API |
| **Write** | Everything above + push to your repos |
| **Fine-grained** | Select individual repo permissions (recommended for CI/CD) |

Read scope is sufficient for all inference and download use cases.

## Install the Token

### Option 1 — Environment Variable (recommended)

Add to your shell profile (`~/.zshrc` or `~/.bashrc`) so every Julia session picks it up automatically:

```bash
export HF_TOKEN="hf_xxxxxxxxxxxxxxxxxxxx"
```

### Option 2 — Per-Session in Julia

Set at the top of a script or notebook. Do **not** hard-code in files you share or commit:

```julia
ENV["HF_TOKEN"] = "hf_xxxxxxxxxxxxxxxxxxxx"
```

### Option 3 — `huggingface-cli login` (Python toolchain)

If you have the Python `huggingface_hub` package installed, running `huggingface-cli login` saves the token to `~/.cache/huggingface/token`. `HuggingFaceHub.jl` reads this file automatically as a fallback when `HF_TOKEN` is not set.

## Use the Token with Transformers.jl

`Transformers.jl` reads `HF_TOKEN` automatically — no extra configuration needed:

```julia
using Transformers, Transformers.HuggingFace

# Works for gated models once you have accepted the licence on the Hub
tkr   = HuggingFace.load_tokenizer("meta-llama/Llama-3.2-3B-Instruct")
model = HuggingFace.load_model(HuggingFace.LlamaModel, "meta-llama/Llama-3.2-3B-Instruct")
```

## Accept a Gated Model Licence

Downloading a gated model requires two steps:

1. **On the Hub** — go to the model page (e.g. `huggingface.co/meta-llama/Llama-3.2-3B-Instruct`) and click **Agree and access repository**
2. **In Julia** — make sure `HF_TOKEN` is set to a token belonging to the account that accepted the licence

If you skip step 1, the download will return a 403 error even with a valid token.

## Use the Hub REST API

The Hub API uses Bearer token authentication. Pass the token in the `Authorization` header:

```julia
using HTTP, JSON3

token = ENV["HF_TOKEN"]

resp = HTTP.get(
    "https://huggingface.co/api/models?search=bert&limit=5&sort=downloads",
    ["Authorization" => "Bearer $token"],
)
models = JSON3.read(resp.body)
for m in models
    println(rpad(m.id, 55), "  ↓ ", m.downloads)
end
```

### Useful API Endpoints

| Endpoint | What it returns |
|---|---|
| `GET /api/models?search=…&limit=N&sort=downloads` | Search models by keyword |
| `GET /api/models?pipeline_tag=…&limit=N` | Filter by task |
| `GET /api/models?author=…&limit=N` | Filter by organisation |
| `GET /api/models/{owner}/{repo}` | Full model card metadata |
| `GET /api/models/{owner}/{repo}/revision/{branch}` | Files at a specific revision |
| `GET /{owner}/{repo}/resolve/{branch}/{filename}` | Download a single file |

### Fetch Model Metadata

```julia
resp = HTTP.get(
    "https://huggingface.co/api/models/bert-base-uncased",
    ["Authorization" => "Bearer $token"],
)
meta = JSON3.read(resp.body)

println("Model ID:      ", meta.id)
println("Pipeline tag:  ", meta.pipeline_tag)
println("Downloads:     ", meta.downloads)
println("Likes:         ", meta.likes)
println("Last modified: ", meta.lastModified)
```

### Download a Single File via the API

```julia
function hf_download(repo::String, filename::String, dest::String; revision="main")
    url  = "https://huggingface.co/$repo/resolve/$revision/$filename"
    resp = HTTP.get(url, ["Authorization" => "Bearer $(ENV["HF_TOKEN"])"])
    write(dest, resp.body)
    println("Saved $(filesize(dest) ÷ 1024) KB → $dest")
end

hf_download("bert-base-uncased", "config.json", "config.json")
```

### List Files in a Repository

```julia
resp = HTTP.get(
    "https://huggingface.co/api/models/openai/whisper-large-v3",
    ["Authorization" => "Bearer $token"],
)
meta = JSON3.read(resp.body)
for f in meta.siblings
    println(rpad(f.rfilename, 50), "  ", get(f, :size, "?"), " B")
end
```

## Rate Limits

| Request type | Unauthenticated | Authenticated |
|---|---|---|
| API metadata | ~300 / hour | ~1 000 / hour |
| File downloads | ~100 GB / month | ~1 TB / month |

Authenticated requests get significantly higher limits. For heavy batch downloads, use `HuggingFaceHub.jl` which handles retries and resumable downloads automatically.

## Revoke or Rotate a Token

1. Go to **huggingface.co → Settings → Access Tokens**
2. Click the **Delete** icon next to the token
3. Create a new token and update your environment variable

Tokens do not expire automatically — revoke them manually if compromised.

## Security Best Practices

- Never commit a token string to version control — add `.env` files to `.gitignore`
- Use a **Read** token for inference; only create Write tokens when pushing models
- On CI/CD systems, store the token as a secret environment variable
- Use **fine-grained tokens** scoped to specific repos when sharing access with collaborators
- Rotate tokens periodically, especially after working in shared environments
