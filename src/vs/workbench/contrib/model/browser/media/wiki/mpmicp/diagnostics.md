# Mixed-Integer Convex Programming — Diagnostics

A mixed-integer convex solve can stop for several reasons, and a value means little until the status says how it was reached. The Diagnose and Compare steps of the Mixed-Integer Convex Programming panel check the status, the integrality of the solution, the cost of the integer constraints and the agreement of the conic solvers.

## Did Pajarito solve the problem?

The **Feasibility Check** prints four outputs:

| Output | Reading |
|---|---|
| `termination` | `OPTIMAL` when the bound and the best solution met within Pajarito's tolerances |
| `primal` | `FEASIBLE_POINT` when a solution is available |
| `integrality` | The largest distance of an integer variable from a whole number, about zero for a valid solution |
| `violated` | Constraints violated by more than 1e-6; an empty dictionary means none |

Outer approximation proves optimality when the bound from the master problem meets the value of the best conic subproblem ([Coey, Lubin and Vielma (2020)](#ref-CLV2020a)). A status other than `OPTIMAL` means that this proof is missing, even when a solution is printed.

## How much do the integer constraints cost?

The **Relaxation Gap** step drops the integrality, solves the continuous conic problem with the chosen **Conic Solver**, and restores the mixed-integer problem:

| Output | Reading |
|---|---|
| `mixed_integer` | The optimal value with the integer constraints |
| `relaxation` | The optimal value without them, a bound on `mixed_integer` |
| `relative_gap` | Their difference relative to `mixed_integer` |
| `fractional_in_relaxation` | How many integer variables take fractional values in the relaxation |

A small `relative_gap` with few fractional variables means that the integer constraints change little; a large one, with many fractional variables, that the relaxation spreads the choice over many variables and the search for the integer optimum has more to do.

## Is rounding the relaxation good enough?

**vs Rounding Heuristic** solves the continuous relaxation, rounds it to an integer choice, solves again with that choice fixed, and compares with the exact optimum. On the cardinality tabs it keeps the k largest relaxed indicators; on the knapsack it keeps only the items the relaxation packs whole. `relative_loss` is the share of the optimum the heuristic gives up. A `rounded_relaxation` of `NaN` means the rounded choice is infeasible, for example a set of k assets that cannot reach the **Target Return**. A loss near zero shows that the relaxation already points to the optimal choice.

## Do the conic solvers agree?

The **Conic Solver Comparison** solves the problem with Pajarito twice, once with Hypatia and once with Clarabel as its conic solver, and prints the status, the objective and the seconds of each. Each is solved twice and only the second solve is timed, since the first also compiles the solvers' code. The two should reach the same status and the same objective to the solvers' tolerances; Clarabel ([Goulart and Chen (2024)](#ref-GC2024a)) and Hypatia ([Coey, Kapelevich and Vielma (2022)](#ref-CKV2022a)) are different interior-point implementations, so agreement shows that the value belongs to the problem. The step then returns to the chosen **Conic Solver**.

## Common failures and their usual causes

| Symptom | Usual cause | Remedy |
|---|---|---|
| `INFEASIBLE` on **Cardinality Portfolio** | No k assets reach the **Target Return** | Raise **Cardinality k** or lower **Target Return** |
| `NaN` in the **Parametric Sweep** | Some values of k leave the problem infeasible | Read the other points; the curve starts where k becomes feasible |
| `TIME_LIMIT` or `ITERATION_LIMIT` | Many master solves, often with a weak formulation | Tighten the big-M bounds, or allow more time |
| `OTHER_ERROR` | A conic subproblem failed numerically | Rerun with the other **Conic Solver** |

## References

<a id="ref-CKV2022a"></a>Coey, C., Kapelevich, L. and Vielma, J. P. (2022). Solving Natural Conic Formulations with Hypatia.jl. *INFORMS Journal on Computing* 34(5), 2686–2699. [doi:10.1287/ijoc.2022.1202](https://doi.org/10.1287/ijoc.2022.1202)

<a id="ref-CLV2020a"></a>Coey, C., Lubin, M. and Vielma, J. P. (2020). Outer Approximation with Conic Certificates for Mixed-Integer Convex Problems. *Mathematical Programming Computation* 12(2), 249–293. [doi:10.1007/s12532-020-00178-3](https://doi.org/10.1007/s12532-020-00178-3)

<a id="ref-GC2024a"></a>Goulart, P. J. and Chen, Y. (2024). Clarabel: An Interior-Point Solver for Conic Programs with Quadratic Objectives. [arXiv:2405.12762](https://doi.org/10.48550/arXiv.2405.12762)

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Interpretation](interpretation.md)
