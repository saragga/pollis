# Run Inference

## The Universal Pattern

Regardless of modality, ONNX inference follows three stages: **preprocess** the raw input → **forward pass** through the ONNX model → **post-process** the output (argmax / softmax / decode).

```julia
model  = ONNX.load("model.onnx")   # load once at startup
input  = preprocess(raw_data)       # task-specific
output = model(input)               # forward pass
result = postprocess(output)        # task-specific
```

---

## NLP — Text Generation

```julia
using ONNX

# Load a Gemma ONNX model downloaded from Kaggle
model = ONNX.load("gemma-2b-it.onnx")

# Tokenise the prompt (requires a matching tokenizer, e.g. via HuggingFaceHub.jl)
ids  = Int32.(tokenize("Summarise this paragraph:"))
out  = model(reshape(ids, 1, :))        # (1, seq_len) batch × sequence
text = decode(out["logits"])            # decode token ids to string
println(text)
```

---

## Vision — Image Classification

```julia
using ONNX, Images, ImageTransformations

model = ONNX.load("efficientnet-b0.onnx")

# Preprocess: resize to 224×224, convert to Float32 NCHW
function preprocess_image(path::String)
    img   = load(path)
    img_r = imresize(img, 224, 224)
    arr   = Float32.(channelview(img_r))   # (3, 224, 224)
    # ImageNet normalisation
    mean  = reshape(Float32[0.485, 0.456, 0.406], 3, 1, 1)
    std   = reshape(Float32[0.229, 0.224, 0.225], 3, 1, 1)
    reshape((arr .- mean) ./ std, 1, 3, 224, 224)   # add batch dim
end

input  = preprocess_image("photo.jpg")
out    = model(input)
logits = vec(out["output"])             # shape: (1000,)
pred   = argmax(logits)                 # ImageNet class index
println("Predicted class index: ", pred)
```

---

## Audio — Speech Recognition (Whisper)

```julia
using ONNX, WAV, DSP

model = ONNX.load("whisper-small.onnx")

# Load 16 kHz mono waveform
wave, sr = wavread("speech.wav")
wave     = Float32.(vec(wave))

# Log-mel spectrogram (80 mel bins, 3000 frames for 30 s)
feats = log_mel_spectrogram(wave; n_mels=80, n_frames=3000)   # (80, 3000)
feats = reshape(feats, 1, 80, 3000)    # add batch dim

out  = model(feats)
text = decode_tokens(out["token_ids"])
println("Transcript: ", text)
```

---

## Multimodal — Image–Text Similarity (CLIP)

```julia
using ONNX, Images

# Kaggle hosts CLIP as separate encoder files
img_enc = ONNX.load("clip-vit-b32-visual.onnx")
txt_enc = ONNX.load("clip-vit-b32-textual.onnx")

img_feat = img_enc(preprocess_image("dog.jpg"))["image_features"]   # (1, 512)
txt_feat = txt_enc(tokenize_clip("a dog"))["text_features"]         # (1, 512)

# Cosine similarity
using LinearAlgebra
sim = dot(vec(img_feat), vec(txt_feat)) / (norm(vec(img_feat)) * norm(vec(txt_feat)))
println("Image–text similarity: ", round(sim, digits=4))
```

---

## Tabular — Classification

```julia
using ONNX, CSV, Tables

model = ONNX.load("xgboost-classifier.onnx")

tbl  = CSV.File("data.csv")
X    = Float32.(Tables.matrix(tbl)[:, 1:end-1])   # (n_samples, n_features)
out  = model(transpose(X))                         # ONNX expects (n_features, n_samples)

probs = out["probabilities"]               # (n_classes, n_samples)
preds = vec(argmax(probs, dims=1))        # predicted class per sample
println("Predictions: ", preds[1:5])
```

---

## Reinforcement Learning — Policy Rollout

```julia
using ONNX

policy = ONNX.load("ppo-cartpole.onnx")

# CartPole observation: [cart_pos, cart_vel, pole_angle, pole_vel]
obs = Float32[0.02, -0.01, 0.03, -0.02]
obs_t = reshape(obs, 1, :)              # (1, 4) batch × obs_dim

out    = policy(obs_t)
probs  = vec(out["action_probs"])       # probability over discrete actions
action = argmax(probs) - 1              # 0 = push left, 1 = push right
println("Action: ", action, "  probs: ", round.(probs, digits=3))
```

---

## Batching for Throughput

```julia
# Load images into a single NCHW batch
images = [preprocess_image(p) for p in image_paths]
batch  = cat(images...; dims=1)          # (N, 3, 224, 224)

out    = model(batch)                    # single forward pass for all N
preds  = vec(argmax(out["output"], dims=1))
```

---

## GPU Acceleration

ONNX.jl integrates with CUDA.jl via `ONNX.ExecutionProvider`:

```julia
using ONNX, CUDA

# Load with CUDA execution provider for GPU inference
model_gpu = ONNX.load("efficientnet-b0.onnx"; providers=[:CUDA])

input_gpu = CuArray(preprocess_image("photo.jpg"))
out_gpu   = model_gpu(input_gpu)
logits    = Array(out_gpu["output"])     # bring results back to CPU
```

## See Also
- [Download & Load](download-load.md) · [Flux.jl](flux-jl.md) · [ONNXRunTime.jl](onnxruntime-jl.md)
