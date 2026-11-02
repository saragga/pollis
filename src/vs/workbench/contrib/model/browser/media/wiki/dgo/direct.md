# DIRECT & DIRECT-L

DIRECT stands for dividing rectangles. It splits the box into smaller and smaller boxes, and it chooses which ones to split with no need to know a Lipschitz constant.

## How the Box Is Divided

DIRECT scales the box to a unit cube, and evaluates f at its centre. At each round, it picks some boxes and trisects them along their longest sides, evaluating the centres of the two new outer pieces. Each side divided needs two new evaluations. Smaller boxes around good values appear over time, and large boxes remain elsewhere. [Jones, Perttunen and Stuckman (1993)](#ref-JPS1993a) gave the method, and their title states its point: Lipschitzian optimisation without the Lipschitz constant.

## How Boxes Are Chosen for Splitting

Plot each box as a point, with its size d and its centre value f. A box is potentially optimal if some K > 0 makes its lower limit f − K d the lowest of all:

- A low value and a small box suit a small K, which is local search.
- A large box suits a large K, which is global search.

Such boxes lie on the lower right of the convex hull of the points. All of them are split in the round, so the method never has to pick one K. A small term based on the current best value prevents splitting boxes that offer only a tiny gain.

## What DIRECT Can Guarantee

Large boxes keep getting split, so that the samples become dense in the box. For a function continuous near its minimum, the best value therefore converges to the global minimum as evaluations grow. No bound on the error is available at a finite budget, and no stopping test certifies the answer. The price of that coverage is effort: many boxes are split in each round, and refinement near the optimum is slow. A polish from **Local Refinement** usually gains digits at low cost.

## How DIRECT-L Biases the Search

[Gablonsky and Kelley (2001)](#ref-GK2001a) designed the locally biased form for functions with a few local minima. It makes two changes:

| Change | Effect |
|---|---|
| Measures size by the longest side, not the diagonal | Fewer distinct sizes, so fewer groups |
| Splits at most one box of each size per round | Fewer splits for each round |

The result concentrates on good boxes sooner, and it saves evaluations. Its risk is that a narrow global basin can be reached later. **DIRECT-L** then suits expensive objectives with few minima.

## Which Variants NLopt Offers

| Name | Meaning |
|---|---|
| `GN_DIRECT` | Original rule, NLopt's own implementation |
| `GN_DIRECT_L` | Locally biased |
| `GN_DIRECT_L_RAND` | Locally biased, with some randomness in choosing the longest side |
| `GN_ORIG_DIRECT` | Gablonsky's original implementation |
| `GN_ORIG_DIRECT_L` | The same, locally biased |

**DIRECT Variants** runs all five at one budget. The randomised form is not strictly deterministic, and implementations differ in details, so that small differences need not reflect the theory.

## Where DIRECT Is Strong and Weak

The family needs no settings beyond the budget, and no starting point, and repeating a run repeats the answer. Up to about 10 variables, it is often effective on black-box functions. In more dimensions, boxes must be split along many sides before they shrink, and the search then behaves like a coarse grid. The symmetric sampling can also be fooled by a function whose minimum is far from any box centre for a long time. Bounds that are too wide waste evaluations in proportion to volume.

## References

<a id="ref-GK2001a"></a>Gablonsky, J. M. and Kelley, C. T. (2001). A locally-biased form of the DIRECT algorithm. *Journal of Global Optimization* 21(1), 27–37. [doi:10.1023/A:1017930332101](https://doi.org/10.1023/A:1017930332101)

<a id="ref-JPS1993a"></a>Jones, D. R., Perttunen, C. D. and Stuckman, B. E. (1993). Lipschitzian optimization without the Lipschitz constant. *Journal of Optimization Theory and Applications* 79(1), 157–181. [doi:10.1007/BF00941892](https://doi.org/10.1007/BF00941892)

## See Also

- [Factsheet](factsheet.md) · [QuadDirect](quaddirect.md) · [AGS](ags.md) · [Decision Guide](decision-guide.md)
