# Kaggle Models — Overview

The Kaggle Models Hub is a **model-sharing platform** built around competition-proven, production-ready checkpoints. Unlike Hugging Face, which focuses on research-grade weights in framework-native formats, Kaggle emphasises deployable snapshots — often in ONNX format — that have been validated on real benchmark tasks.

## What Lives on the Hub

Every model on Kaggle belongs to an **owner** (an organisation or user) and is versioned explicitly. A model reference takes the form:

```
owner/model-name/framework/variant/version
```

For example:
- `google/gemma/transformers/2b-it/3`
- `keras/gemma3/keras/gemma3_2b_en/2`
- `nvidia/efficientnet/tensorrt/efficientnet-b0/1`

## Task Families

| Family | Example models |
|---|---|
| **Multimodal** | CLIP, BLIP-2, PaliGemma |
| **NLP** | Gemma, Mistral, Qwen, BERT |
| **Vision** | EfficientNet, ResNet, YOLO, ViT |
| **Audio** | Whisper, wav2vec 2.0, YAMNet |
| **Tabular** | XGBoost, LightGBM, TabNet |
| **Reinforcement Learning** | PPO (CartPole, Atari), MuJoCo policies |

## How Julia Connects

Julia accesses Kaggle model weights through two complementary routes:

| Route | When to use |
|---|---|
| **ONNX.jl** | Model is available in ONNX format (`.onnx` file). Best for inference — no Python needed. |
| **ONNX.jl + `load_flux`** | You need a native Flux chain for further training or layer inspection. |
| **Kaggle CLI + manual load** | Model is only available in PyTorch / Keras format. Download the weights, then convert to ONNX offline using Python before loading in Julia. |

## The ONNX Advantage

ONNX (Open Neural Network Exchange) is a **framework-neutral** serialisation format. A model trained in PyTorch, TensorFlow, or JAX can be exported to ONNX and loaded identically in Julia, C++, Rust, or any other ONNX runtime. This makes Kaggle's ONNX-tagged models the most portable choice for Julia workflows.

Key properties:
- Single `.onnx` file contains both the graph topology and the weights
- Operator set (`opset`) version determines which operations are supported
- ONNX.jl supports opset 17 and most standard operators (Conv, LSTM, Attention, LayerNorm, …)

## Versioning and Reproducibility

Kaggle model versions are **immutable** — once published, a version never changes. Always record the full reference including the version number in your project:

```julia
# Record the exact reference used
const MODEL_REF = "google/gemma/transformers/2b-it/3"
```

## Comparing Kaggle and Hugging Face Models

| Aspect | Kaggle Models | Hugging Face Hub |
|---|---|---|
| Primary format | ONNX + framework-specific | SafeTensors / PyTorch `.bin` |
| Julia integration | ONNX.jl (opset-based) | Transformers.jl (architecture-specific) |
| Model count | ~3,000 (curated) | ~1,000,000 (open) |
| Versioning | Explicit immutable versions | Git branches / commits |
| Authentication | Kaggle API key (public models free) | HF token (gated models) |
| Competition context | Winning pipelines available | General research |

For most NLP and vision tasks, start with Hugging Face for breadth, and switch to Kaggle when you need a competition-proven ONNX checkpoint or a specific Google/Keras first-party model.