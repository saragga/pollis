# Overview

Evolution strategies search a continuous space by sampling a population of candidates, keeping the good ones, and shifting the search towards them. They need only function values, and so they suit rugged and black-box objectives.

## How an Evolution Strategy Works

Each generation repeats the same loop:

1. Draw λ candidates around the current centre.
2. Evaluate them, and rank them by f.
3. Move the centre towards the best μ.
4. Adjust the size and shape of the sampling distribution.

Only the ranking is used, so that gradients are not needed and any increasing transformation of f leaves the search unchanged. [Beyer and Schwefel (2002)](#ref-BS2002a) give a thorough introduction to the family. The trade-off is cost: many evaluations are spent to learn what a gradient would give directly.

## How the Six Tabs Differ

| Tab | What it adapts | Package |
|---|---|---|
| **CMA-ES** | Full covariance and step size | `Evolutionary.jl` |
| **xNES** | Full covariance, by natural gradient | `BlackBoxOptim.jl` |
| **dxNES** | Same, with distance-weighted learning rates | `BlackBoxOptim.jl` |
| **GCMAES** | Covariance and step size, plus a gradient step | `GCMAES.jl` |
| **ISRES** | Mutation step sizes, with constraint handling | `NLopt.jl` |
| **ESCH** | Nothing, using heavy-tailed mutation | `NLopt.jl` |

## Which Problem the Panel Solves by Default

The default **Objective f(x)** is the Rastrigin function in **Dimension (n)** = 5 variables, over a box from −5.12 to 5.12 per variable:

- f(x) = 10 n + Σ (x² − 10 cos(2π x))

The global minimum is 0 at the origin. A grid of local minima lies near the integer points, about 11^5 in the box, and the nearest has a value of about 0.995. Regular ripples on a bowl reward a search with a wide view, and they trap a narrow one quickly.

## What Each Run Records

`search` wraps the objective so that every evaluation is stored, and it returns the best point, value, all points, all values, a running best and a status. The plots and checks all draw on that record. The same function accepts a new seed, budget and box, and this is how **Multi-Start Analysis**, **Budget Sensitivity** and **Bounds Sensitivity** rerun it. Runs are stochastic, and the seed is fixed at 1 by default, so that a single result can look more solid than it is.

## A Common Workflow for a New Objective

1. Start with **CMA-ES** at the default **Budget**.
2. Read **Convergence Curve** and **Search Radius History**.
3. Repeat the run with **Multi-Start Analysis**.
4. Raise the budget through **Budget Sensitivity**.
5. Check the answer with **Neighbourhood Check** and **Bounds Check**.
6. Compare other methods with **Compare Strategies** and **ES vs DE**.

Before comparing, shift the optimum away from the box centre, as two of the tabs start there.

## References

<a id="ref-BS2002a"></a>Beyer, H.-G. and Schwefel, H.-P. (2002). Evolution strategies: a comprehensive introduction. *Natural Computing* 1(1), 3–52. [doi:10.1023/A:1015059928466](https://doi.org/10.1023/A:1015059928466)

## See Also

- [Factsheet](factsheet.md) · [CMA-ES](cmaes.md) · [xNES](xnes.md) · [Decision Guide](decision-guide.md)
