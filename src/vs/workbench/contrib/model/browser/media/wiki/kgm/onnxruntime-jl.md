# ONNXRunTime.jl

ONNXRunTime.jl provides Julia bindings for Microsoft's **ONNX Runtime**, the reference engine for the **Open Neural Network Exchange** format. It loads an `.onnx` file into an inference session that you call like a function. ONNX Runtime ships as a prebuilt binary, so Python is not needed at inference time and every standard operator set is supported.

This is the package the panel uses for all four model types (vision, NLP, audio and multimodal).

## Installation

```julia
using Pkg
Pkg.add("ONNXRunTime")
```

The panel code imports it under a short alias:

```julia
import ONNXRunTime as ORT
```

## Loading a Model

```julia
model = ORT.load_inference("model.onnx")   # CPU session
```

`load_inference` takes these keywords:

| Keyword | Default | Meaning |
|---|---|---|
| `execution_provider` | `:cpu` | `:cpu` or `:cuda` |
| `provider_options` | `(;)` | Named tuple of options for the CUDA provider |
| `logging_level` | `:warning` | `:verbose`, `:info`, `:warning`, `:error` or `:fatal` |
| `envname` | `"defaultenv"` | Name used in log messages |

`logging_level` and `envname` can only be set once per Julia session: ONNX Runtime creates its environment on the first load.

## Inspecting Inputs and Outputs

```julia
ORT.input_names(model)    # e.g. ["input_ids", "attention_mask"]
ORT.output_names(model)   # e.g. ["logits"]
```

Printing the session (`model` at the REPL) shows the same names plus the execution provider. Input shapes and element types are not exposed by the high-level API; check the model card, or open the file in a viewer such as Netron.

## Running Inference

Call the session with a `Dict` (or a `NamedTuple`) that maps **every** input name to an array:

```julia
x   = rand(Float32, 1, 3, 224, 224)              # (batch, C, H, W)
out = model(Dict(ORT.input_names(model)[1] => x))
logits = out["output"]                           # outputs come back by name
```

- **Every input must be fed.** A session with `input_ids` and `attention_mask` needs both; an unknown name raises an `ArgumentError` that lists the expected ones.
- **Shapes are in ONNX order.** Write the dimensions as the model card gives them, e.g. `(1, 3, 224, 224)` for an image batch. ONNXRunTime.jl converts Julia's column-major layout to ONNX's row-major layout for you, in both directions.
- **Element types must match.** Images are usually `Float32`; token ids and attention masks are usually `Int64`.
- **The result is an ordered dictionary** with one entry per output, in the order of `output_names`. `first(values(out))` takes the first output.

To compute only some outputs, pass their names as a second argument:

```julia
out = model(Dict("input_ids" => ids, "attention_mask" => mask), ["logits"])
```

Inputs given as a `NamedTuple` return a `NamedTuple`:

```julia
out = model((; input = x))
out.output
```

## Models Split into Several Files

Encoder-decoder models such as Whisper are exported as separate graphs. Load one session per file and pass the encoder output into the decoder:

```julia
encoder = ORT.load_inference("encoder_model.onnx")
decoder = ORT.load_inference("decoder_model.onnx")

hidden = first(values(encoder(Dict("input_features" => features))))
logits = first(values(decoder(Dict("input_ids" => ids, "encoder_hidden_states" => hidden))))
```

The panel's Audio model runs this loop greedily, one token at a time.

## GPU Inference

The CUDA provider needs CUDA.jl and cuDNN.jl, and a CUDA 12 runtime (12.8 or later):

```julia
using Pkg
Pkg.add(["CUDA", "cuDNN"])

import CUDA
CUDA.set_runtime_version!(v"12.8")   # once; takes effect after a restart
```

Then:

```julia
import CUDA, cuDNN
import ONNXRunTime as ORT

model_gpu = ORT.load_inference("model.onnx"; execution_provider = :cuda)
model_gpu = ORT.load_inference("model.onnx"; execution_provider = :cuda,
                               provider_options = (; cudnn_conv_algo_search = :HEURISTIC))
```

Inputs and outputs stay ordinary Julia arrays; the copies to and from the GPU happen inside ONNX Runtime.

## Releasing Memory

A session's memory is freed when the garbage collector removes it. To free it at once, which matters for GPU memory, call:

```julia
ORT.release(model)   # the session can no longer be used
```

## Common Errors and Fixes

| Error | Cause | Fix |
|---|---|---|
| `Invalid input name` | A key that is not in `input_names(model)` | Use the names that `ORT.input_names(model)` prints |
| `KeyError` for an input | One of the model's inputs was not fed | Feed every name in `ORT.input_names(model)` |
| `Invalid output name` | A requested output that does not exist | Use the names that `ORT.output_names(model)` prints |
| Shape or type error from ONNX Runtime | Dimensions or element type differ from the graph | Check the model card; use ONNX order and the right `Float32` or `Int64` type |
| `requires the CUDA.jl and cuDNN.jl packages` | GPU session without the CUDA packages loaded | Add `import CUDA, cuDNN` before `load_inference` |
| CUDA runtime version error | CUDA runtime outside 12.8 to 12.x | `CUDA.set_runtime_version!(v"12.8")`, then restart Julia |

## Full Example: ResNet-18 on ImageNet

```julia
import ONNXRunTime as ORT
using Images

model  = ORT.load_inference("resnet18.onnx")
inname = ORT.input_names(model)[1]

function preprocess(file)   # image -> (1, 3, 224, 224) Float32
    x = Float32.(channelview(RGB.(imresize(load(file), (224, 224)))))   # (C, H, W) in [0, 1]
    x = (x .- Float32[0.485, 0.456, 0.406]) ./ Float32[0.229, 0.224, 0.225]
    reshape(x, 1, size(x)...)
end

logits = vec(first(values(model(Dict(inname => preprocess("photo.jpg"))))))
top5   = sortperm(logits, rev = true)[1:5]
println("Top-5 class indices (1-based): ", top5)
```

## ONNXRunTime.jl and ONNX.jl

ONNX.jl is a different package: it reimplements ONNX operators in pure Julia and can turn some graphs into Julia code. It covers fewer operators, so many exported models fail to load. Use ONNXRunTime.jl to run models, as this panel does. Use ONNX.jl only if you need the graph as Julia code, for example to differentiate through it.

## See Also
- [Flux.jl](flux-jl.md) · [Package Guide](package-guide.md) · [Run Inference](run-inference.md)
