# Decision Guide

Differential evolution is a good choice for low to moderate dimension, cheap evaluations and rugged objectives. Choosing among its variants depends mostly on how much tuning can be afforded.

## Which Tab Fits the Problem

| Situation | Tab | Why |
|---|---|---|
| A first try on a box-constrained problem | **DE** | Simple and robust |
| Hand tuning is impractical | **SHADE** | Learns F and CR, strong on benchmarks |
| Light adaptation wanted | **Adaptive DE** | No memory, no extra settings to speak of |
| Inequality constraints | **epsilonDE** | Passes through infeasible regions early |

## When to Use Something Else

| Situation | Better choice |
|---|---|
| Smooth objective with gradients | Quasi-Newton, from several starts |
| Convex problem | A convex solver, with a proof of optimality |
| Very expensive evaluations | Bayesian optimisation or another surrogate method |
| Smooth, ill-conditioned, black-box | CMA-ES |
| Discrete structure | Combinatorial methods |

**DE vs CMA-ES** tests one such alternative on the problem. Compare by evaluations, since methods differ in how they spend them.

## How to Choose the Population and Budget

Start with **Population Size** near 10 times the dimension, and raise it if **Multi-Start** shows a wide spread. Very large populations spend evaluations slowly, and **Population Size Study** shows the trade-off at a fixed budget. Set **Generations** so that the search ends after the curve flattens, as read from **Budget Study**. With very cheap objectives, use several runs of moderate size in place of a single long one. Evaluations in total are what count, so hold those fixed when comparing settings.

## How to Choose F and CR

On **DE**, begin with F = 0.7 and CR = 0.9. If the population collapses early, raise F or the population. If the search is too slow, lower F, or try the variant that uses the best member as its base. If the problem is known to be separable, try a low CR. Otherwise keep it high, as advised in [Price, Storn and Lampinen (2005)](#ref-PSL2005a). Tuning on one function does not carry over reliably, so use an adaptive tab if the problem will change often.

## How to Handle Constraints and Bounds

Use **Lower Bounds** and **Upper Bounds** for simple limits, as these are always kept. Use **epsilonDE** for inequality constraints, and raise **Epsilon Horizon** if feasibility is reached only late. Rescale constraints to comparable sizes. If the constraint can be removed by a change of variables, that usually works better. Add a penalty in the objective for an easy problem, knowing that the penalty size must be tuned. Inspect `feasible` in **Solution Summary** before reading the value.

## What to Report from a Study

State the objective, the dimension, the box, the variant and all its settings, including the population. Report results over many seeds, with the best, the mean, the spread and a success rate at a stated target. Give the budget in evaluations and not in generations. Name the bound handling, as it can matter. Compare with at least one other method. For a survey of accepted practice, see [Das, Mullick and Suganthan (2016)](#ref-DMS2016a). Say that no optimality proof exists.

## References

<a id="ref-DMS2016a"></a>Das, S., Mullick, S. S. and Suganthan, P. N. (2016). Recent advances in differential evolution: an updated survey. *Swarm and Evolutionary Computation* 27, 1–30. [doi:10.1016/j.swevo.2016.01.004](https://doi.org/10.1016/j.swevo.2016.01.004)

<a id="ref-PSL2005a"></a>Price, K. V., Storn, R. M. and Lampinen, J. A. (2005). *Differential Evolution: A Practical Approach to Global Optimization*. Springer. [doi:10.1007/3-540-31306-0](https://doi.org/10.1007/3-540-31306-0)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Classic DE](de.md) · [SHADE](shade.md)
