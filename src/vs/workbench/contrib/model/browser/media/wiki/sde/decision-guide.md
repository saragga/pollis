# Decision Guide

Two modelling questions decide the tab: does the size of the noise depend on the state, and if so, how does the noise arise. The solver follows from the statistic you want and the time you can spend.

## Which Diffusion Tab Fits a Problem

| Situation | Tab | Why |
|---|---|---|
| Outside forcing or measurement-like shocks of fixed size | **Additive Noise** | **Noise sigma** is unrelated to X, and solvers for additive noise are available |
| Mean-reverting level, as in the Ornstein-Uhlenbeck model | **Additive Noise** | Linear drift gives Gaussian paths and a stationary law to compare with |
| Proportional shocks, as in prices or populations | **Multiplicative Noise** | **Diffusion g(X,t)** scales with X, and the Itô form does not look ahead |
| Physical model where fast smooth noise is idealised as white | **Stratonovich** | The smooth-noise limit gives the Stratonovich form |

## When to Prefer Itô or Stratonovich for a Diffusion

Choose Itô when the noise at each instant is unknown until that instant passes, as with finance and many population models, because g is then read before the shock. Choose Stratonovich when the equation stands in for a system driven by a fast but smooth signal, as is common in physics and engineering, and when ordinary chain-rule manipulation of the model is wanted. A model stated in one form can be run in the other after moving 0.5 g dg/dX into the drift. For constant g no decision is needed.

## How to Pick a Diffusion Solver for the Statistic You Want

| Goal | Solver | Why |
|---|---|---|
| A simple reference, or a check on another solver | EM | Fixed step and easy to reason about |
| Accurate paths with state-dependent g | SRIW1 | Strong order 3/2 with error control |
| Accurate runs with additive noise | SOSRA2 or SRA1 | Strong order 3/2 for this noise class |
| Unsure of g, and step control wanted | LambaEM | Adaptive and with no restriction on the noise form |
| Stratonovich paths | LambaEulerHeun or EulerHeun | Both read g across the step |

RKMilCommute in the **Stratonovich** tab solves Itô as the panel calls it, so it does not serve this tab's purpose.

## How to Set Step Size and Tolerance for a Diffusion

For a fixed step, start with **Step size dt** well under the fastest time scale of the drift, and halve it until the statistic of interest stops moving beyond Monte Carlo error. Adaptive solvers ignore a fixed grid, with their accuracy set by `abstol` and `reltol`, so edit the `solve` line to tighten those from the default of 0.01. Cost rises with paths and steps together, and Monte Carlo error falls only with the square root of the number of paths, so there is little point in a step far finer than sampling noise can reveal.

## When a Pure Diffusion Is the Wrong Model

A diffusion suits smooth accumulation of many small shocks. Sudden moves that a continuous path cannot produce on a short horizon call for the Jump-Diffusion Processes panel. The panel also cannot express correlated noises without editing the code, as its problem is built with diagonal noise. It estimates nothing, so parameters fitted to observed series must come from elsewhere, and a model chosen here has not been tested against any data.

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Diagnostics](diagnostics.md)
