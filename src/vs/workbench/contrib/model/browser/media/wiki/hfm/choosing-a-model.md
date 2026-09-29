# Choosing a Model

## Start with the Task

Every search on the Hub should start with the `pipeline_tag`. Never browse by model name alone — different architectures excel at different tasks.

| Input → Output | Pipeline tag | Typical models |
|---|---|---|
| Text → Text (generation) | `text-generation` | LLaMA, Mistral, Gemma, Qwen |
| Text → Label | `text-classification` | BERT, DeBERTa, DistilBERT |
| Text → Vector | `feature-extraction` | all-MiniLM, e5, GTE |
| Image → Label | `image-classification` | ViT, ConvNeXt, EfficientNet |
| Image → Boxes | `object-detection` | DETR, YOLO |
| Audio → Text | `automatic-speech-recognition` | Whisper |
| Text + Image → Text | `image-text-to-text` | LLaVA, PaliGemma |

---

## Reading a Model Card

Every Hub model has a `README.md` model card. The key sections to read before using a model:

| Section | What to look for |
|---|---|
| **Model summary** | Exact task, language(s), domain |
| **Intended use / out-of-scope** | Explicitly listed misuse cases |
| **Training data** | Size, source, licence |
| **Evaluation results** | Benchmark names and scores |
| **Limitations / bias** | Known failure modes, demographic skew |
| **Licence** | Whether commercial use is allowed |

> A model with a strong eval score but a narrow dataset may fail badly on your data. Always check training data before trusting a leaderboard number.

---

## Understanding Benchmarks

### NLP / Language Models

| Benchmark | Measures |
|---|---|
| **MMLU** | Multi-task knowledge: science, law, math, history (accuracy %) |
| **HellaSwag** | Common-sense reasoning / completion |
| **GSM8K** | Grade-school math word problems |
| **HumanEval** | Code generation (pass@1) |
| **MTEB** | Embedding quality across classification, clustering, retrieval, re-ranking |
| **LiveCodeBench** | Live programming tasks — less contaminated than HumanEval |

### Vision

| Benchmark | Measures |
|---|---|
| **ImageNet-1k** | 1,000-class image classification (top-1 accuracy) |
| **COCO** | Object detection mAP, instance segmentation |
| **ADE20K** | Semantic segmentation mIoU |

### Audio

| Benchmark | Measures |
|---|---|
| **LibriSpeech test-clean / other** | ASR word-error-rate on clean and noisy speech |
| **CommonVoice** | Multilingual ASR quality |

---

## Size vs. Accuracy Tradeoffs

| Size class | Parameter range | Hardware | Examples |
|---|---|---|---|
| Small | < 1 B | CPU, fast, offline | DistilBERT 66 M, all-MiniLM 22 M |
| Medium | 1–13 B | GPU recommended | Llama 3.2 3B, Gemma 3 4B |
| Large | 13–70 B | 24 GB+ VRAM | Llama 3.1 70B, Qwen 2.5 72B |
| Frontier | > 70 B | Multi-GPU | Llama 3.1 405B |

**Practical rules of thumb:**

- For **embedding / similarity** tasks, models under 500 M parameters (e.g., `all-MiniLM-L6-v2`, `BAAI/bge-small-en-v1.5`) often match or beat billion-parameter models at a fraction of the cost.
- For **text classification**, a fine-tuned DeBERTa-base (183 M) typically outperforms a zero-shot GPT-4 prompt on structured labels.
- For **generation / reasoning**, model quality improves predictably with size up to ~70 B, then gains flatten.
- Prefer **quantised GGUF models** (via Ollama) when running locally without a datacenter GPU — a Q4 quantised 7 B model uses ~4 GB RAM and runs at acceptable speed on a modern laptop.

---

## Checking Licence Before Use

The Hub makes the licence prominent on every model page. Common licences:

| Licence | Commercial use | Redistribution |
|---|---|---|
| **Apache 2.0** | ✅ Yes | ✅ Yes |
| **MIT** | ✅ Yes | ✅ Yes |
| **CC BY 4.0** | ✅ Yes | ✅ with attribution |
| **CC BY-NC 4.0** | ❌ No | ✅ non-commercial only |
| **Llama 3 Community** | ✅ Yes (< 700 M MAU) | ✅ with attribution |
| **Gemma** | ✅ Yes | ✅ restricted redistribution |

For academic / research work in a university setting, CC BY-NC models are generally fine. Always confirm with your institution's IP office before deploying commercially.

---

## Filtering the Hub Search

```julia
using HuggingFaceHub

# Top trending text-generation models
models = HuggingFaceHub.list_models(
    filter  = HuggingFaceHub.ModelFilter(task="text-generation", language="en"),
    sort    = "downloads",
    limit   = 20,
)

for m in models
    println(m.id, "  downloads=", m.downloads, "  licence=", get(m.tags, "licence", "?"))
end
```

---

## Quick Decision Checklist

Before pulling a model:

- [ ] Does the `pipeline_tag` match my task exactly?
- [ ] Have I read the limitations / bias section of the model card?
- [ ] Is the benchmark dataset close to my target domain?
- [ ] Does the model size fit my hardware budget?
- [ ] Is the licence compatible with my use (academic / commercial)?
- [ ] Is there a quantised version if I plan to run locally via Ollama?

## See Also
- [Package Guide](package-guide.md) · [Download & Load](download-load.md) · [Run Inference](run-inference.md)
