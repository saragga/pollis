# Package Guide

## Transformers.jl

Transformers.jl is the primary Julia interface for loading and running pretrained models from the Hugging Face Hub. It replicates the PyTorch Transformers Python library's architecture as native Julia structs built on Flux.jl.

### Installation

```julia
using Pkg
Pkg.add(["Transformers", "HuggingFaceHub"])
```

### Top-Level Namespaces

| Namespace | Purpose |
|---|---|
| `Transformers` | Core utilities: `generate`, `encode`, `decode` |
| `Transformers.HuggingFace` | Hub loading: `load_tokenizer`, `load_model`, `load_processor` |
| `Transformers.TextEncoders` | Tokenizer manipulation |

### Loading API

```julia
using Transformers.HuggingFace

# Tokenizer
tkr = HuggingFace.load_tokenizer(model_id; revision="main", cache_dir=nothing)

# Model (first argument is the architecture type)
model = HuggingFace.load_model(ArchType, model_id; revision="main")

# Processor (vision / audio / multimodal)
proc = HuggingFace.load_processor(model_id)
```

### Architecture Type Constants

| Architecture | Type constant |
|---|---|
| BERT / RoBERTa / ALBERT | `HuggingFace.BertModel` |
| BERT for sequence classification | `HuggingFace.BertForSequenceClassification` |
| BERT for token classification | `HuggingFace.BertForTokenClassification` |
| GPT-2 | `HuggingFace.GPT2Model` |
| GPT-NeoX / Mistral / Llama | `HuggingFace.GPTNeoXModel` |
| Llama (2 / 3 family) | `HuggingFace.LlamaModel` |
| T5 / MT5 | `HuggingFace.T5Model` |
| Whisper | `HuggingFace.WhisperModel` |
| Whisper (generation) | `HuggingFace.WhisperForConditionalGeneration` |
| Vision Transformer | `HuggingFace.ViTModel` |
| ViT for classification | `HuggingFace.ViTForImageClassification` |
| CLIP | `HuggingFace.CLIPModel` |

### Tokenizer API

```julia
# Encode a single string → NamedTuple(token, segment, attention_mask)
enc = tkr("Hello, world!")

# Encode a batch → padded NamedTuple with batch dimension
enc = tkr(["first sentence", "second sentence"]; padding=true, truncation=true, max_length=128)

# Decode token ids back to a string
text = tkr.decode(token_ids)

# Apply chat template (instruct models)
prompt = tkr.apply_chat_template(messages; tokenize=false, add_generation_prompt=true)

# Access vocabulary
id = tkr.vocab["[CLS]"]
```

### Generation API

```julia
# Greedy / sampling generation (autoregressive)
out = generate(model, enc.token;
    max_new_tokens = 256,
    temperature    = 0.8,
    top_p          = 0.9,
    repetition_penalty = 1.1,
)
text = tkr.decode(out[1])
```

### Model Config and Metadata

```julia
# Access model configuration
cfg = model.config
println(cfg.hidden_size, "  ", cfg.num_attention_heads)

# Label mappings (classification models)
label = model.config.id2label[pred_idx]
```

---

## HuggingFaceHub.jl

HuggingFaceHub.jl provides a direct Julia interface to the Hub REST API — file downloads, model search, metadata, and uploads — without requiring a specific architecture to be implemented in Transformers.jl.

### Core File Download

```julia
using HuggingFaceHub

# Download a single file; returns its local cache path
path = HuggingFaceHub.hf_hub_download(
    "google/gemma-2-9b",   # repo id
    "config.json";         # filename within repo
    subfolder  = nothing,  # optional subfolder
    revision   = "main",   # branch / tag / commit SHA
    cache_dir  = nothing,  # override default cache
    force_download = false,
)

# Download the whole repository snapshot
dir = HuggingFaceHub.snapshot_download(
    "google/gemma-2-9b";
    revision  = "main",
    ignore_patterns = ["*.bin", "*.pt"],  # skip large PyTorch files
)
```

### Model Search and Metadata

```julia
# Fetch metadata for a specific model
info = HuggingFaceHub.model_info("bert-base-uncased")
println(info.id, "  tags=", info.tags, "  downloads=", info.downloads)

# List all files in a repository
for f in info.siblings
    println(f.rfilename, "  ", f.size, " bytes")
end

# Search models with filters
models = HuggingFaceHub.list_models(
    filter = HuggingFaceHub.ModelFilter(
        task     = "text-generation",
        language = "en",
        library  = "transformers",
    ),
    sort  = "downloads",   # "trending", "likes", "lastModified"
    limit = 50,
)
```

### File Upload

```julia
# Upload a single file to your own Hub repository
HuggingFaceHub.upload_file(
    "my-org/my-model",     # repo id (must exist)
    "outputs/model.safetensors",  # local path
    "model.safetensors";   # destination path in repo
    commit_message = "Upload trained weights",
    token = ENV["HF_TOKEN"],
)
```

### Cache Management

```julia
# Inspect the local cache
HuggingFaceHub.scan_cache_dir()

# Delete a specific repo from cache
HuggingFaceHub.delete_cache(repo_id="bert-base-uncased")
HuggingFaceHub.delete_cache(repo_id="bert-base-uncased", revision="main")

# Environment variables
ENV["HF_HOME"]        = "/data/hf_cache"  # override default ~/.cache/huggingface
ENV["HF_HUB_OFFLINE"] = "1"              # never contact Hub, use cache only
ENV["HF_TOKEN"]       = "hf_..."          # authentication for gated models
```

### Dataset API

```julia
# Download a dataset file from Hub datasets
path = HuggingFaceHub.hf_hub_download(
    "stanfordnlp/sst2",
    "data/train.parquet";
    repo_type = "dataset",
)
```

---

## Choosing Between the Two Packages

- Architecture supported by Transformers.jl → use `load_tokenizer` + `load_model`
- Architecture not supported, need files / metadata only → use `hf_hub_download` / `model_info`
- Architecture not supported, need weights → use `snapshot_download`, then load manually with ONNX.jl or custom code
- Weights already cached, working offline → set `HF_HUB_OFFLINE=1` and load normally

Both packages share `~/.cache/huggingface/hub/` — downloading with one makes files available to the other automatically.
