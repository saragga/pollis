# Hugging Face Models — Factsheet

The **Hugging Face Hub** is the world's largest open repository of machine-learning models, datasets, and Spaces. As of 2025 it hosts over one million public model checkpoints across every major modality and task.

| | |
|---|---|
| **Hub URL** | https://huggingface.co/models |
| **Julia packages** | Transformers.jl, HuggingFaceHub.jl |
| **Model format** | SafeTensors / PyTorch `.bin` (downloaded automatically) |
| **Cache location** | `~/.cache/huggingface/hub/` (or `$HF_HOME`) |
| **Authentication** | `HF_TOKEN` environment variable |
| **Offline mode** | Set `HF_HUB_OFFLINE=1` to use cache without network |

## Key Functions at a Glance

| Task | Package | Function |
|------|---------|----------|
| Load tokenizer | Transformers.jl | `HuggingFace.load_tokenizer(id)` |
| Load model | Transformers.jl | `HuggingFace.load_model(Type, id)` |
| Download a single file | HuggingFaceHub.jl | `HuggingFaceHub.hf_hub_download(id, filename)` |
| Download whole repo | HuggingFaceHub.jl | `HuggingFaceHub.snapshot_download(id)` |
| List files in a repo | HuggingFaceHub.jl | `HuggingFaceHub.model_info(id)` |
| Search models | HuggingFaceHub.jl | `HuggingFaceHub.list_models(filter=...)` |
| Upload a file | HuggingFaceHub.jl | `HuggingFaceHub.upload_file(...)` |

## Pipeline Tag Taxonomy

The Hub tags every model with a `pipeline_tag` that describes its primary task:

```
Text        text-generation · text-classification · token-classification
            question-answering · summarization · translation · fill-mask
Audio       automatic-speech-recognition · audio-classification · text-to-speech
Vision      image-classification · object-detection · image-segmentation
            depth-estimation · image-to-image
Multimodal  image-text-to-text · visual-question-answering · document-question-answering
Structured  tabular-classification · tabular-regression · graph-ml
Other       reinforcement-learning · feature-extraction · robotics
```

## Package Versions

```julia
using Pkg
Pkg.status(["Transformers", "HuggingFaceHub"])
# Transformers    ≥ 0.2   — full Hub integration, SafeTensors support
# HuggingFaceHub  ≥ 0.2   — file download, model info, search, upload
```

## Architecture

Julia code calls either **Transformers.jl** (`load_tokenizer` / `load_model`) or **HuggingFaceHub.jl** (`hf_hub_download` / `model_info`). Both packages communicate with the HF Hub over HTTPS and store downloaded files in `~/.cache/huggingface/hub/`. On subsequent calls the local cache is used directly, with no network request.
