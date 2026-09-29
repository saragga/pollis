# Download & Load

## The Two-Package System

Use **Transformers.jl** when the architecture is supported (BERT, GPT-2/Neo, T5, Whisper, ViT, CLIP, LLaMA, Mistral, …). Use **HuggingFaceHub.jl** to pull raw files for any other model, then load them manually.

## Authentication

Gated models (Llama, Gemma, Phi-4, …) require an HF access token.

```julia
# Option 1 — set once in your shell profile (~/.zshrc or ~/.bashrc)
export HF_TOKEN="hf_xxxxxxxxxxxxxxxxxxxx"

# Option 2 — set per session in Julia
ENV["HF_TOKEN"] = "hf_xxxxxxxxxxxxxxxxxxxx"
```

Get a token at **huggingface.co → Settings → Access Tokens**. Read-only scope is sufficient for downloading.

## Loading with Transformers.jl

```julia
using Transformers, Transformers.HuggingFace

# Tokenizer + model (weights downloaded on first call, cached afterwards)
tkr   = HuggingFace.load_tokenizer("bert-base-uncased")
model = HuggingFace.load_model(HuggingFace.BertModel, "bert-base-uncased")
```

### Architecture type constants

| Model family | Type constant |
|---|---|
| BERT / RoBERTa | `HuggingFace.BertModel` |
| GPT-2 | `HuggingFace.GPT2Model` |
| T5 | `HuggingFace.T5Model` |
| Whisper | `HuggingFace.WhisperModel` |
| Vision Transformer | `HuggingFace.ViTModel` |
| CLIP | `HuggingFace.CLIPModel` |

### Specifying a revision

```julia
# Pin to a specific commit or branch instead of the default "main"
tkr   = HuggingFace.load_tokenizer("mistralai/Mistral-7B-v0.1"; revision="v0.1")
model = HuggingFace.load_model(HuggingFace.GPTNeoXModel, "mistralai/Mistral-7B-v0.1"; revision="v0.1")
```

## Downloading Raw Files with HuggingFaceHub.jl

Use this path when Transformers.jl does not yet have a first-class wrapper for an architecture.

```julia
using HuggingFaceHub

# Download a single file; returns the local path
path = HuggingFaceHub.hf_hub_download("google/gemma-2-9b", "config.json")

# Download the whole repository snapshot (all files)
dir  = HuggingFaceHub.snapshot_download("google/gemma-2-9b")
```

## Cache Management

Downloaded weights are stored in `~/.cache/huggingface/hub/` by default.

```julia
# Use a custom cache directory
ENV["HF_HOME"] = "/data/hf_cache"

# Force offline mode — never contact the Hub, use only what is cached
ENV["HF_HUB_OFFLINE"] = "1"

# Check what is cached
using HuggingFaceHub
HuggingFaceHub.scan_cache_dir()

# Delete a specific cached revision
HuggingFaceHub.delete_cache(repo_id="bert-base-uncased")
```

## Running Models Locally via Ollama

For large language models (LLMs) you can run inference **entirely offline** using [Ollama](https://ollama.com), which bundles the model weights and a local HTTP server. This lets you use a model like Gemma or Llama as a backend for Claude Code or any OpenAI-compatible client without sending data to the cloud.

Ollama pulls or converts model weights to GGUF format, then serves them via a local HTTP server on `localhost:11434`. Any OpenAI-compatible client — Claude Code, Julia, or other apps — can then use the model without sending data to the cloud.

### Step-by-step: Gemma 3 12B → Ollama → Claude Code

```bash
# 1. Install Ollama (macOS)
brew install ollama

# 2. Pull a pre-packaged model directly (no HF download needed for popular models)
ollama pull gemma3:12b

# 3. Start the server (runs in background on port 11434)
ollama serve &

# 4. Use it with Claude Code
claude --model ollama/gemma3:12b
```

```julia
# Or call it from Julia with HTTP.jl
using HTTP, JSON3

resp = HTTP.post("http://localhost:11434/api/generate",
    ["Content-Type" => "application/json"],
    JSON3.write((model="gemma3:12b", prompt="Explain BERT in one paragraph.", stream=false)))

println(JSON3.read(resp.body).response)
```

### Using a model you downloaded from the Hub

```bash
# Convert HF weights to GGUF with llama.cpp, then import into Ollama
ollama create my-gemma --file ./Modelfile
```

where `Modelfile` contains:
```
FROM ./gemma-converted.gguf
PARAMETER temperature 0.7
SYSTEM "You are a helpful Julia data-science assistant."
```

## See Also
- [Access Tokens](access-tokens.md) · [Run Inference](run-inference.md) · [Choosing a Model](choosing-a-model.md)
