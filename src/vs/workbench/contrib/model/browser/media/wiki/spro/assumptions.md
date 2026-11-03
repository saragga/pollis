# Stochastic Programming: Assumptions

The panel's formulations assume a known, discrete distribution of demand, linear costs and constraints, decisions that use only the information already revealed, and a feasible recourse for every earlier decision. SDDP adds independence of the demand across stages.

## A finite, discrete distribution

Every tab replaces the continuous Uniform(50, 150) demand by S sampled values, each with probability 1/S. The extensive form needs a finite tree, and the SDDP.jl documentation lists finite, discrete sample spaces among the assumptions of stochastic dual dynamic programming.

The JuMP documentation calls the replacement of a continuous distribution by a finite set of samples sample average approximation. The code comment of **Bound Gap** notes that the optima of sample average approximations are biased low, and the action measures how far the sampled problem is from the cost of its decision on fresh scenarios.

## Complete recourse

[Dantzig (1955)](#ref-Dan1955a) assumes that the set of activities is complete: whatever the choice of activities in the earlier stages, consistent with the restrictions of their stage, there is a possible choice of activities in the later stages, so that the programming problem always has a solution.

The SDDP.jl documentation requires relatively complete recourse: all feasible decisions in a subproblem lead to feasible decisions in future subproblems. In the panel's problem, any order is feasible, since sales may be anything from 0 up to the demand and the stock on hand, and leftover stock is carried.

## Non-anticipativity

Each decision may depend only on the demands observed before it is taken. The decision table states the condition for the **Multistage** tab, and the scenario tree enforces it: an order belongs to a node, and every path through that node shares it.

[Rockafellar and Wets (1991)](#ref-RW1991a) bundle scenarios at various levels to reflect the availability of information, and adjust the decision policy iteratively to remove the dependence on hindsight. The **Wait-and-See** action computes the opposite case, WS, in which every period's demand is known before ordering.

## Convexity and linearity

Costs and constraints are linear in the orders, sales and stock, so each extensive form is one linear program. The SDDP.jl documentation lists convex problems among the assumptions of SDDP: for fixed noise, a convex stage cost, a linear transition function and a non-empty, bounded convex feasible set.

The introductory theory tutorial explains why: when a subproblem is a linear program, the incoming state appears only on a right-hand side, so the value function is convex in the state, and the dual variable of that constraint gives a subgradient for a cut.

## Stagewise independence

The SDDP.jl documentation states that the random variable of each node is independent of the random variables in all other nodes. The decision table of the panel names stagewise-independent uncertainty and convex costs as the context of the **SDDP** tab, and the second bullet of the panel describes stagewise independence as a Markovian condition that makes the backward pass tractable.

In the panel, every period draws from the same S values with equal probabilities, independently of the earlier periods, so the demand is stagewise independent in all three tabs.

## A valid lower bound

`SDDP.LinearPolicyGraph` takes a `lower_bound` on the objective; the panel sets it to −p · T · max(demand), the revenue of selling the largest demand in every period at no cost. The SDDP.jl documentation warns that the bound should not be needlessly loose, which slows convergence, but that a bound chosen too tight may cut off the feasible region and lead to a suboptimal solution.

## References

<a id="ref-Dan1955a"></a>Dantzig, G. B. (1955). Linear Programming under Uncertainty. *Management Science* 1(3-4), 197-206. [doi:10.1287/mnsc.1.3-4.197](https://doi.org/10.1287/mnsc.1.3-4.197)

<a id="ref-RW1991a"></a>Rockafellar, R. T., & Wets, R. J-B. (1991). Scenarios and Policy Aggregation in Optimization Under Uncertainty. *Mathematics of Operations Research* 16(1), 119-147. [doi:10.1287/moor.16.1.119](https://doi.org/10.1287/moor.16.1.119)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Two-Stage SP](two-stage.md) · [Multistage SP](multistage.md) · [SDDP](sddp.md)
