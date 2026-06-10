# Kaggle API Key

## Why You Need a Key

The Kaggle REST API and CLI both require authentication. A key is needed to:

- Download model weights programmatically
- Query the model list API (`/api/v1/models/list`)
- Access private or competition-restricted models
- Upload datasets or model versions

Public model metadata can be browsed without a key, but downloading files always requires authentication.

## Create Your API Key

1. Sign in at **kaggle.com**
2. Click your profile picture → **Settings**
3. Scroll to the **API** section
4. Click **Create New Token**

A file called `kaggle.json` is downloaded automatically. It contains:

```json
{"username": "your-kaggle-username", "key": "your-api-key"}
```

Keep this file private — anyone with your key can act as you on Kaggle.

## Install the Key

Place `kaggle.json` at the standard location so the CLI and API clients find it automatically:

```bash
# macOS / Linux
mkdir -p ~/.kaggle
mv ~/Downloads/kaggle.json ~/.kaggle/kaggle.json
chmod 600 ~/.kaggle/kaggle.json   # restrict read access to your user only

# Windows (PowerShell)
New-Item -ItemType Directory -Force "$env:USERPROFILE\.kaggle"
Move-Item "$env:USERPROFILE\Downloads\kaggle.json" "$env:USERPROFILE\.kaggle\kaggle.json"
```

The `chmod 600` step on macOS/Linux is required — the Kaggle CLI will refuse to run if the file is world-readable.

## Use the Key in Julia

### Option 1 — `~/.kaggle/kaggle.json` (recommended)

If the file is installed at the standard path, read it directly:

```julia
using JSON3

creds    = JSON3.read(read(joinpath(homedir(), ".kaggle", "kaggle.json"), String))
username = creds.username
key      = creds.key
```

### Option 2 — Environment Variables

Set `KAGGLE_USERNAME` and `KAGGLE_KEY` in your shell profile (`~/.zshrc` or `~/.bashrc`) so they are available in every Julia session:

```bash
export KAGGLE_USERNAME="your-kaggle-username"
export KAGGLE_KEY="your-api-key"
```

Then read them in Julia:

```julia
username = ENV["KAGGLE_USERNAME"]
key      = ENV["KAGGLE_KEY"]
```

### Option 3 — Per-Session in Julia

Set the variables at the top of a script or notebook. Do **not** hard-code the key in files you share or commit to version control:

```julia
ENV["KAGGLE_USERNAME"] = "your-kaggle-username"
ENV["KAGGLE_KEY"]      = "your-api-key"
```

## Make Authenticated API Requests

Kaggle uses HTTP Basic Auth — encode `username:key` in Base64 and pass it as the `Authorization` header:

```julia
using HTTP, Base64

username = ENV["KAGGLE_USERNAME"]
key      = ENV["KAGGLE_KEY"]
auth     = "Basic " * base64encode("$username:$key")

resp = HTTP.get(
    "https://www.kaggle.com/api/v1/models/list?search=resnet&pageSize=5",
    ["Authorization" => auth],
)
```

## Download a Model File

```julia
using HTTP, Base64

function kaggle_download(url::String, dest::String)
    auth = "Basic " * base64encode("$(ENV["KAGGLE_USERNAME"]):$(ENV["KAGGLE_KEY"])")
    resp = HTTP.get(url, ["Authorization" => auth])
    write(dest, resp.body)
    println("Saved $(filesize(dest) ÷ 1024) KB → $dest")
end

kaggle_download(
    "https://www.kaggle.com/api/v1/models/keras/resnet/keras/resnet50/2/download",
    "resnet50.onnx",
)
```

## Revoke or Rotate a Key

If your key is compromised:

1. Go to **kaggle.com → Settings → API**
2. Click **Expire API Token** to immediately invalidate the current key
3. Click **Create New Token** to generate a replacement
4. Update `~/.kaggle/kaggle.json` and any environment variables

## Key Scope and Limits

| Property | Value |
|---|---|
| Scope | Full account access (there is no read-only scope) |
| Rate limit | ~200 requests / hour for the model download API |
| Expiry | Keys do not expire automatically — revoke manually if needed |
| Multiple keys | Only one active key per account at a time |

## Security Best Practices

- Never commit `kaggle.json` or raw key strings to version control — add `~/.kaggle/` to `.gitignore`
- On shared machines, prefer environment variables over the JSON file
- Rotate your key periodically, especially after working on shared or public notebooks
- On CI/CD systems, store the key as a secret environment variable, not in config files
