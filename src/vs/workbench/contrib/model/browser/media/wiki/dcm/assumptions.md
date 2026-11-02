# Assumptions

Evolutionary multi-objective methods assume little about the form of the objectives, and they offer few guarantees in return. Most assumptions concern the budget, scaling and what a finite run can show.

## What Stochastic Search Assumes

No gradient or convexity is required, and the objectives can be black boxes. The price is that no finite run can prove a solution Pareto optimal. The front returned is the best seen under one seed, and its points may be dominated by solutions never sampled. [Coello Coello, Lamont and Van Veldhuizen (2007)](#ref-CLV2007a) discuss convergence and its limits for such methods. For a smooth, convex problem, a mathematical programming method can give far stronger results.

## What the Budget Assumes

**Population** times **Iterations** sets the work, and the number needed depends on the problem. The defaults suit a small problem with two variables. Problems with many variables, or a rugged landscape, need much more. A front that still improves at the end of the run has not converged, as **Budget Sensitivity** can show. Evaluating each objective is assumed cheap. If a run costs minutes per evaluation, a surrogate model or a different method is a better fit.

## What Scaling Assumes

Weight vectors, hypervolume, distance indicators and archive boxes all read objective values directly. Objectives with very different ranges are treated unequally unless they are scaled. **Weight Vectors** rescales for its picture, whereas the algorithm's run does not have to. **Epsilon** must be stated in each objective's units. The results can change when an objective is rescaled, so state the units and consider normalising the objectives by known ranges before optimising.

## What Constraint Handling Assumes

Constraints are taken as hard, written in the form g(x) ≤ 0 and h(x) = 0, with tolerances. Scale matters here too, as a sum of violations mixes units when constraints have different scales. Objectives must also be computable at infeasible points, as candidate solutions go there, so that **Objectives** must not fail on them. [Deb (2000)](#ref-Deb2000a) gave the rules on which many methods rely, and they assume that any feasible solution beats any infeasible one, whatever their objectives are.

## What Comparisons Assume

A single seed says little, as a stochastic algorithm has a spread of outcomes. **Compare Algorithms** uses one seed, and the same number of iterations, which does not mean the same number of evaluations. **IGD Comparison** builds its reference from the runs themselves, so that results are relative to those runs. Fair claims call for many seeds, a stated budget in evaluations, and tests across many problems, as [Zitzler, Thiele, Laumanns, Fonseca and da Fonseca (2003)](#ref-ZTLFF2003a) argue.

## What the Default Problem Assumes

CONSTR is a small test problem with two objectives and two variables, chosen for its shape. Good results there say little about larger real problems. Differences between methods are also small on an easy problem, so that a comparison on it may show only noise. Real tasks may have many objectives, discrete variables, noise or an expensive model. The panel handles real-valued variables through **Bounds**, so a problem with discrete variables needs another encoding.

## References

<a id="ref-CLV2007a"></a>Coello Coello, C. A., Lamont, G. B. and Van Veldhuizen, D. A. (2007). *Evolutionary Algorithms for Solving Multi-Objective Problems*, 2nd ed. Springer.

<a id="ref-Deb2000a"></a>Deb, K. (2000). An efficient constraint handling method for genetic algorithms. *Computer Methods in Applied Mechanics and Engineering* 186(2–4), 311–338. [doi:10.1016/S0045-7825(99)00389-8](https://doi.org/10.1016/S0045-7825(99)00389-8)

<a id="ref-ZTLFF2003a"></a>Zitzler, E., Thiele, L., Laumanns, M., Fonseca, C. M. and da Fonseca, V. G. (2003). Performance assessment of multiobjective optimizers: an analysis and review. *IEEE Transactions on Evolutionary Computation* 7(2), 117–132. [doi:10.1109/TEVC.2003.810758](https://doi.org/10.1109/TEVC.2003.810758)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
