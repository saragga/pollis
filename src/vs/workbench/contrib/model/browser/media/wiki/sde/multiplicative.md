# Multiplicative

Multiplicative noise means a diffusion coefficient that depends on the state, so the size of each shock depends on where the process stands. Calculus and solver now matter, and the tab fixes the first by using Itô solvers throughout.

## What the Multiplicative Noise Tab Computes

The **Multiplicative Noise** tab solves the Itô equation dX = f(X,t) dt + g(X,t) dW, where **Diffusion g(X,t)** is any Julia expression in X, with `0.2*X` as the default. The name covers more than proportional noise: `0.2*sqrt(X)` or `0.1*X^2` are accepted too, and a constant turns the tab into an additive model with a different solver menu. In the Itô sense, g is read at the start of each step, so it is unaffected by the shock that follows.

## What Geometric Brownian Motion Gives in Closed Form

With f = a X and g = b X, the equation is the one behind [Black and Scholes (1973)](#ref-BS1973a).

- Solution: X(t) = X0 exp((a - b^2/2) t + b W(t))
- Mean: E[X(t)] = X0 exp(a t)
- Variance: Var[X(t)] = X0^2 exp(2 a t) (exp(b^2 t) - 1)
- Median: X0 exp((a - b^2/2) t)

**Mean and Variance** overlays the mean and the variance, and **Strong Convergence** uses the exact solution on a fixed test problem. For a drift or diffusion of another form the panel still draws the overlay, and that curve does not apply.

## How the Multiplicative Noise Solvers Differ

| Solver | One step | Strong order |
|---|---|---|
| EM | X + f dt + g dW | 1/2 |
| LambaEM | EM with step control | 1/2 |
| RKMil | EM + 0.5 g g' (dW^2 - dt), g g' by finite difference | 1 |
| SRIW1 | Stochastic Runge-Kutta with an embedded error estimate | 3/2 |

The Milstein term comes from [Mil'shtejn (1975)](#ref-Mil1975a), and SRIW1 from [Rößler (2010)](#ref-Ros2010a). RKMil and SRIW1 accept only scalar or diagonal noise. RKMil is adaptive in StochasticDiffEq.jl, although its label says fixed step, and its **Step size dt** is only a first step.

## How Adaptive Stepping Keeps a Brownian Path Consistent

When an adaptive solver rejects a step, it cannot simply draw again, since that would bias the noise toward draws that were easy to accept. StochasticDiffEq.jl stores the rejected information and fills in a Brownian bridge, the rejection sampling with memory of [Rackauckas and Nie (2017)](#ref-RN2017b). Error control then helps with the large swings of multiplicative noise, as steps shrink where g changes fast. The panel runs at the default tolerances of 0.01. For statistics that need care, pass tighter `abstol` and `reltol` to `solve`.

## Where the Multiplicative Noise Tab Misleads

Proportional noise brings heavy right tails, and sample moments over long horizons then rest on a handful of paths. An exact solution of geometric Brownian motion stays positive, while a discrete step may not, and expressions such as `sqrt(X)` then fail. Non-Lipschitz forms such as `X^2` can blow up, and step shrinkage may end the run with a warning about `dt`. The **Stationary Distribution** chart is drawn for any g, with no reference curve here, and a proportional g has no proper stationary law.

## What to Compare the Multiplicative Noise Tab With

Compare with **Stratonovich** on the same f and g to see the effect of the extra drift, 0.5 g dg/dX. Compare SRIW1 with EM at a small fixed step to judge discretisation error, using ensemble statistics and not single paths. For proportional shocks with sudden moves, the **Gaussian Jumps** tab of the Jump-Diffusion Processes panel adds log-normal jumps to the same structure.

## References

<a id="ref-BS1973a"></a>Black, F. and Scholes, M. (1973). The pricing of options and corporate liabilities. *Journal of Political Economy* 81(3), 637–654. [doi:10.1086/260062](https://doi.org/10.1086/260062)

<a id="ref-Mil1975a"></a>Mil'shtejn, G. N. (1975). Approximate integration of stochastic differential equations. *Theory of Probability & Its Applications* 19(3), 557–562. [doi:10.1137/1119062](https://doi.org/10.1137/1119062)

<a id="ref-RN2017b"></a>Rackauckas, C. and Nie, Q. (2017). Adaptive methods for stochastic differential equations via natural embeddings and rejection sampling with memory. *Discrete and Continuous Dynamical Systems - B* 22(7), 2731–2761. [doi:10.3934/dcdsb.2017133](https://doi.org/10.3934/dcdsb.2017133)

<a id="ref-Ros2010a"></a>Rößler, A. (2010). Runge–Kutta methods for the strong approximation of solutions of stochastic differential equations. *SIAM Journal on Numerical Analysis* 48(3), 922–952. [doi:10.1137/09076636X](https://doi.org/10.1137/09076636X)

## See Also

- [Factsheet](factsheet.md) · [Additive](additive.md) · [Stratonovich](stratonovich.md) · [Interpretation](interpretation.md)
