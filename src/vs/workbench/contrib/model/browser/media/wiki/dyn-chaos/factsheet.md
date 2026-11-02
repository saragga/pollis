# Factsheet

**Chaos Characterisation** measures chaos through Lyapunov exponents, correlation dimension and recurrence analysis, using the `DynamicalSystems.jl` family of packages.

## What the Panel Does

| Item | Detail |
|---|---|
| Purpose | Decide whether motion is chaotic, and describe it |
| Julia stack | `DynamicalSystems.jl`, `FractalDimensions`, `RecurrenceAnalysis`, `TimeseriesSurrogates`, with `GLMakie.jl` for figures |
| Tabs | **Lyapunov Exponents**, **Fractal Dimension**, **Recurrence (RQA)** |
| System in the code | Lorenz, σ = 10, ρ = 28, β = 8/3, from (1, 0, 0) |

## What the Inputs of the Panel Default To

| Input | Default | Used by |
|---|---|---|
| **Time series (x)** | `x` | **Recurrence (RQA)** and actions on measured series |
| **Integration time (T)** | 200 | Actions that run the Lorenz system |
| **Threshold (epsilon, fraction of sd)** | 0.1 | Recurrence matrix |

The variable named in **Time series (x)** must exist before running: the code does not create it.

## What the Generated Code Fixes

| Item | Value |
|---|---|
| Transient discarded | 100 time units |
| Orbit sampling | Every 0.01 time units |
| Scales for D2 | 20 values from 0.01 to 10, log-spaced |
| **Lyapunov Convergence** | 50 values of T from 10 to 500 |
| **Noise Sensitivity** | Noise 1% of each sd, steps 0 to 100 by 4 |
| **Predictability Horizon** | Error from 1e-6 up to 0.1 |
| **Embedding Dimension** | Delay from mutual information, dimension from Cao, up to 10 |
| **vs Linear Surrogate** | Dimension 3, 19 surrogates, steps 0 to 20 |
| **Chaos Classification** | Tolerance 0.01 for zero |

## What Each Next Step in the Panel Shows

| Action | Result |
|---|---|
| **Lyapunov Convergence** | Estimate against integration time |
| **Recurrence Plot** | Recurrence matrix as an image |
| **Correlation Dimension** | log C against log epsilon |
| **Stationarity Check** | DET of each half of the series |
| **Noise Sensitivity** | Exponent from equations, clean data and noisy data |
| **Predictability Horizon** | Lyapunov time and forecast horizon |
| **Embedding Dimension** | Delay and embedding dimension |
| **vs Linear Surrogate** | Data exponent against the surrogate range |
| **Lyapunov vs Fractal Dim** | Kaplan-Yorke dimension and D2 |
| **Chaos Classification** | Chaotic, quasiperiodic, periodic or fixed point |
| **RQA Summary** | RR, DET, LAM, L, TT |

## See Also

- [Overview](overview.md) · [Lyapunov Exponents](lyapunov.md) · [Fractal Dimension](fractal-dim.md) · [Recurrence Analysis](rqa.md)
