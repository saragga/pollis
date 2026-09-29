# Authentication

Most datasets on the Hugging Face Hub are **public** and need no credentials. A token is required only for:

- **Gated datasets** — public datasets whose owner requires you to accept terms or request access first.
- **Private datasets** — datasets visible only to you or your organisation.
- **Higher rate limits** — authenticated requests are throttled less aggressively.

## Get a token

1. Sign in at [huggingface.co](https://huggingface.co).
2. Open **Settings → Access Tokens**.
3. Create a token with at least **read** scope and copy it.

## Set it in Pollis

Click **Set token** on the *Powered by* line of this webview. Pollis stores the token in VS Code **Secret Storage** — never in settings, generated code, or any saved file. The same token is shared with the **Hugging Face Models** webview.

## How the token is used

- **Julia REPL:** when you *Send to Julia REPL*, Pollis injects the token into that session only, as `ENV["HUGGING_FACE_HUB_TOKEN"] = "..."`. It is set as a session environment variable and never lands on disk.
- **HuggingFaceDatasets.jl:** the underlying Python `datasets`/`huggingface_hub` stack reads `HUGGING_FACE_HUB_TOKEN` from the environment automatically, so gated datasets just work once the token is set.
- **REST API:** the generated code adds an `Authorization: Bearer ...` header only when the token is present:

```julia
auth = haskey(ENV, "HUGGING_FACE_HUB_TOKEN") ? ["Authorization" => "Bearer $(ENV["HUGGING_FACE_HUB_TOKEN"])"] : Pair{String, String}[]
```

> **Send to Editor / Notebook do not inject the token.** Those persist to disk, so you must set the environment variable in that session yourself.

## See Also
- [Factsheet](factsheet.md) — endpoints and the Julia stack
- [Choosing a Dataset](choosing-a-dataset.md) — licences and gated access
