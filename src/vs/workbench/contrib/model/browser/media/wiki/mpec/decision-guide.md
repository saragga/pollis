# Mathematical Programming with Equilibrium Constraints: Decision Guide

The three methods solve the same problem by different routes, and the choice among them follows from the size of the equilibrium, the number of outer decisions, and how much assurance of a global answer is wanted.

## Which method?

| Situation | Choose | Reason |
|---|---|---|
| A smooth problem of any size | **Regularisation** | A sequence of nonlinear programs, each warm-started |
| y ≥ 0 and f ≥ 0 easy to keep, complementarity hard | **Penalty** | Complementarity moves into the objective |
| An equilibrium with a unique solution for each x | **Implicit (PATH)** | The equilibrium is solved at every grid point, and the best point is kept |
| A check on a local answer | **Implicit (PATH)** | The grid covers the whole range of x |
| A comparison of all three | **Method Comparison** | Agreement across routes |

The decision table on the panel sets out the same choices.

## How do the two nonlinear programming methods differ?

**Regularisation** keeps every subproblem's feasible set inside the region y_i f_i ≤ t, which shrinks towards the MPEC's as t falls to 1e-8. **Penalty** lets each subproblem roam over y ≥ 0 and f ≥ 0, and charges y'f at the rate mu, which grows to 1e4.

[Hu and Ralph (2004)](#ref-HR2004a) show that the penalty framework shares convergence properties similar to those of the regularisation of [Scholtes (2001)](#ref-Sch2001a), with the larger feasible set of each penalty subproblem as an advantage at each iteration. [Luo, Pang and Ralph (1996)](#ref-LPR1996a) build a theory of exact penalisation for MPECs.

## How many grid points?

**Grid Points** sets the number of values of x at which **Implicit (PATH)** solves the equilibrium. The solution is the best grid point, so the spacing between points, the range divided by one less than **Grid Points**, is the resolution of x.

| Goal | Setting |
|---|---|
| A quick look at the shape | Fewer points |
| A precise decision | More points, at a proportional cost in time |
| A precise decision on a wide range | **Regularisation** or **Penalty**, with the grid as a check |

**Implicit Objective** uses its own 200 points over the full range, whatever **Grid Points** is.

## When is another panel the better place?

| Situation | Better place |
|---|---|
| The equilibrium alone, with no outer objective | **Complementarity Problems** |
| An equilibrium written as a variational inequality | **Variational Inequalities** |
| The inner problem is an optimisation, not an equilibrium | **Hierarchical Optimisation** |
| No equilibrium constraint at all | **Nonlinear Programming** |
| Flows on a network, with no planner setting the network | **Network Flows** |

A follower that solves an optimisation problem can also be written into an MPEC by replacing its problem with its optimality conditions, which take the form of a complementarity condition. The default market does exactly that: each follower's condition is the first-order condition of its profit maximisation with a non-negative output.

## A sensible order of work

1. Write the equilibrium in **Equilibrium Map f(x, y)**, and check its sign: f_i ≥ 0 where y_i = 0.
2. Plot **Equilibrium Response** to see that PATH solves it across the range.
3. Plot **Implicit Objective** to see the whole problem.
4. Solve with **Regularisation**, and read **Complementarity Check** and **Stationarity Check**.
5. Run **Method Comparison** to confirm the answer by other routes.
6. Read the answer with **Active Constraints**, **Value of Commitment**, **Relaxed Bound** and **Parametric MPEC**.

Steps 2 and 3 come before solving, because a problem with one outer decision can be seen whole before any method is chosen.

## References

<a id="ref-HR2004a"></a>Hu, X. M., & Ralph, D. (2004). Convergence of a Penalty Method for Mathematical Programming with Complementarity Constraints. *Journal of Optimization Theory and Applications* 123(2), 365-390. [doi:10.1007/s10957-004-5154-0](https://doi.org/10.1007/s10957-004-5154-0)

<a id="ref-LPR1996a"></a>Luo, Z.-Q., Pang, J.-S., & Ralph, D. (1996). *Mathematical Programs with Equilibrium Constraints*. Cambridge University Press. [doi:10.1017/CBO9780511983658](https://doi.org/10.1017/CBO9780511983658)

<a id="ref-Sch2001a"></a>Scholtes, S. (2001). Convergence Properties of a Regularization Scheme for Mathematical Programs with Complementarity Constraints. *SIAM Journal on Optimization* 11(4), 918-936. [doi:10.1137/S1052623499361233](https://doi.org/10.1137/S1052623499361233)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
- [MPEC](mpec.md)
