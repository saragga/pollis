# Interpretation

The result is the lowest value seen in a fixed budget, at a point in the box. It is strong evidence of a good solution, and it is not a proof of the global minimum.

## How to Read the Printed Result

The tab prints `best_point`, `best_value`, `evaluations` and `return_code`. `best_value` is an upper limit on the true minimum. `return_code` of `MAXEVAL_REACHED` means that the budget ran out, which is the normal way for these methods to stop. On the default problem, the known minimum is −1.0316 at either of two points, so that its gap can be read directly. Precision is often only a few digits, because the methods do not refine aggressively, and that does not signal failure.

## How to Read the Landscape and the Search

**Objective Landscape** shows f as a heatmap over the first two variables. Other variables are held at their best values, so that it is a slice, and it can hide other basins. **Search Points** shows where the method spent its evaluations. A good pattern is a broad scatter, with tight clusters at the minima. On the default function, clusters at both global minima show that the method explored both, even though it reports only one.

## How to Read the Convergence Curve

The curve falls in steps as new best values appear. A late, sudden fall indicates that a better basin was found late, so that a shorter budget would have missed it. A smooth, slow fall at the end indicates refinement in a single basin. Curves from different tabs can be compared by evaluations, on the same box. Since these methods reach good regions at different times, a comparison at one budget may reverse at another, as **Budget Study** can show.

## How to Read Multiple Candidates

**Candidate Minima** lists distinct low points. Two entries with nearly equal values may be two real global minima, as with the default function, or a minimum and a near tie. Practically, near ties are useful, because they offer alternatives when a constraint arises later. Entries are samples, so their values are only rough until polished. An entry close to the 10% separation limit may just be the slope of the same basin, so look at its position on the landscape before counting it as a separate minimum.

## How to Read the Sensitivity Table

**Solution Sensitivity** reports the change in f for a move of 1% of each range, up and down. Large increases show a sharp basin, in which the location matters. Small changes show a flat basin, where nearby choices are nearly equal, which is often useful in design. A negative change means that the point is not yet a local minimum at this resolution. Different sizes across coordinates show which variables matter most near the solution. Only one coordinate moves at a time, so that combined moves can behave differently.

## What the Results Do Not Say

A finite run cannot prove global optimality, and a repeat gives the same answer without adding evidence. A method that leads on one problem may trail on another, and certified bounds need stronger assumptions on the objective, as in the methods of [Floudas (2000)](#ref-Flo2000a). Results reflect a chosen box, and an evaluation budget of a chosen size. Report these, and treat claims of a global minimum as well-supported guesses.

## References

<a id="ref-Flo2000a"></a>Floudas, C. A. (2000). *Deterministic Global Optimization*. Springer. [doi:10.1007/978-1-4757-4949-6](https://doi.org/10.1007/978-1-4757-4949-6)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
