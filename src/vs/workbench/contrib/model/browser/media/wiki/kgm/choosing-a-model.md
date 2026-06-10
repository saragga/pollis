# Choosing a Model

## Start with the Task Family

Every search on the Kaggle Models Hub should start with the **task family**. Use the Pollis Explore panel to filter by task group and framework before looking at individual models.

| Input → Output | Task family | Typical models on Kaggle |
|---|---|---|
| Text → Text (generation) | NLP | Gemma 2B/7B, Mistral 7B, Qwen |
| Text → Label | NLP | BERT, DeBERTa, DistilBERT |
| Image → Label | Vision | EfficientNet, ResNet-50, ViT |
| Image → Boxes | Vision | YOLOv8, DETR |
| Audio → Text | Audio | Whisper small/medium/large |
| Image + Text → Text | Multimodal | CLIP, PaliGemma |
| Table → Label | Tabular | XGBoost, LightGBM, TabNet |
| Environment → Action | RL | PPO (CartPole, Atari), SAC (MuJoCo) |

---

## Prefer ONNX for Julia

Kaggle models are available in multiple framework formats. For Julia, always prefer the **ONNX** variant when one exists:

| Framework tag | Julia support | Notes |
|---|---|---|
| `onnx` | ✅ Direct via ONNX.jl | Best choice — no Python needed |
| `transformers` | ⚠️ Indirect | Download, convert to ONNX in Python first |
| `keras` | ⚠️ Indirect | Same conversion step required |
| `pytorch` | ⚠️ Indirect | Use `torch.onnx.export` in Python |
| `jax` | ⚠️ Indirect | Export via `jax.experimental.jax2tf` + TF→ONNX |

If no ONNX variant is listed, check whether a matching model exists on Hugging Face with an ONNX export (many do — search for `onnx` in the model files).

---

## Understanding Kaggle Vote Count

Kaggle's primary quality signal is the **vote count** — how many users upvoted the model. Unlike download counts, votes reflect deliberate endorsement. High vote count combined with a recent `updateTime` is a strong signal of a maintained, trusted model.

> A model with 500 votes updated 3 months ago is generally safer than one with 5000 votes last updated 2 years ago.

---

## Model Size vs. Hardware

| Parameter range | Hardware | Inference speed | Examples |
|---|---|---|---|
| < 100 M | CPU only | Fast (< 100 ms) | EfficientNet-B0, DistilBERT, Whisper-tiny |
| 100 M – 1 B | CPU or GPU | Moderate (100–500 ms) | ResNet-50, BERT-large, Whisper-medium |
| 1 B – 7 B | GPU recommended | Slow on CPU | Gemma 2B, Mistral 7B |
| > 7 B | GPU required | Very slow on CPU | Gemma 7B, Llama 13B |

For CPU-only Julia workflows, target models under 500 M parameters with an ONNX export.

---

## Reading a Kaggle Model Page

Before downloading, check the model's page for:

| Section | What to look for |
|---|---|
| **Overview** | Task description, intended use, training data |
| **Framework variants** | Whether an ONNX variant exists |
| **Version history** | How recently the model was updated |
| **Discussion** | Known issues, community fixes, usage examples |
| **Licence** | Apache 2.0 / MIT / CC BY-NC — check before commercial use |
| **Vote count** | Community quality signal |

---

## Benchmarks to Reference

### NLP

| Benchmark | Measures |
|---|---|
| **MMLU** | Multi-task knowledge across science, law, math (accuracy %) |
| **HellaSwag** | Common-sense completion |
| **GSM8K** | Grade-school math word problems |
| **HumanEval** | Code generation (pass@1) |

### Vision

| Benchmark | Measures |
|---|---|
| **ImageNet-1k** | 1,000-class classification (top-1 accuracy) |
| **COCO** | Object detection mAP, instance segmentation |

### Audio

| Benchmark | Measures |
|---|---|
| **LibriSpeech test-clean** | ASR word-error-rate on clean speech |
| **CommonVoice** | Multilingual ASR quality |

---

## Quick Decision Checklist

Before downloading a Kaggle model:

- [ ] Is there an ONNX variant? (check framework dropdown on the model page)
- [ ] Does the model size fit my hardware? (see table above)
- [ ] Is the vote count and update date acceptable?
- [ ] Have I read the overview for intended use and limitations?
- [ ] Is the licence compatible with my use (academic / commercial)?
- [ ] Is the opset version ≤ 17? (ONNX.jl supports opset 17 and below)