# Factsheet

**Deterministic Global Methods** minimises a function over a box with DIRECT, DIRECT-L, QuadDIRECT or AGS, recording each evaluation so that the search can be inspected.

## What the Panel Does

| Item | Detail |
|---|---|
| Purpose | Global minimisation over a box, with no gradients and no random numbers |
| Julia stack | `NLopt.jl` and `QuadDIRECT.jl` for the methods, `Plots.jl` for figures |
| Tabs | **DIRECT**, **DIRECT-L**, **QuadDirect**, **AGS** |
| Main function | `search`, which records `points` and `values` |
| Printed result | `best_point`, `best_value`, `evaluations`, `return_code` |

## What the Inputs of the Panel Default To

| Input | Default | Role |
|---|---|---|
| **Objective f(x)** | Six-hump camel | Expression in x[1], x[2] and so on |
| **Lower Bounds** | [−3.0, −2.0] | One per variable, its length sets the dimension |
| **Upper Bounds** | [3.0, 2.0] | One per variable |
| **Max Evaluations** | 1000 | The budget, and the only stopping rule set |

All four inputs apply to all tabs. Reaching the budget is normal here, so `MAXEVAL_REACHED` does not mean failure.

## What the Generated Code Fixes

| Item | Value |
|---|---|
| Starting point passed to `NLopt.jl` | Box centre, which these methods do not rely on |
| Initial splits in **QuadDirect** | Lower bound, midpoint and upper bound per coordinate |
| Polish in **Local Refinement** | `LN_BOBYQA`, `xtol_rel` 1e-10, up to 2000 evaluations |
| Separation in **Candidate Minima** | At least 10% of the box, up to 5 points |
| Boxes in **Box Perturbation Study** | Five shifts and scales |
| Budgets in **Budget Study** | 50 to 2000, six values |
| Step in **Solution Sensitivity** | 1% of each coordinate's range |

## What Each Next Step in the Panel Shows

| Action | Result |
|---|---|
| **Objective Landscape** | Heatmap over the first two variables |
| **Convergence Curve** | Best value against evaluations |
| **Search Points** | Every evaluated point on the contours |
| **Evaluation Budget** | Budget use, and when the best was reached |
| **Boundary Check** | Whether the best point is on a bound |
| **Box Perturbation Study** | Results under shifted and widened boxes |
| **Solution** | Point, value and return code |
| **Local Refinement** | Polished answer and gain |
| **Candidate Minima** | Distinct low points |
| **DIRECT Variants** | Five forms at one budget |
| **Deterministic vs Stochastic** | Against CRS2 and ISRES, five seeds |
| **Budget Study** | Quality as the budget grows |
| **Summary** | Result, box and dimension |
| **Solution Sensitivity** | Change in f for small moves |
| **Bounds Analysis** | Position in the box, and coverage |

## See Also

- [Overview](overview.md) · [DIRECT & DIRECT-L](direct.md) · [QuadDirect](quaddirect.md) · [AGS](ags.md)
