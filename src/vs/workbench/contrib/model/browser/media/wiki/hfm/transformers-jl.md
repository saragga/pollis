# Transformers.jl Reference

Transformers.jl brings the Hugging Face model ecosystem to Julia. It provides:
- First-class loading of hundreds of pretrained architectures from the Hub
- Native Julia model structs built on Flux.jl (composable, differentiable)
- Tokenizers that match Python Transformers output exactly
- A `generate` function for autoregressive decoding

| Namespace | Purpose |
|---|---|
| `Transformers.HuggingFace` | Hub loading and saving |
| `Transformers.TextEncoders` | Tokenizer utilities |
| `Transformers` (core) | `generate`, `encode`, `decode` |
| Flux.jl models | `Chain`, `Dense`, `LayerNorm`, … |
| CUDA.jl | `gpu()` / `cpu()` transfer |

---

## Package Setup

```julia
using Pkg
Pkg.add("Transformers")

# Optional but recommended for GPU
Pkg.add("CUDA")
Pkg.add("cuDNN")
```

Minimum Julia version: **1.9**. SafeTensors support (faster loads, no Python dependency) requires Transformers ≥ 0.2.

---

## Loading Models and Tokenizers

```julia
using Transformers, Transformers.HuggingFace

# Standard pattern — tokenizer always loads first
tkr   = HuggingFace.load_tokenizer("bert-base-uncased")
model = HuggingFace.load_model(HuggingFace.BertModel, "bert-base-uncased")

# Gated model — set token first
ENV["HF_TOKEN"] = "hf_..."
tkr   = HuggingFace.load_tokenizer("meta-llama/Llama-3.2-3B-Instruct")
model = HuggingFace.load_model(HuggingFace.LlamaModel, "meta-llama/Llama-3.2-3B-Instruct")

# Vision / audio processor
proc = HuggingFace.load_processor("openai/clip-vit-base-patch32")
```

Models are downloaded to `~/.cache/huggingface/hub/` on first call and reused from cache afterwards.

---

## The Encoding NamedTuple

`tkr(text)` returns a `NamedTuple` — always destructure it rather than indexing numerically:

```julia
enc = tkr("Transformers.jl is great!")
# enc.token          — Int matrix, shape (seq_len, 1)
# enc.segment        — token-type ids (BERT), zeros for most models
# enc.attention_mask — 1 for real tokens, 0 for padding

# Batched encoding
enc = tkr(["first", "second", "third"]; padding=true, max_length=128)
# enc.token shape: (128, 3)
```

---

## Supported Architectures

### Text / Language Models

| Architecture | Variants | Type constant |
|---|---|---|
| BERT | BERT, RoBERTa, ALBERT, DistilBERT | `BertModel` |
| BERT seq classification | | `BertForSequenceClassification` |
| BERT token classification | | `BertForTokenClassification` |
| GPT-2 | GPT-2, DistilGPT-2 | `GPT2Model` |
| GPT-NeoX | Mistral, Zephyr | `GPTNeoXModel` |
| Llama | Llama-2, Llama-3, Gemma | `LlamaModel` |
| T5 | T5, MT5, Flan-T5 | `T5Model` |

### Vision

| Architecture | Variants | Type constant |
|---|---|---|
| ViT | ViT-B/16, ViT-L/32 | `ViTModel` |
| ViT classification | | `ViTForImageClassification` |
| CLIP | CLIP-ViT-B/32, L/14 | `CLIPModel` |

### Audio

| Architecture | Variants | Type constant |
|---|---|---|
| Whisper | tiny, base, small, medium, large-v3 | `WhisperModel` |
| Whisper (generation) | | `WhisperForConditionalGeneration` |

---

## Inference Patterns

### Encoder-only (BERT-style)

```julia
enc = tkr("The movie was [MASK] amazing.")
out = model(enc.token, enc.segment, enc.attention_mask)
# out.hidden_state: (hidden_dim, seq_len, batch)
cls_embedding = out.hidden_state[:, 1, :]   # CLS token
```

### Decoder-only / Autoregressive (LLaMA-style)

```julia
enc = tkr("The capital of France is")
out = generate(model, enc.token;
    max_new_tokens    = 32,
    temperature       = 0.8,
    top_p             = 0.95,
    repetition_penalty = 1.1,
    eos_token_id      = tkr.eos_id,
)
println(tkr.decode(out[1]))
```

### Encoder-decoder (T5-style)

```julia
enc = tkr("translate English to French: I love Julia.")
out = generate(model, enc.token; decoder_start_token_id=model.config.decoder_start_token_id)
println(tkr.decode(out[1]))
```

---

## GPU Acceleration

```julia
using CUDA, Flux

# Move model to GPU once at startup
model_gpu = model |> gpu

# Move inputs to GPU at inference time
function gpu_forward(tkr, model_gpu, text)
    enc = tkr(text)
    token = enc.token |> gpu
    seg   = enc.segment |> gpu
    mask  = enc.attention_mask |> gpu
    out   = model_gpu(token, seg, mask)
    out.hidden_state |> cpu   # move result back to CPU
end

hs = gpu_forward(tkr, model_gpu, "Hello, GPU world!")
```

---

## Saving and Loading Local Weights

```julia
using Transformers.HuggingFace

# Save tokenizer + model to a local directory
HuggingFace.save_tokenizer(tkr, "my_model/")
HuggingFace.save_model(model, "my_model/")

# Reload from local directory (same API as Hub loading)
tkr2   = HuggingFace.load_tokenizer("my_model/")
model2 = HuggingFace.load_model(HuggingFace.BertModel, "my_model/")
```

---

## Fine-tuning

Transformers.jl models are Flux.jl chains — standard Flux training loops work directly.

```julia
using Flux, Optimisers

# Freeze all layers except the classification head
ps = Flux.params(model.pooler, model.classifier)

opt = Optimisers.Adam(2e-5)
opt_state = Optimisers.setup(opt, model)

for epoch in 1:3
    for (text_batch, labels) in dataloader
        enc = tkr(text_batch; padding=true, max_length=128)
        gs = gradient(Flux.params(model)) do
            logits = model(enc.token, enc.segment, enc.attention_mask).logits
            Flux.logitcrossentropy(logits, Flux.onehotbatch(labels, classes))
        end
        Optimisers.update!(opt_state, model, gs)
    end
end
```

---

## Useful Links

| Resource | URL |
|---|---|
| Transformers.jl GitHub | github.com/chengchingwen/Transformers.jl |
| Transformers.jl Docs | chengchingwen.github.io/Transformers.jl |
| HuggingFaceHub.jl GitHub | github.com/JuliaHuggingFace/HuggingFaceHub.jl |
| Julia Discourse — ML | discourse.julialang.org/c/domain/ml |

## See Also
- [ONNX.jl](onnx-jl.md) · [Package Guide](package-guide.md) · [Run Inference](run-inference.md)
