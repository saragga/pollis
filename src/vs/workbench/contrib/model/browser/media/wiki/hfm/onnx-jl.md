# ONNX.jl

ONNX.jl is Julia's native interface for the **Open Neural Network Exchange** format. In the Hugging Face context it bridges two worlds: models trained and distributed as PyTorch or TensorFlow weights can be exported to `.onnx` once and then loaded, inspected, and run entirely in Julia — no Python required at inference time.

## Why ONNX for Hugging Face Models

Hugging Face distributes most models as PyTorch checkpoints. ONNX offers a portable alternative:

- **No Python dependency** — run inference in Julia without a Python environment.
- **Faster cold start** — ONNX Runtime skips the PyTorch import chain.
- **Hardware portability** — the same `.onnx` file runs on CPU, CUDA, or any ONNX-compatible accelerator.
- **Reproducible shapes** — the graph is statically typed; shape errors surface at load time, not mid-run.

Many popular HF models are already available as ONNX variants in the same Hub repository (e.g. `model.onnx` or under an `onnx/` subfolder).

## Installation

```julia
using Pkg
Pkg.add("ONNX")
```

## Exporting a Hugging Face Model to ONNX (Python, one-time)

Use the `optimum` CLI — the standard tool from HuggingFace for ONNX export:

```bash
pip install optimum[exporters]
optimum-cli export onnx --model bert-base-uncased ./bert-onnx/
```

This produces `model.onnx` (and tokeniser config files) in `./bert-onnx/`. For encoder-decoder models such as T5:

```bash
optimum-cli export onnx --model t5-small --task text2text-generation ./t5-onnx/
```

You can also export directly from Python:

```python
from optimum.exporters.onnx import main_export
main_export("distilbert-base-uncased-finetuned-sst-2-english",
            output="./distilbert-onnx/", task="text-classification")
```

## Loading in Julia

```julia
using ONNX

model = ONNX.load("bert-onnx/model.onnx")
```

Select the execution backend with `providers`:

```julia
model_cpu  = ONNX.load("model.onnx"; providers=[:CPU])   # default
model_cuda = ONNX.load("model.onnx"; providers=[:CUDA])  # NVIDIA GPU
```

## Inspecting the Graph

```julia
# Input and output names
println(ONNX.input_names(model))    # ["input_ids", "attention_mask", "token_type_ids"]
println(ONNX.output_names(model))   # ["last_hidden_state"] or ["logits"]

# Input shapes (batch_size is often dynamic → shown as 0 or -1)
for inp in model.graph.input
    shape = [d.dim_value for d in inp.type.tensor_type.shape.dim]
    println(inp.name, " → ", shape)
end
```

## Running Inference

Most HF ONNX models take named inputs. Supply them as a `Dict`:

```julia
# BERT / DistilBERT — text classification
out = model(Dict(
    "input_ids"      => ids,           # Int64 (batch, seq_len)
    "attention_mask" => mask,          # Int64 (batch, seq_len)
))
logits = out["logits"]                 # Float32 (batch, num_labels)
```

For encoder-decoder models the encoder and decoder are separate ONNX files:

```julia
encoder = ONNX.load("t5-onnx/encoder_model.onnx")
decoder = ONNX.load("t5-onnx/decoder_model.onnx")

enc_out  = encoder(Dict("input_ids" => ids, "attention_mask" => mask))
dec_out  = decoder(Dict("input_ids"      => decoder_ids,
                        "encoder_hidden_states" => enc_out["last_hidden_state"]))
```

## Tokenisation

ONNX.jl handles the model graph only — tokenisation still requires a separate step. Options:

**Transformers.jl** (recommended for HF models):

```julia
using Transformers, Transformers.TextEncoders

tokenizer = load_tokenizer("bert-base-uncased")
encoded   = tokenizer("The cat sat on the mat.")

ids  = Int64.(encoded.token)                  # (seq_len,)
mask = Int64.(encoded.attention_mask)
ids_batch  = reshape(ids,  1, :)              # add batch dim → (1, seq_len)
mask_batch = reshape(mask, 1, :)
```

**HuggingFaceHub.jl** (download config only, pair with manual encoding):

```julia
using HuggingFaceHub

HuggingFaceHub.hf_hub_download("bert-base-uncased", "tokenizer.json"; local_dir="./bert-tok/")
```

## Full Example — DistilBERT Sentiment Classification

```julia
using ONNX, Transformers, Transformers.TextEncoders

model     = ONNX.load("distilbert-onnx/model.onnx")
tokenizer = load_tokenizer("distilbert-base-uncased-finetuned-sst-2-english")
labels    = ["NEGATIVE", "POSITIVE"]

function classify(text::String)
    enc  = tokenizer(text)
    ids  = reshape(Int64.(enc.token),          1, :)
    mask = reshape(Int64.(enc.attention_mask), 1, :)

    out     = model(Dict("input_ids" => ids, "attention_mask" => mask))
    logits  = vec(out["logits"])
    probs   = exp.(logits) ./ sum(exp.(logits))    # softmax
    best    = argmax(probs)
    println(labels[best], "  (", round(100 * probs[best], digits=1), "%)")
end

classify("This film was surprisingly moving.")
classify("The product broke within two days.")
```

## Converting to a Flux Chain

`ONNX.load_flux` converts the ONNX graph to a native Flux `Chain` for further training or inspection:

```julia
using ONNX, Flux

chain = ONNX.load_flux("model.onnx")
println(chain)
println("Parameters: ", sum(length, Flux.params(chain)))
```

Conversion works for architectures built from standard ops. Models with dynamic control flow (Python loops over sequence length) are not supported.

## Downloading ONNX Variants Directly from the Hub

Some repositories ship ready-made ONNX files — no export needed:

```julia
using HuggingFaceHub

# Download the ONNX variant of a model
HuggingFaceHub.hf_hub_download(
    "optimum/bert-base-uncased",     # repo that hosts the ONNX export
    "model.onnx";
    local_dir = "./bert-onnx/",
)
```

Use the Hub search to find repos tagged `onnx`:

```julia
results = HuggingFaceHub.list_models(; filter="onnx", limit=20)
for m in results
    println(m.id)
end
```

## Supported Opset

ONNX.jl targets **opset 17**. To check a model's opset:

```julia
println("Model opset: ", model.opset_import[1].version)
```

If the opset is 18+, re-export with `opset_version=17`:

```python
# PyTorch
torch.onnx.export(model, example, "model.onnx", opset_version=17)

# Optimum CLI
optimum-cli export onnx --model <repo> --opset 17 ./output/
```

## Common Errors and Fixes

| Error | Cause | Fix |
|---|---|---|
| `Unsupported op: ...` | Op not implemented in ONNX.jl | Re-export with opset 17; simplify architecture |
| `Shape mismatch` | Input dimensions do not match graph declaration | Check `model.graph.input` for expected shape |
| `Key not found: "logits"` | Wrong output name | Use `ONNX.output_names(model)` |
| `CUDA not functional` | No NVIDIA GPU or CUDA.jl missing | Use `providers=[:CPU]` |

## See Also

- [ONNX.jl GitHub](https://github.com/FluxML/ONNX.jl)
- [Hugging Face Optimum](https://github.com/huggingface/optimum) — official HF ONNX exporter
- [Transformers.jl](https://github.com/chengchingwen/Transformers.jl) — tokenisation and native Julia transformer inference
