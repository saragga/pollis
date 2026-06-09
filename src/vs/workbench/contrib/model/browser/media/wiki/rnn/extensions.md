# RNN Extensions: RecurrentLayers.jl

## What It Is

[RecurrentLayers.jl](https://github.com/MartinuzziFrancesco/RecurrentLayers.jl) is a Julia package that extends Flux.jl's recurrent layer offerings with 35+ additional implementations not available in base deep learning libraries. All layers follow the standard Flux interface and integrate directly into `Flux.Chain` with no additional plumbing.

```julia
using Flux, RecurrentLayers
```

---

## When to Go Beyond Flux's Built-in Layers

Flux ships `RNN`, `LSTM`, and `GRU` — the three layers that cover the majority of practical sequence modelling tasks. Reach for RecurrentLayers.jl when:

- The standard layers plateau and you suspect architectural changes (not just more data or tuning) would help.
- You are reproducing a specific paper that uses a non-standard cell.
- You need explicit memory efficiency for very long sequences.
- You want to ablate gating mechanisms to understand what drives performance.

---

## Available Layer Families

### Minimal Gating Units

Lightweight alternatives to GRU that reduce parameter count by simplifying or removing gates.

| Layer | Description |
|:---|:---|
| `MGU` | Minimal Gated Unit — one forget gate, no reset gate. Half the parameters of GRU. |
| `LiGRU` | Light GRU — replaces tanh with ReLU, removes the reset gate entirely. Fast and competitive on speech benchmarks. |
| `JANET` | Just Another NETwork — removes the input gate from LSTM, keeping only forget and output gates. |

**Use when:** you need a fast baseline for resource-constrained environments or when GRU over-fits on a small dataset.

---

### Independently Recurrent Neural Networks

| Layer | Description |
|:---|:---|
| `IndRNN` | Each neuron's recurrent connection is scalar (diagonal weight matrix). Can be stacked hundreds of layers deep without vanishing/exploding gradients. |

**Use when:** you need very deep RNN stacks (> 10 layers) or very long sequences where gradient flow through standard LSTM cells is problematic.

---

### Coupled and Coevolutionary Units

| Layer | Description |
|:---|:---|
| `coRNN` | Coupled Oscillatory RNN — second-order dynamics modelled as damped harmonic oscillators. Strong long-range memory, stable training. |
| `UnICORNN` | Undamped Independent Controlled Oscillatory RNN — adds frequency control per neuron for finer temporal resolution. |

**Use when:** the data has oscillatory or quasi-periodic structure — interest rate cycles, seasonal macroeconomic series, intraday volume patterns.

---

### Antisymmetric and Stable Architectures

| Layer | Description |
|:---|:---|
| `AntisymmetricRNN` | Recurrent weight matrix constrained to be antisymmetric (W = −Wᵀ). Guarantees stable hidden dynamics (no exploding gradients by construction). |
| `CTRNN` | Continuous-Time RNN — models the hidden state as an ODE with learnable time constants. |

**Use when:** training is unstable even with gradient clipping, or you want provably bounded hidden states.

---

### Attention-Enhanced Cells

| Layer | Description |
|:---|:---|
| `ATRNNCell` | Attention-based TRNN — integrates an attention mechanism directly into the recurrent cell, allowing the cell to weight its own history. |

---

### Sequence-to-Sequence Utilities

RecurrentLayers.jl also provides helper constructors for stacked and bidirectional configurations that wrap any of the above cells, consistent with how `Flux.RNN` behaves.

---

## Example: Swapping GRU for LiGRU

The webview template generates a standard Flux GRU. To upgrade to LiGRU, change only the cell constructor:

```julia
# Standard GRU (Flux.jl)
model = Chain(
    GRU(input_size => hidden_size),
    Dense(hidden_size => output_size)
)

# Upgrade to LiGRU (RecurrentLayers.jl) — same interface
using RecurrentLayers
model = Chain(
    LiGRU(input_size => hidden_size),
    Dense(hidden_size => output_size)
)
```

All other training code (`Flux.setup`, `Flux.train!`, loss functions) is unchanged.

---

## Example: IndRNN for Deep Stacks

```julia
using Flux, RecurrentLayers

model = Chain(
    IndRNN(input_size => hidden_size),
    IndRNN(hidden_size => hidden_size),   # layer 2
    IndRNN(hidden_size => hidden_size),   # layer 3 — gradient-stable by construction
    Dense(hidden_size => output_size)
)
```

---

## Decision Guide

| Situation | Suggested Layer |
|:---|:---|
| Need fewer parameters than GRU | `MGU` or `LiGRU` |
| Very deep stack (> 6 layers) | `IndRNN` |
| Oscillatory / periodic data | `coRNN` or `UnICORNN` |
| Unstable training despite clipping | `AntisymmetricRNN` |
| Continuous-time dynamics | `CTRNN` |
| Reproducing a specific paper cell | Match by name in the package docs |
| None of the above apply | Stick with Flux's `LSTM` or `GRU` |

Always start with the standard Flux cells. Swap in a RecurrentLayers cell only after establishing a working baseline and identifying a specific bottleneck the alternative architecture addresses.
