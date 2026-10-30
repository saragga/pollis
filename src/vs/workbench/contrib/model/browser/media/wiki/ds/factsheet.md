# Direct Search Methods — Factsheet

A **direct search method** minimises f(x) using **function values only**: no gradients, exact or approximate. It compares the values at a set of trial points, a simplex or a poll around the current best point, and moves or shrinks according to which is lowest.

| | |
|---|---|
| **Purpose** | Minimise black-box, non-smooth, noisy or simulation-based objectives, where gradients are unavailable or unreliable |
| **Input** | A Julia expression for f(x), the initial guess x0, the iteration budget, and the initial step for Pattern Search and GSS |
| **Core packages** | [Optim.jl](https://github.com/JuliaNLSolvers/Optim.jl), [DirectSearch.jl](https://github.com/ImperialCollegeLondon/DirectSearch.jl) |
| **Models** | Nelder-Mead, Pattern Search, MADS, GSS |
| **Output** | The minimiser, the minimum, the number of evaluations and the record of every evaluated point |
| **Key choice** | Speed without guarantees (Nelder-Mead) or a convergence theory (pattern search, GSS, MADS) |

## When to Use

- **Black-box objectives**: the output of a simulation, an external program or an experiment, with no derivative.
- **Non-smooth objectives**: absolute values, maxima, piecewise functions, like the default f = |x1 - 1| + 2|x2 + 0.5| + 0.1 (x1^2 + x2^2), whose minimum at (1, -0.5) sits on a kink.
- **Noisy evaluations**, where finite-difference gradients are dominated by the noise.

## What It Is Not

Not efficient on smooth problems where gradients are available: BFGS with automatic differentiation is far cheaper, as **vs Gradient-Based** shows. Not suited to many variables: the number of evaluations grows quickly beyond ten to twenty. Not global: every method here finds a local minimum.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
