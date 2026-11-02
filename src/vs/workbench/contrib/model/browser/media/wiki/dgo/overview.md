# Overview

Deterministic global optimisation searches a box for the lowest value of a function, using only function values and following fixed rules. The same inputs always give the same run, and the search balances wide coverage against refinement.

## What the Methods Aim to Do

A local method follows the landscape downhill and stops in the nearest basin. A global method must also look elsewhere, and so it spends evaluations on regions that may contain nothing. The panel's methods sample systematically, with no random numbers and no starting point. Their guarantees hold only in the limit, as evaluations grow. [Floudas (2000)](#ref-Flo2000a) describes the wider field, in which some methods also give certified bounds, whereas the panel's methods do not.

## How the Lipschitz Idea Helps

If f cannot change faster than a constant L times the distance, then a sampled value gives a lower limit on f nearby:

- f(x) ≥ f(c) − L ‖x − c‖

That limit can show that a region cannot hold the minimum. [Piyavskii (1972)](#ref-Piy1972a) and [Shubert (1972)](#ref-Shu1972a) built one-dimensional methods on it. The practical trouble is that L is unknown. Each tab has its own way of avoiding it, or of estimating it.

## How the Four Tabs Differ

| Tab | Idea | Software |
|---|---|---|
| **DIRECT** | Split all boxes that could be best for some L | `NLopt.jl`, `GN_DIRECT` |
| **DIRECT-L** | Same, with fewer boxes per round | `NLopt.jl`, `GN_DIRECT_L` |
| **QuadDirect** | Coordinate splits with quadratic models | `QuadDIRECT.jl` |
| **AGS** | One-dimensional search along a Peano curve | `NLopt.jl`, `GN_AGS` |

## Which Problem the Panel Solves by Default

The default **Objective f(x)** is the six-hump camel function, on [−3, 3] × [−2, 2]. It has two global minima near (0.09, −0.71) and (−0.09, 0.71), with f = −1.0316, plus other local minima. The function is symmetric through the origin, so both global minima have the same value. The box centre, where these methods tend to start, is not a minimum. **Lower Bounds** and **Upper Bounds** set both the box and the dimension.

## A Common Workflow for a New Objective

1. Run a tab, and read `best_value` and `return_code`.
2. Look at **Objective Landscape** and **Search Points** in two dimensions.
3. Check **Convergence Curve** and **Evaluation Budget**.
4. Polish the result with **Local Refinement**.
5. Look for other basins with **Candidate Minima**.
6. Test the box with **Box Perturbation Study** and **Boundary Check**.

The order matters little, although a polish means more once the basin is settled.

## References

<a id="ref-Flo2000a"></a>Floudas, C. A. (2000). *Deterministic Global Optimization*. Springer. [doi:10.1007/978-1-4757-4949-6](https://doi.org/10.1007/978-1-4757-4949-6)

<a id="ref-Piy1972a"></a>Piyavskii, S. A. (1972). An algorithm for finding the absolute extremum of a function. *USSR Computational Mathematics and Mathematical Physics* 12(4), 57–67. [doi:10.1016/0041-5553(72)90115-2](https://doi.org/10.1016/0041-5553(72)90115-2)

<a id="ref-Shu1972a"></a>Shubert, B. O. (1972). A sequential method seeking the global maximum of a function. *SIAM Journal on Numerical Analysis* 9(3), 379–388. [doi:10.1137/0709036](https://doi.org/10.1137/0709036)

## See Also

- [Factsheet](factsheet.md) · [DIRECT & DIRECT-L](direct.md) · [QuadDirect](quaddirect.md) · [AGS](ags.md)
