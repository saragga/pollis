# Package Guide

## ONNX.jl

ONNX.jl is the primary Julia interface for loading and running models in the **ONNX** (Open Neural Network Exchange) format. It parses the ONNX protobuf graph, implements the standard operator set, and presents the model as a callable Julia object.

### Installation

```julia
using Pkg
Pkg.add(["ONNX", "Flux"])
```

### Loading API

```julia
using ONNX

# Load an ONNX model from a file
model = ONNX.load("model.onnx")

# Load with a specific execution provider
model_cuda = ONNX.load("model.onnx"; providers=[:CUDA])   # GPU inference
model_cpu  = ONNX.load("model.onnx"; providers=[:CPU])    # CPU (default)
```

### Inspecting the Graph

```julia
# Input and output names
println(ONNX.input_names(model))    # e.g. ["input"]
println(ONNX.output_names(model))   # e.g. ["output", "probabilities"]

# Input shapes
for inp in model.graph.input
    dims = [d.dim_value for d in inp.type.tensor_type.shape.dim]
    println(inp.name, " → shape: ", dims)
end

# Operator count and types
ops = [node.op_type for node in model.graph.node]
println("Total operators: ", length(ops))
println("Unique op types: ", unique(ops))
```

### Running Inference

```julia
# Single input — name must match ONNX.input_names(model)[1]
out = model(input_tensor)

# Multiple named inputs
out = model(Dict("input_ids" => ids, "attention_mask" => mask))

# Access a specific named output
logits = out["logits"]
```

### Supported Operator Sets

ONNX.jl supports **opset ≤ 17**. The most common operators are fully supported:

| Category | Operators |
|---|---|
| Elementwise | Add, Sub, Mul, Div, Relu, Sigmoid, Tanh, Softmax, LayerNorm |
| Convolution | Conv, ConvTranspose, MaxPool, AveragePool, GlobalAveragePool |
| Recurrent | LSTM, GRU, RNN |
| Transformer | Attention, MultiHeadAttention, Gemm, MatMul |
| Reshape | Reshape, Transpose, Flatten, Squeeze, Unsqueeze, Gather |
| Normalisation | BatchNormalization, InstanceNormalization, LayerNormalization |

If a model uses custom or experimental ops (opset > 17), `ONNX.load` will raise an error listing the unsupported operators.

### Converting to a Flux Chain

ONNX.jl can translate supported graphs to native Flux models for further training:

```julia
using ONNX, Flux

chain = ONNX.load_flux("model.onnx")

# Inspect the Flux chain
println(chain)

# Fine-tune — standard Flux training loop
opt   = Flux.setup(Adam(1e-4), chain)
loss  = Flux.logitcrossentropy
Flux.train!(loss, chain, data_loader, opt)
```

### Saving a Modified Model

After fine-tuning a Flux chain converted from ONNX, export it back to ONNX:

```julia
ONNX.save("fine-tuned.onnx", chain, example_input)
```

---

## Flux.jl

Flux.jl is Julia's native deep-learning library. When using Kaggle models in Julia, Flux is most relevant for:

1. **GPU transfer** — moving ONNX models and tensors to the GPU
2. **Post-conversion training** — fine-tuning Flux chains produced by `ONNX.load_flux`
3. **Building hybrid pipelines** — combining ONNX feature extractors with Flux classifiers

### Key Functions for Kaggle Workflows

```julia
using Flux, CUDA

# Move a Flux chain to GPU
model_gpu = chain |> gpu

# Move arrays
x_gpu = CuArray(x_cpu)
x_cpu = Array(x_gpu)

# Parameter count
n_params = sum(length, Flux.params(chain))
println("Parameters: ", n_params)

# Freeze parameters (e.g. keep backbone fixed during fine-tuning)
Flux.freeze!(chain[1:end-1])   # freeze all but the last layer
```

### Standard Training Loop

```julia
using Flux, Statistics

loss_fn = Flux.logitcrossentropy
opt     = Flux.setup(Adam(1e-4), chain)

for epoch in 1:10
    total_loss = 0.0
    for (x, y) in data_loader
        grads = gradient(chain) do m
            Flux.logitcrossentropy(m(x), y)
        end
        Flux.update!(opt, chain, grads[1])
        total_loss += Flux.logitcrossentropy(chain(x), y)
    end
    println("Epoch $epoch  loss: ", round(total_loss / length(data_loader), digits=4))
end
```

---

## Choosing Between ONNX.jl and Transformers.jl

| Scenario | Package |
|---|---|
| Load a Kaggle ONNX model for inference | ONNX.jl |
| Load a Hugging Face model for inference | Transformers.jl |
| Fine-tune a pretrained model in Julia | Convert to Flux via `ONNX.load_flux`, then use Flux |
| Need tokenizer / processor support | Transformers.jl (or HuggingFaceHub.jl) |
| Model is not available in ONNX | Download from HF with Transformers.jl, export to ONNX in Python |
| Inspect raw ONNX graph topology | ONNX.jl |

## See Also
- [Flux.jl](flux-jl.md) · [ONNX.jl](onnx-jl.md) · [Choosing a Model](choosing-a-model.md)
