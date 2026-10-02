# Flux.jl

Flux.jl is Julia's primary deep-learning library. It provides the layer primitives, training loop, and GPU integration used when fine-tuning or building models around Kaggle weights loaded via ONNX.jl.

## Installation

```julia
using Pkg
Pkg.add(["Flux", "CUDA"])   # CUDA is optional — only needed for GPU
```

## Core Concepts

Flux models are **Julia structs with callable syntax**. A `Chain` applies layers in sequence:

```julia
using Flux

model = Chain(
    Dense(784, 256, relu),
    Dense(256, 128, relu),
    Dense(128, 10),
)

x   = rand(Float32, 784, 32)   # (features, batch_size)
out = model(x)                  # shape: (10, 32)
```

## Layers Reference

| Layer | Usage |
|---|---|
| `Dense(in, out, act)` | Fully connected layer with activation |
| `Conv((kh,kw), in=>out, act)` | 2D convolution |
| `MaxPool((kh,kw))` | Max pooling |
| `BatchNorm(features)` | Batch normalisation |
| `LayerNorm(features)` | Layer normalisation |
| `LSTM(in, hidden)` | Long short-term memory cell |
| `GRU(in, hidden)` | Gated recurrent unit |
| `MultiHeadAttention(heads, dim)` | Transformer attention |
| `Dropout(p)` | Dropout with probability `p` |
| `Embedding(vocab, dim)` | Token embedding table |

## Activations

```julia
relu(x)       # max(0, x) — default for hidden layers
sigmoid(x)    # 1 / (1 + exp(-x)) — binary output
tanh(x)       # standard tanh
gelu(x)       # Gaussian error linear unit — used in Transformers
softmax(x)    # normalised probabilities (apply over last dim)
```

## Loss Functions

```julia
Flux.mse(ŷ, y)                          # mean squared error (regression)
Flux.crossentropy(softmax(ŷ), y)        # cross-entropy (classification)
Flux.logitcrossentropy(ŷ, y)            # numerically stable version
Flux.binarycrossentropy(sigmoid(ŷ), y)  # binary classification
```

## Optimisers

```julia
opt = Flux.setup(Adam(1e-3), model)            # Adam (default choice)
opt = Flux.setup(AdamW(1e-3, (0.9,0.999), 0.01), model)  # with weight decay
opt = Flux.setup(SGD(0.01; momentum=0.9), model)
```

## Training Loop

```julia
using Flux

opt = Flux.setup(Adam(1e-3), model)

for epoch in 1:num_epochs
    for (x, y) in data_loader
        grads = gradient(model) do m
            Flux.logitcrossentropy(m(x), y)
        end
        Flux.update!(opt, model, grads[1])
    end
end
```

## GPU Support

```julia
using Flux, CUDA

# Move model and data to GPU
model_gpu = model |> gpu
x_gpu     = x |> gpu

out = model_gpu(x_gpu)
y_hat = Array(out)   # bring back to CPU

# Check GPU availability
println(CUDA.functional() ? "GPU available: $(CUDA.name(CUDA.device()))" : "CPU only")
```

## Saving and Loading Models

```julia
using BSON

# Save
BSON.@save "model.bson" model

# Load
BSON.@load "model.bson" model
```

For interoperability with ONNX-based workflows, use `ONNX.save` to export a Flux chain back to ONNX format:

```julia
using ONNX
ONNX.save("model.onnx", model, example_input)
```

## Combining ONNX Backbone with Flux Head

A common pattern for Kaggle workflows: use an ONNX backbone for feature extraction and attach a trainable Flux head for a downstream task.

```julia
using ONNX, Flux

# Load pretrained backbone
backbone = ONNX.load_flux("efficientnet-b0.onnx")

# Remove the classification head (last layer)
feature_extractor = backbone[1:end-1]
Flux.freeze!(feature_extractor)   # keep backbone weights fixed

# Add a new head for your task (e.g. 5-class classification)
classifier = Chain(
    feature_extractor,
    Dense(1280, 256, relu),
    Dropout(0.3),
    Dense(256, 5),
)

# Train only the new head
opt = Flux.setup(Adam(1e-3), classifier)
```

## See Also
- [ONNXRunTime.jl](onnxruntime-jl.md) · [Package Guide](package-guide.md) · [Run Inference](run-inference.md)
