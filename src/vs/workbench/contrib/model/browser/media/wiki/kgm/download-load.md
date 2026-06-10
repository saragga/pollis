# Download & Load

## Step 1 — Install the Kaggle CLI

The Kaggle CLI is required to download model files. Install it once:

```bash
pip install kaggle
```

Then place your API credentials at `~/.kaggle/kaggle.json`:

```json
{"username": "your-kaggle-username", "key": "your-api-key"}
```

Get your key at **kaggle.com → Account → API → Create New Token**.

For public models, authentication is optional — the CLI will prompt you if a model requires it.

## Step 2 — Find the Model Reference

Browse models at [kaggle.com/models](https://www.kaggle.com/models) or search from the terminal:

```bash
# Search by name
kaggle models list --search "gemma"

# List all variants of a specific model
kaggle models instances list --model google/gemma
```

A full reference looks like:
```
google/gemma/transformers/2b-it/3
└─ owner / model / framework / variant / version
```

## Step 3 — Download the Weights

```bash
# Download a specific version to the current directory
kaggle models instances versions download google/gemma/transformers/2b-it/3

# Download to a specific folder
kaggle models instances versions download google/gemma/transformers/2b-it/3 \
    --path ./models/gemma
```

For ONNX models, look for the `onnx` framework tag:

```bash
kaggle models instances list --model google/efficientnet | grep onnx
kaggle models instances versions download google/efficientnet/onnx/b0/1 --path ./models/efficientnet
```

## Step 4 — Load with ONNX.jl

```julia
using ONNX

# Load an ONNX model from a local .onnx file
model = ONNX.load("models/efficientnet/efficientnet-b0.onnx")

# Inspect inputs and outputs
println("Inputs:  ", ONNX.input_names(model))
println("Outputs: ", ONNX.output_names(model))
println("Nodes:   ", length(model.graph.node), " operators")
```

## Running the Forward Pass

Inputs must match the shapes declared in the ONNX graph. Retrieve them with:

```julia
# Print each input name and expected shape
for inp in model.graph.input
    println(inp.name, "  shape: ", [d.dim_value for d in inp.type.tensor_type.shape.dim])
end
```

Then run inference:

```julia
# Vision model — expects Float32 NCHW tensor
input = rand(Float32, 1, 3, 224, 224)   # (batch, channels, height, width)
out   = model(input)
logits = out["output"]                   # name from ONNX.output_names
```

## Converting to a Flux Chain (Optional)

ONNX.jl can convert supported ONNX graphs to native Flux chains for further training:

```julia
using ONNX, Flux

chain = ONNX.load_flux("model.onnx")

# The chain is a standard Flux model — you can fine-tune it
opt   = Flux.setup(Adam(1e-4), chain)
```

> **Note:** Conversion to Flux works for common operator patterns (Conv → BatchNorm → ReLU, Dense, LSTM). Complex custom ops may not be supported — check `ONNX.supported_ops()`.

## Non-ONNX Models: Offline Conversion

If only PyTorch or Keras weights are available, convert them to ONNX offline using Python before loading in Julia:

```python
# Python — run once to export
import torch
model = torch.load("model.pt")
torch.onnx.export(
    model,
    torch.randn(1, 3, 224, 224),   # example input
    "model.onnx",
    opset_version=17,
    input_names=["input"],
    output_names=["output"],
    dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}},
)
```

Then load normally in Julia:

```julia
model = ONNX.load("model.onnx")
```

## Working Offline

Once downloaded, Kaggle models require no network connection. Simply keep the `.onnx` file and load it directly:

```julia
# No network calls — fully offline
model = ONNX.load("/data/models/efficientnet-b0.onnx")
out   = model(input)
```