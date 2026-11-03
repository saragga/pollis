# Stochastic Programming: SDDP

The **SDDP** tab solves the multistage inventory problem with stochastic dual dynamic programming in SDDP.jl: instead of a scenario tree, it builds piecewise-linear approximations of each stage's cost-to-go from cuts, and returns a policy with a lower bound.

## The algorithm

[Dowson and Kapelevich (2021)](#ref-DK2021b) present SDDP.jl as an open-source library for multistage stochastic programming problems with the stochastic dual dynamic programming algorithm, built on JuMP, which gives it a solver-agnostic interface. The algorithm goes back to [Pereira and Pinto (1991)](#ref-PP1991a), in a paper on energy planning.

The SDDP.jl documentation writes the problem as a dynamic programming recursion over the nodes of a policy graph and notes that the cost-to-go term, a nested expectation, makes it intractable to solve exactly. SDDP applies Kelley's cutting plane algorithm to the cost-to-go functions, under-approximating each by cuts, first-order approximations at visited states.

## The policy graph of the tab

```
SDDP.LinearPolicyGraph(stages = T + 1, sense = :Min,
    lower_bound = -price * T * maximum(dem), optimizer = HiGHS.Optimizer)
```

Stage 1 only orders, with the demand fixed at 0; stages 2 to T + 1 observe the demand with `SDDP.parameterize`, sell, carry stock and reorder, and the last stage cannot order. The state variables are `stock` and `ordered`: the order placed in one stage arrives as `ordered.in` in the next.

The SDDP.jl documentation describes this setting, the noise observed at the start of a node before the controls are chosen, as a hazard-decision or wait-and-see formulation.

## Forward and backward passes

The theory tutorial of SDDP.jl implements a simplified version of the algorithm. The forward pass walks the policy graph from start to end, samples a noise at each node, solves the subproblem with its current cuts and passes the outgoing state to the next node. The backward pass visits the nodes of the trajectory in reverse and, at each, solves the next node for every noise value and adds a cut built from the objective values and the subgradients with respect to the incoming state.

Visiting the nodes in reverse, the tutorial explains, means that the cut at node i uses the already improved approximation at node i + 1. **SDDP Iterations** sets `iteration_limit`; the tooltip states that each iteration runs one forward simulation and one backward pass that adds a cut per stage.

## Bounds and simulation

After training, `SDDP.calculate_bound` gives the lower bound, and `SDDP.simulate` runs 500 in-sample simulations of the policy. The code prints the first order, the bound, the mean simulated cost and the half-width 1.96 · sd/√500 of its 95% confidence interval.

The SDDP.jl documentation describes the confidence interval as an estimate for an upper bound of the policy's quality, and warns that the in-sample simulation may not reflect the true performance of the policy. **Out-of-Sample** simulates with `SDDP.OutOfSampleMonteCarlo` on S fresh demand values, and **Bound Gap** prints the gap between the bound and the simulated cost as a percentage.

## Assumptions of SDDP

The SDDP.jl documentation lists five assumptions: finitely many nodes; finite, discrete random variables; convex problems; no infinite loops; and relatively complete recourse. The random variable of a node is independent of those of all other nodes.

The decision table names stagewise-independent uncertainty and convex costs as the context of the tab, and the panel's bullet describes stagewise independence as the Markovian condition that makes the backward pass tractable. In the tab, every stage after the first draws from the same S demand values with probability 1/S.

## Value functions and decision rules

`SDDP.ValueFunction(sd; node = 1)` returns the cut approximation of the first node, which **Value of Initial Stock** evaluates at initial stock from 0 to 150. The SDDP.jl documentation explains that the dual variable of the constraint fixing the incoming state is a subgradient of the value function, the change in the objective for one more unit of state.

The trained policy is a decision rule per node, mapping the incoming state and the observed noise to a control. **Decision Paths** and **Stage Plan** read the orders, sales and stock from the simulations, and **Critical Fractile** the mean stock after ordering in each stage.

## References

<a id="ref-DK2021b"></a>Dowson, O., & Kapelevich, L. (2021). SDDP.jl: A Julia Package for Stochastic Dual Dynamic Programming. *INFORMS Journal on Computing* 33(1), 27-33. [doi:10.1287/ijoc.2020.0987](https://doi.org/10.1287/ijoc.2020.0987)

<a id="ref-PP1991a"></a>Pereira, M. V. F., & Pinto, L. M. V. G. (1991). Multi-stage Stochastic Optimization Applied to Energy Planning. *Mathematical Programming* 52(1-3), 359-375. [doi:10.1007/BF01582895](https://doi.org/10.1007/BF01582895)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Two-Stage SP](two-stage.md) · [Multistage SP](multistage.md)
