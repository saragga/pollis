# Stochastic Search with Local Refinement: StoGO-R

**StoGO-R**, the randomised variant of StoGO, by [Zertchaninov and Madsen (1998)](#ref-ZM1998a), divides the box into smaller boxes by branch and bound, and searches each with gradient-based local searches started from regular and random points.

## Branch and bound with local searches

The NLopt documentation of [Johnson (2007)](#ref-Joh2007a) describes StoGO as a global optimisation algorithm that systematically divides the search space, which must be bound-constrained, into smaller hyper-rectangles by a branch-and-bound technique, and searches them with a gradient-based local search, a BFGS variant, optionally including some randomness. NLopt provides it as `GD_STOGO`, and the randomised variant as `GD_STOGO_RAND`, the one the panel runs.

[Zertchaninov and Madsen (1998)](#ref-ZM1998a) describe the C++ implementation of a stochastic branch-and-bound method for global optimisation over a box parallel to the coordinate axes. In each box, the method samples regular points, the centre and two points on either side of it along each axis, and random points, uniformly distributed in the box, and starts local searches from them. A lower bound for f in the box, from the sampled values and the largest gradient seen, decides whether the box is discarded.

They do not aim to guarantee that the global minimum is found, but to get the best possible out of a given amount of computational resources: the user specifies how much computer time and storage to spend, not an accuracy.

## The steps

[Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) give the main steps of StoGO as they benchmark it:

1. Rank the candidate boxes by the smallest function value found in each, and take the best one.
2. Draw random points in that box, evaluate f at them and start a gradient-based local search from each.
3. If all local searches leave the box, or all converge to the same minimum, set the box aside; otherwise estimate a lower bound for f in the box from the best value and the largest gradient seen, discard the box if the bound exceeds the best value known, and split it in two otherwise.
4. Split the boxes set aside, and repeat until a stopping rule is met.

Boxes are split along the dimension in which the local minima found are most dispersed, so that each half contains at least one of them.

## Gradients

StoGO needs the gradient of the objective, both for its local searches and for the lower bounds of the boxes. [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) note that it uses the derivative of the function, while all the other algorithms of their benchmark are derivative-free, and that the function needs to be differentiable.

The panel computes the gradient with ForwardDiff, by [Revels, Lubin and Papamarkou (2016)](#ref-RLP2016a), whenever NLopt asks for it, so **Objective f(x)** needs only the expression of f. The tooltip of **Objective f(x)** notes the same: StoGO-R needs gradients, which are computed automatically.

## Randomness and seeds

The randomised variant draws random points, so its result depends on the seed. The panel seeds NLopt with `NLopt.srand(seed)`; NLopt's reference explains that its stochastic algorithms use the Mersenne Twister and take their seed from the system time unless one is set.

**Seed Robustness** reruns StoGO-R with seeds 1 to 5 and reports the best values, their mean and spread, and the largest distance between the solutions found.

## Stopping

NLopt's documentation warns that StoGO runs indefinitely without a maximum number of evaluations or a maximum run time. The panel sets `maxeval` to **Budget**, 2000 by default. NLopt's reference adds that `maxeval` is not a strict maximum: depending on the algorithm, the number of evaluations may exceed it slightly.

StoGO ignores the start point that NLopt requires and searches the whole box, as the comment in the code notes; **Local Optimiser** does not apply to it.

## When to use it

The panel's decision table suggests **StoGO-R** for smooth problems with cheap gradients. In the benchmark of [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a), StoGO performed well on the test functions.

NLopt supports only bound-constrained problems for StoGO. **Algorithm Properties** summarises the method: random, gradient-based, with local refinement, and with no guarantee beyond the best result within the budget. **Local Polish** and **Solution** apply to its answer as to the others, and **Compare Methods** sets it beside MLSL and the NLopt methods without local searches.

## References

<a id="ref-AGK2019a"></a>Arnoud, A., Guvenen, F., & Kleineberg, T. (2019). *Benchmarking Global Optimizers*. NBER Working Paper 26340. National Bureau of Economic Research. [doi:10.3386/w26340](https://doi.org/10.3386/w26340)

<a id="ref-Joh2007a"></a>Johnson, S. G. (2007). The NLopt Nonlinear-Optimization Package. [github.com/stevengj/nlopt](https://github.com/stevengj/nlopt)


<a id="ref-RLP2016a"></a>Revels, J., Lubin, M., & Papamarkou, T. (2016). Forward-Mode Automatic Differentiation in Julia. [arXiv:1607.07892](https://arxiv.org/abs/1607.07892)

<a id="ref-ZM1998a"></a>Zertchaninov, S., & Madsen, K. (1998). *A C++ Programme for Global Optimization*. IMM-REP-1998-04. Department of Mathematical Modelling, Technical University of Denmark. [github.com/stevengj/nlopt](https://github.com/stevengj/nlopt/blob/master/src/algs/stogo/techreport.pdf)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [MLSL](mlsl.md) · [TikTak](tiktak.md)
