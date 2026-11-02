# Overview

Differential evolution searches a continuous space with a population, and builds new candidates from differences between existing members. It needs no gradient, and its few settings have made it a common first try on hard objectives.

## What the Method Is For

Differential evolution minimises a function over a box, using only function values. It suits objectives that are non-smooth, noisy or full of local minima, on which a gradient method gets stuck. [Storn and Price (1997)](#ref-SP1997a) proposed it. It carries no guarantee of finding the global minimum in finite time, and it uses many evaluations, so that a smooth convex problem is better left to other methods.

## How One Generation Works

For each member x_i of the population:

1. **Mutation**: build a mutant from other members, adding a scaled difference.
2. **Crossover**: mix the mutant and x_i, coordinate by coordinate, into a trial u.
3. **Selection**: u replaces x_i if u is at least as good.

The step sizes come from the differences within the population, so they shrink by themselves as the population converges. That self-scaling is the method's central idea.

## How the Four Tabs Differ

| Tab | What changes |
|---|---|
| **DE** | Fixed **Scale Factor (F)** and **Crossover Rate (CR)** |
| **SHADE** | F and CR adapt from a history of what has worked, with an archive |
| **Adaptive DE** | Each member carries its own F and CR (jDE) |
| **epsilonDE** | Adds constraints g(x) ≤ 0 to **DE**, through a shrinking tolerance |

All four share a population, a box and greedy selection. Adaptive tabs remove the need to set F and CR by hand, at the price of more moving parts.

## Which Problem the Panel Solves by Default

The default **Objective f(x)** is the Rastrigin function:

- f(x) = 10 n + sum(x_i^2 − 10 cos(2 pi x_i))

Its global minimum is 0 at the origin, surrounded by a regular grid of local minima, on the box from −5.12 to 5.12. **Dimension (n)** sets the size. The function is separable, so that each coordinate can be solved alone, which suits a low **Crossover Rate (CR)**. That is not typical of real problems. Any expression in `x` can replace it.

## A Common Workflow for a New Objective

1. Run **DE** with defaults, and read **Convergence Curve**.
2. Check **Population Diversity** for early collapse.
3. Run **Multi-Start**, to see the spread between seeds.
4. Try **SHADE** or **Adaptive DE** if the settings are hard to choose.
5. Compare with **Compare with Library DE** and **DE vs CMA-ES**.
6. Verify the result with **Evaluate at Minimum** and **Bounds Check**.

## References

<a id="ref-SP1997a"></a>Storn, R. and Price, K. (1997). Differential evolution: a simple and efficient heuristic for global optimization over continuous spaces. *Journal of Global Optimization* 11(4), 341–359. [doi:10.1023/A:1008202821328](https://doi.org/10.1023/A:1008202821328)

## See Also

- [Factsheet](factsheet.md) · [Classic DE](de.md) · [SHADE](shade.md) · [Adaptive DE](adaptive-de.md)
