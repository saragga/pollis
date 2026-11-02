# Overview

Multi-objective optimisation seeks a set of good trade-offs, not a single best point. The panel offers three strategies for finding that set when constraints shape it or when its resolution matters.

## What a Pareto Front Is

With several objectives to minimise, one solution dominates another if it is no worse in all objectives and better in at least one. Solutions dominated by none form the Pareto set in decision space, and their objective values form the Pareto front. Population methods evolve a whole set of candidates in one run, as described by [Deb (2001)](#ref-Deb2001a). The result is a sample of the front, on which a decision maker can then choose.

## How the Three Tabs Differ

| Tab | Main idea | Strong when |
|---|---|---|
| **MOEA/D** | Split into scalar subproblems by weights | Regular, smooth fronts |
| **CCMO** | Two populations, one ignoring constraints | Constraints cut or block the front |
| **Epsilon-Dominance Archive** | Keep one solution per box | A bounded set at a set resolution |

Each tab calls `optimize` with a different algorithm, so all accept the same problem. Plain NSGA-II, from [Deb, Pratap, Agarwal and Meyarivan (2002)](#ref-DPAM2002a), serves as the shared baseline in the comparisons.

## How Decomposition and Constraints Come In

Decomposition turns one multi-objective problem into many scalar ones, each aimed at a different part of the front. Constraint handling is a separate concern: an algorithm must find feasible solutions, and then spread along a front that the constraints may have cut into pieces. The two ideas work on different weaknesses, and the panel's name joins them. **MOEA/D** deals with the first, and **CCMO** with the second.

## Which Problem the Panel Solves by Default

Deb's CONSTR has two variables and two inequality constraints:

- Minimise f1 = x1 and f2 = (1 + x2) / x1
- 6 − (x2 + 9 x1) ≤ 0 and 1 + x2 − 9 x1 ≤ 0
- 0.1 ≤ x1 ≤ 1 and 0 ≤ x2 ≤ 5

Constraints shape part of the front, which makes the problem small but instructive. Any problem can replace it, through **Objectives**, **Inequality Constraints**, **Equality Constraints** and **Bounds**.

## A Common Workflow for Comparing Methods

1. Run a tab, and read `front_size`, `hypervolume` and `all_feasible`.
2. Look at **Pareto Front Plot** and **Constraint Check**.
3. Test stability across seeds with **Hypervolume**.
4. Test the budget with **Budget Sensitivity**.
5. Compare with others through **Compare Algorithms** and **IGD Comparison**.
6. Read the result through **Decision Space** and **Active Constraints**.

A final choice from the front still needs a preference from outside the run.

## References

<a id="ref-Deb2001a"></a>Deb, K. (2001). *Multi-Objective Optimization Using Evolutionary Algorithms*. Wiley.

<a id="ref-DPAM2002a"></a>Deb, K., Pratap, A., Agarwal, S. and Meyarivan, T. (2002). A fast and elitist multiobjective genetic algorithm: NSGA-II. *IEEE Transactions on Evolutionary Computation* 6(2), 182–197. [doi:10.1109/4235.996017](https://doi.org/10.1109/4235.996017)

## See Also

- [Factsheet](factsheet.md) · [MOEA/D](moead.md) · [CCMO](ccmo.md) · [Borg MOEA](borg.md)
