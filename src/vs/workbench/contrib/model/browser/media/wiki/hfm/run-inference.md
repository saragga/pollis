# Run Inference

## The Universal Pattern

Regardless of modality, inference follows the same three stages: **preprocess** the raw input (tokenizer or processor) → **forward pass** through the model → **post-process** the output (decode / argmax / softmax).

---

## Text — Language Models

```julia
using Transformers, Transformers.HuggingFace

tkr   = HuggingFace.load_tokenizer("meta-llama/Llama-3.2-3B-Instruct")
model = HuggingFace.load_model(HuggingFace.LlamaModel, "meta-llama/Llama-3.2-3B-Instruct")

# Tokenise
enc = tkr("The capital of France is")

# Generate (autoregressive)
out  = generate(model, enc.token; max_new_tokens=32)
text = tkr.decode(out[1])
println(text)
```

### Chat / instruction models

```julia
# Most instruct models expect a specific prompt template
messages = [
    Dict("role" => "system",    "content" => "You are a Julia expert."),
    Dict("role" => "user",      "content" => "What is multiple dispatch?"),
]
prompt = tkr.apply_chat_template(messages; tokenize=false, add_generation_prompt=true)
enc    = tkr(prompt)
out    = generate(model, enc.token; max_new_tokens=256, temperature=0.7)
println(tkr.decode(out[1]))
```

---

## Text — Embeddings

```julia
using Transformers, Transformers.HuggingFace, LinearAlgebra

tkr   = HuggingFace.load_tokenizer("sentence-transformers/all-MiniLM-L6-v2")
model = HuggingFace.load_model(HuggingFace.BertModel, "sentence-transformers/all-MiniLM-L6-v2")

function embed(text)
    enc = tkr(text)
    out = model(enc.token, enc.segment, enc.attention_mask)
    vec(out.hidden_state[:, 1, :])   # CLS token
end

e1 = embed("Julia is fast")
e2 = embed("Julia has high performance")
similarity = dot(e1, e2) / (norm(e1) * norm(e2))
```

---

## Vision — Image Classification

```julia
using Transformers, Transformers.HuggingFace, Images

proc  = HuggingFace.load_processor("google/vit-base-patch16-224")
model = HuggingFace.load_model(HuggingFace.ViTForImageClassification, "google/vit-base-patch16-224")

img    = load("photo.jpg")           # loads as Float32 HWC array via Images.jl
inputs = proc(img)                   # resize + normalise to 224×224, returns pixel_values
out    = model(inputs.pixel_values)

pred_idx   = argmax(vec(out.logits))
pred_label = model.config.id2label[pred_idx]
println(pred_label)
```

---

## Audio — Speech Recognition

```julia
using Transformers, Transformers.HuggingFace, WAV

proc  = HuggingFace.load_processor("openai/whisper-large-v3")
model = HuggingFace.load_model(HuggingFace.WhisperForConditionalGeneration, "openai/whisper-large-v3")

wave, sr = wavread("speech.wav")     # load 16 kHz mono waveform
inputs   = proc(wave)                # log-mel spectrogram, returns input_features
out      = generate(model, inputs.input_features)
text     = proc.decode(out[1])
println(text)
```

---

## Multimodal — CLIP (Image–Text Similarity)

```julia
using Transformers, Transformers.HuggingFace, Images

proc  = HuggingFace.load_processor("openai/clip-vit-base-patch32")
model = HuggingFace.load_model(HuggingFace.CLIPModel, "openai/clip-vit-base-patch32")

img    = load("dog.jpg")
texts  = ["a dog", "a cat", "a car"]

img_inputs = proc(img)
txt_inputs = proc(texts)

out  = model(img_inputs.pixel_values, txt_inputs.input_ids, txt_inputs.attention_mask)
probs = softmax(vec(out.logits_per_image))   # probability per text label
best  = texts[argmax(probs)]
println("Best match: $best  ($(round(100*maximum(probs), digits=1))%)")
```

---

## Batching

Always batch inputs for throughput — individual calls have high per-call overhead.

```julia
# Text batching — pad to the same length
texts  = ["sentence one", "sentence two", "sentence three"]
encs   = tkr(texts; padding=true, truncation=true, max_length=128)
out    = model(encs.token, encs.segment, encs.attention_mask)
# out.hidden_state has shape (hidden_dim, seq_len, batch_size)
```

---

## Moving to GPU

```julia
using CUDA, Flux

model_gpu = model |> gpu
enc_gpu   = (token=enc.token |> gpu, segment=enc.segment |> gpu,
             attention_mask=enc.attention_mask |> gpu)
out_gpu   = model_gpu(enc_gpu.token, enc_gpu.segment, enc_gpu.attention_mask)
```

## See Also
- [Download & Load](download-load.md) · [Transformers.jl Reference](transformers-jl.md) · [ONNX.jl](onnx-jl.md)
