# ONNX.jl

ONNX.jl is Julia's native interface for the **Open Neural Network Exchange** format. It reads `.onnx` files, implements the standard operator set, and presents the model as a callable Julia function — no Python required at inference time.

## Installation

```julia
using Pkg
Pkg.add("ONNX")
```

## Loading a Model

```julia
using ONNX

model = ONNX.load("model.onnx")
```

An optional `providers` keyword selects the execution backend:

```julia
model_cpu  = ONNX.load("model.onnx"; providers=[:CPU])     # default
model_cuda = ONNX.load("model.onnx"; providers=[:CUDA])    # NVIDIA GPU
```

## Graph Inspection

```julia
# List named inputs and outputs
println(ONNX.input_names(model))    # ["input"]
println(ONNX.output_names(model))   # ["output", "probabilities"]

# Detailed input shapes
for inp in model.graph.input
    shape = [d.dim_value for d in inp.type.tensor_type.shape.dim]
    println(inp.name, " → ", shape)
end

# Operator inventory
ops = [node.op_type for node in model.graph.node]
println("Operators: ", sort(unique(ops)))
```

## Running Inference

```julia
# Single positional input (matches first input name)
out = model(input)

# Named inputs (required when the model has multiple inputs)
out = model(Dict(
    "input_ids"      => ids,
    "attention_mask" => mask,
))

# Extract a named output
logits = out["logits"]
probs  = out["probabilities"]
```

## Supported Operators

ONNX.jl targets **opset 17** (released with ONNX 1.13). Commonly supported operators:

```
Arithmetic      Add, Sub, Mul, Div, Pow, Abs, Neg, Sqrt, Exp, Log
Activation      Relu, LeakyRelu, Selu, Sigmoid, Tanh, Gelu, Softmax, LogSoftmax
Linear          Gemm, MatMul
Convolution     Conv, ConvTranspose
Pooling         MaxPool, AveragePool, GlobalAveragePool
Normalisation   BatchNormalization, InstanceNormalization, LayerNormalization
Recurrent       LSTM, GRU, RNN
Attention       Attention, MultiHeadAttention
Reshape         Reshape, Flatten, Transpose, Squeeze, Unsqueeze, Gather, Scatter
Concat          Concat, Split, Slice, Pad
Other           Cast, Shape, ConstantOfShape, Where, Einsum
```

Check which opset a model targets:

```julia
println("Model opset: ", model.opset_import[1].version)
```

If the model uses opset 18 or higher operators, ONNX.jl will raise an error. In that case, re-export the model with `opset_version=17` in Python:

```python
torch.onnx.export(model, example, "model.onnx", opset_version=17)
```

## Converting to a Flux Chain

`ONNX.load_flux` converts the ONNX graph to a native Flux `Chain`:

```julia
using ONNX, Flux

chain = ONNX.load_flux("model.onnx")

# Standard Flux chain — print, train, save as BSON
println(chain)
println("Parameters: ", sum(length, Flux.params(chain)))
```

Conversion succeeds for architectures composed of standard ops. Models with dynamic control flow (loops, conditionals) are not supported.

## Saving Back to ONNX

After modifying or fine-tuning a Flux chain, export it back to ONNX:

```julia
# example_input defines the input shape for graph tracing
ONNX.save("fine-tuned.onnx", chain, example_input)
```

## Intermediate Outputs

To extract activations from an intermediate node, re-run the model with the node name as an additional output:

```julia
out = ONNX.run(model, input; intermediate="layer4_output")
acts = out["layer4_output"]
```

## Common Errors and Fixes

| Error | Cause | Fix |
|---|---|---|
| `Unsupported op: ...` | Op not in ONNX.jl's implementation | Re-export with opset 17; use a simpler architecture |
| `Shape mismatch` | Input dimensions do not match graph declaration | Check `model.graph.input` for expected shape |
| `Key not found: "output"` | Wrong output name | Use `ONNX.output_names(model)` to find the correct name |
| `CUDA not functional` | No NVIDIA GPU or CUDA driver missing | Use `providers=[:CPU]` or install CUDA.jl |

## Full Example — EfficientNet-B0 on ImageNet

```julia
using ONNX, Images, ImageTransformations, Statistics

model = ONNX.load("efficientnet-b0.onnx")

const IMAGENET_MEAN = reshape(Float32[0.485, 0.456, 0.406], 3, 1, 1)
const IMAGENET_STD  = reshape(Float32[0.229, 0.224, 0.225], 3, 1, 1)

function preprocess(path::String)
    img   = load(path)
    img_r = imresize(img, 224, 224)
    arr   = Float32.(channelview(img_r))      # (3, H, W)
    arr   = (arr .- IMAGENET_MEAN) ./ IMAGENET_STD
    reshape(arr, 1, 3, 224, 224)              # add batch dimension
end

input  = preprocess("photo.jpg")
out    = model(input)
logits = vec(out["output"])
top5   = sortperm(logits, rev=true)[1:5]

println("Top-5 class indices: ", top5)
println("Top-5 scores:        ", round.(logits[top5], digits=3))
```

## See Also
- [Flux.jl](flux-jl.md) · [Package Guide](package-guide.md) · [Run Inference](run-inference.md)
