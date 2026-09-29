# Overview

The Hugging Face Hub is a **model-sharing platform** built around a simple idea: a Git repository per model, with a standardised card, weights, tokenizer config, and task tag. Any framework — PyTorch, JAX, TensorFlow, or Julia — can pull weights from it.

## What Lives on the Hub

Every model belongs to one of eight broad **task families**, each subdivided into specific pipeline tags:

| Family | Example pipeline tags |
|---|---|
| NLP / Text | `text-generation`, `text-classification`, `summarization` |
| Vision | `image-classification`, `object-detection` |
| Audio | `automatic-speech-recognition`, `text-to-speech` |
| Multimodal | `image-text-to-text`, `visual-question-answering` |
| Embedding | `feature-extraction`, `sentence-similarity` |
| Tabular | `tabular-classification`, `tabular-regression` |
| Reinforcement Learning | `reinforcement-learning` |
| Graph ML | `graph-ml` |

## How Models Are Identified

Every model has a unique **model ID** of the form `organisation/model-name`, for example:

- `meta-llama/Llama-3.2-3B-Instruct`
- `openai/whisper-large-v3`
- `sentence-transformers/all-MiniLM-L6-v2`

This ID is the string you pass to `load_model`, `load_tokenizer`, and `hf_hub_download`.

## How Julia Connects

Julia accesses the Hub through two complementary packages:

| Package | Role |
|---------|------|
| **Transformers.jl** | Loads model architecture + weights into Julia structs; provides `load_tokenizer` and `load_model` for the most common architectures (BERT, GPT, T5, Whisper, ViT, CLIP, …) |
| **HuggingFaceHub.jl** | Low-level Hub API: download arbitrary files, query model metadata, list models by tag, upload files. Useful when Transformers.jl does not yet support a given architecture. |

They share the same local cache at `~/.cache/huggingface/hub/`, so a model downloaded by one package is immediately available to the other.

## The Model Card

Every Hub model has a **model card** — a `README.md` that documents:
- What the model does and how it was trained
- Benchmark scores and intended use
- Licence, limitations, and bias considerations
- Code examples (usually in Python, but the patterns translate directly to Julia)

Always read the model card before using a model in production.

## Gated and Private Models

Some models (e.g. Llama, Gemma) are **gated** — you must accept a licence agreement on the Hub website before downloading. Set your token:

```julia
ENV["HF_TOKEN"] = "hf_..."   # or set it in your shell profile
```

Private models in your own organisation are accessed the same way, provided your token has the right permissions.

## See Also
- [Factsheet](factsheet.md) · [Choosing a Model](choosing-a-model.md) · [Download & Load](download-load.md)
