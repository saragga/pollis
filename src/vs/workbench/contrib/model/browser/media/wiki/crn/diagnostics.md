# Diagnostics

Checks here confirm three things: that the list says what was meant, that the numerical solution is sound, and that a general theorem really applies to the system at hand.

## How to Check the Network Was Written Correctly

**Stoichiometry Matrix** prints species, reactions and the net change of each species in each reaction. Read it column by column, and check that each reaction matches its intended mechanism. A sign error, or a catalyst left out of a product, shows up there. A catalyst on both sides has a net change of zero, so that it vanishes from this matrix, although it still affects the rate. **Conservation Laws** gives a second check, since expected totals should appear. A law that is missing means that the list leaks material.

## How to Check the Solution Numerically

Compute conserved totals along the run: they should stay fixed, up to the tolerance. For **Ecological**, compute V, as set out in [Ecological](ecological.md). Run again with tighter `abstol` and `reltol`, and compare. Amounts going below zero by more than rounding signal poor accuracy. A very slow run suggests stiffness, a common feature of reaction networks with rates of different sizes, for which an implicit solver suits. Solver settings come from the ecosystem of [Rackauckas and Nie (2017)](#ref-RN2017a).

## How to Read the Deficiency Result

Deficiency is complexes − linkage classes − rank. **Network Summary** prints it, along with weak reversibility. Hand counts for the four tabs are:

| Tab | Complexes | Classes | Rank | Deficiency | Weakly reversible |
|---|---|---|---|---|---|
| **Chemical** | 3 | 1 | 2 | 0 | No |
| **Genetic** | 4 | 1 | 3 | 0 | Yes |
| **Ecological** | 6 | 3 | 2 | 1 | No |
| **Epidemic** | 4 | 2 | 2 | 0 | No |

## What the Deficiency Zero Theorem Covers

[Feinberg (1987)](#ref-Fei1987a) treats mass-action networks of deficiency 0. If weakly reversible, each compatibility class has one positive steady state, which is locally stable, with no oscillation. If not, there is no positive steady state and no periodic orbit. **Chemical** and **Epidemic** fall under the second case, although the printed message then says only that oscillation may occur. **Genetic** meets the structural conditions, so the message says "no oscillations", but its Hill rates lie outside the theorem, and its plot shows oscillation. Read that message with care.

## How to Check Steady States

**Steady States** always uses the Michaelis-Menten network, and it reports real, non-negative solutions with totals taken from the starting amounts. A check by hand is easy: with S = SE = 0, all rates vanish. Non-trivial steady states should be confirmed by substituting them in the rates, and by checking stability with a run started close by. Polynomial methods find the solutions of the algebra, and say nothing on stability. Non-polynomial rates need other tools.

## How to Check the Stochastic Results

**ODE vs Gillespie** runs 200 trajectories, so that a share near 1/R0 carries sampling error of a few percentage points. Its cut-off of 10 per cent of N sets what counts as a minor outbreak, and at small R0 or short **T (time)** that cut-off can misclassify runs. **u0 (initial amount)** must be a whole number here, as the jump form rounds it. Increase the run count, and check how the share settles. Cost grows with the number of events, as discussed by [Gillespie (2007)](#ref-Gil2007a), so large populations run slowly.

## References

<a id="ref-Fei1987a"></a>Feinberg, M. (1987). Chemical reaction network structure and the stability of complex isothermal reactors, I: the deficiency zero and deficiency one theorems. *Chemical Engineering Science* 42(10), 2229–2268. [doi:10.1016/0009-2509(87)80099-4](https://doi.org/10.1016/0009-2509(87)80099-4)

<a id="ref-Gil2007a"></a>Gillespie, D. T. (2007). Stochastic simulation of chemical kinetics. *Annual Review of Physical Chemistry* 58(1), 35–55. [doi:10.1146/annurev.physchem.58.032806.104637](https://doi.org/10.1146/annurev.physchem.58.032806.104637)

<a id="ref-RN2017a"></a>Rackauckas, C. and Nie, Q. (2017). DifferentialEquations.jl: a performant and feature-rich ecosystem for solving differential equations in Julia. *Journal of Open Research Software* 5(1), 15. [doi:10.5334/jors.151](https://doi.org/10.5334/jors.151)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
