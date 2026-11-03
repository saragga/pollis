# Stochastic Search with Local Refinement: Assumptions

What the three methods take for granted: a finite box, an objective that can be evaluated anywhere in it, smoothness where gradients are used, a budget of evaluations, and, for the random methods, a seed.

## A finite box

All three methods search a box given by **Lower Bounds** and **Upper Bounds**. The NLopt documentation of [Johnson (2007)](#ref-Joh2007a) states that all its global algorithms require bound constraints on all the optimisation parameters, and that MLSL and StoGO support only bound-constrained problems. TikTak draws its Sobol points over the same box, through `MinimizationProblem(obj, lb, ub)`.

The length of **Lower Bounds** sets the dimension. Constraints other than bounds cannot be given; NLopt notes that its global methods can be combined with an augmented Lagrangian method for nonlinear constraints, which the panel does not do.

## An objective defined over the whole box

The methods evaluate f at sample points anywhere in the box, so **Objective f(x)** has to return a finite value at every point of it. MultistartOptimization.jl's documentation states that a local method should return `Inf` for infeasible regions, the convention for points where the objective is not defined.

Each evaluation is recorded for the actions, and the total number of evaluations, not the time per evaluation, is the measure of cost that **Budget** controls.

## Smoothness where gradients are used

StoGO-R uses gradients in its local searches and in the lower bounds of its boxes; [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) note that it needs the function to be differentiable. L-BFGS, one option of **Local Optimiser**, also uses gradients, and **Local Polish** runs L-BFGS on every method's answer.

The panel computes all gradients with ForwardDiff, by [Revels, Lubin and Papamarkou (2016)](#ref-RLP2016a), which requires **Objective f(x)** to be written in Julia functions that ForwardDiff can differentiate. BOBYQA and Nelder-Mead, the other two choices of **Local Optimiser**, are derivative-free.

## Many local minima, but not too many dimensions

The methods are designed for objectives with several local minima. [Rinnooy Kan and Timmer (1987)](#ref-KT1987a) aim to find all relevant local minima with as few local searches as possible, and [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) test their optimisers on functions with a large number of local minima.

[Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) write that the number of Sobol points of TikTak grows with the dimension of the problem. **Algorithm Properties** gives the panel's guide to the practical dimension of each method.

## A budget of evaluations

NLopt's MLSL and StoGO run indefinitely without a maximum number of evaluations or a maximum run time, as its documentation warns. **Budget** sets `maxeval`, and the tooltip notes that reaching it, `MAXEVAL_REACHED`, is the normal way these methods stop. NLopt's reference adds that the limit is not strict: the number of evaluations may exceed it slightly, depending on the algorithm.

TikTak splits **Budget** into a quarter for the Sobol points and the rest for the local searches.

## A seed for the random methods

MLSL and StoGO-R draw random numbers, and NLopt's reference explains that, unless a seed is set, the seed comes from the system time, so that runs differ. The panel calls `NLopt.srand(seed)` before every search, with seed 1 in the main code.

TikTak is deterministic: for a given objective, box and budget it always returns the same answer. **Seed Robustness** shows the difference: five seeds give five results for MLSL and StoGO-R, and one for TikTak.

## References

<a id="ref-AGK2019a"></a>Arnoud, A., Guvenen, F., & Kleineberg, T. (2019). *Benchmarking Global Optimizers*. NBER Working Paper 26340. National Bureau of Economic Research. [doi:10.3386/w26340](https://doi.org/10.3386/w26340)

<a id="ref-Joh2007a"></a>Johnson, S. G. (2007). The NLopt Nonlinear-Optimization Package. [github.com/stevengj/nlopt](https://github.com/stevengj/nlopt)

<a id="ref-RLP2016a"></a>Revels, J., Lubin, M., & Papamarkou, T. (2016). Forward-Mode Automatic Differentiation in Julia. [arXiv:1607.07892](https://arxiv.org/abs/1607.07892)

<a id="ref-KT1987a"></a>Rinnooy Kan, A. H. G., & Timmer, G. T. (1987). Stochastic Global Optimization Methods Part II: Multi Level Methods. *Mathematical Programming* 39(1), 57-78. [doi:10.1007/BF02592071](https://doi.org/10.1007/BF02592071)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [MLSL](mlsl.md) · [StoGO-R](stogo-r.md) · [TikTak](tiktak.md)
