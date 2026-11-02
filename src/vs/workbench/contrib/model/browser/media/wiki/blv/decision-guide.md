# Decision Guide

Choices here cover whether a hierarchy is the right model, which method fits, and how much to trust the result.

## Which Hierarchical Optimisation Tab Fits a Problem

| Situation | Tab | Why |
|---|---|---|
| Linear follower, wanting an exact answer | **KKT Reformulation** | One MILP and a global solve |
| One leader variable, wanting a transparent check | **Leader Grid Search** | No reformulation and no big-M |
| Multipliers cannot be sensibly bounded | **Leader Grid Search** | Needs no bound, for one leader variable |
| Many leader variables | **KKT Reformulation** | A grid grows exponentially with the dimension |
| A first look at a new problem | Both | Disagreement exposes errors early |

## When a Bilevel Model Is Warranted

Use one when an agent's response really depends on a decision made first, and when the response matters to the outcome. Tolls, tariffs, regulation and pricing fit. When both sides move at once, a Nash or complementarity model fits better. When the follower is really part of the same organisation, a joint optimisation may be right, and it gives a lower bound on cost in any case. [Colson, Marcotte and Savard (2007)](#ref-CMS2007a) list many applications. A small model of the hierarchy can often teach more than a large model that ignores it.

## How to Choose Big-M

Start from problem knowledge: a bound on slack comes from the ranges of x and y, and a bound on multipliers from the sensitivity of the follower's objective. Solve, then raise **Big-M** and solve again. Stable answers across a range give some confidence, and the grid confirms it for one leader variable. Avoid very large values, as the MILP relaxation weakens and tolerances begin to matter. Where a safe bound is out of reach, consider a mode that needs no big-M.

## When to Use Other Reformulations

`BilevelJuMP.jl`, by [Dias Garcia, Bodin and Street (2024)](#ref-GBS2024a), supports several ways of handling complementarity, and the panel uses the Fortuny-Amat and McCarl mode because it is simple and can be solved with HiGHS. Special ordered sets and indicator constraints avoid a big-M altogether, given a solver that supports them. Some forms suit nonlinear solvers but return only local answers. Switching means changing the `mode` in `solve_kkt`, and perhaps the solver too. Test the new form against the old on a problem with a known answer.

## How to Set the Grid

Spacing sets accuracy, and cost grows in step with **Grid Points**. A linear problem has its leader optimum at a breakpoint, which a grid will usually straddle, so a grid gives an upper bound on the leader's optimum, within spacing. Refine around the best point by narrowing the range. A problem with a narrow feasible interval can be missed entirely by a coarse grid. A nonlinear leader objective may have several local optima, which a grid handles naturally. With more than one leader variable, the number of points grows too quickly for this method.

## What to Report from a Bilevel Study

Report the formulation, whether the solution is optimistic or pessimistic, the value of **Big-M**, and the checks made. State how the follower's objective was chosen, as a wrong objective undermines the whole. Report the bound and the price of hierarchy. For larger models, give the solver gap. The methods survey by [Dempe, Kalashnikov, Pérez-Valdés and Kalashnykova (2015)](#ref-DKPK2015a) provides a reference for the terms used, so a reader can tell which notion of solution is meant.

## References

<a id="ref-CMS2007a"></a>Colson, B., Marcotte, P. and Savard, G. (2007). An overview of bilevel optimization. *Annals of Operations Research* 153(1), 235–256. [doi:10.1007/s10479-007-0176-2](https://doi.org/10.1007/s10479-007-0176-2)

<a id="ref-DKPK2015a"></a>Dempe, S., Kalashnikov, V., Pérez-Valdés, G. A. and Kalashnykova, N. (2015). *Bilevel Programming Problems: Theory, Algorithms and Applications to Energy Networks*. Springer. [doi:10.1007/978-3-662-45827-3](https://doi.org/10.1007/978-3-662-45827-3)

<a id="ref-GBS2024a"></a>Dias Garcia, J., Bodin, G. and Street, A. (2024). BilevelJuMP.jl: modeling and solving bilevel optimization problems in Julia. *INFORMS Journal on Computing* 36(2), 327–335. [doi:10.1287/ijoc.2022.0135](https://doi.org/10.1287/ijoc.2022.0135)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Bilevel Optimisation](bilevel.md)
