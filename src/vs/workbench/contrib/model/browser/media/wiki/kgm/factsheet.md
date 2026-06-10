# Kaggle Models — Factsheet

The **Kaggle Models Hub** is a public repository of pretrained model weights hosted by Kaggle (Google). It specialises in production-ready, competition-proven models exported in the **ONNX** format, making them straightforward to load from any language including Julia.

| | |
|---|---|
| **Hub URL** | https://www.kaggle.com/models |
| **Julia packages** | ONNX.jl, Flux.jl |
| **Primary format** | ONNX (`.onnx`) — portable, framework-independent |
| **Authentication** | Kaggle API key (`~/.kaggle/kaggle.json`) for private models; public models require no key |
| **Cache location** | User-managed; download with `kaggle models instances versions download` |
| **Model reference** | `owner/model-name/framework/variant/version` (e.g. `google/gemma/transformers/2b-it/3`) |

## Key Operations at a Glance

| Task | Tool | Command / Function |
|---|---|---|
| Browse models | Kaggle CLI | `kaggle models list --search <term>` |
| Download weights | Kaggle CLI | `kaggle models instances versions download <ref>` |
| Load ONNX model | ONNX.jl | `ONNX.load("model.onnx")` |
| Run forward pass | ONNX.jl | `model(input)` |
| Inspect graph | ONNX.jl | `ONNX.input_names(model)`, `ONNX.output_names(model)` |
| Convert to Flux | ONNX.jl | `ONNX.load_flux("model.onnx")` |

## Task Taxonomy

Kaggle models are grouped by task family, matching the Pollis Explore panel:

```
Multimodal   image-text classification · visual Q&A · document understanding
NLP          text generation · summarisation · translation · Q&A
Vision       image classification · object detection · segmentation
Audio        speech recognition · audio classification · text-to-speech
Tabular      classification · regression · time series forecasting
RL           reinforcement learning · robotic control · game-playing policies
```

## Framework Formats on Kaggle

| Framework tag | Description |
|---|---|
| `transformers` | Hugging Face Transformers weights (PyTorch `.bin` / SafeTensors) |
| `keras` | TensorFlow/Keras SavedModel or `.h5` |
| `pytorch` | Raw PyTorch `.pt` checkpoint |
| `jax` | JAX/Flax weights |
| `onnx` | ONNX format — best choice for Julia via ONNX.jl |

## Package Versions

```julia
using Pkg
Pkg.status(["ONNX", "Flux"])
# ONNX  ≥ 0.3   — full ONNX opset 17 support, Flux interop
# Flux  ≥ 0.14  — Chain, Dense, Conv, RNN layers
```

## Architecture

Julia code calls **ONNX.jl** to load `.onnx` files downloaded from the Kaggle Hub. ONNX.jl parses the operator graph and builds a callable Julia object. Optional conversion to a native Flux chain is available via `ONNX.load_flux`. No network access is needed at inference time — all weights are local.