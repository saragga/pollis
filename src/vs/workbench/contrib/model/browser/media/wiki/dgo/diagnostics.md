# Diagnostics

Without a stopping test or certificate, the checks ask how the search behaved, how the result changes under a different box or budget, and whether the answer holds locally.

## How to Read the Search Points

**Search Points** draws every evaluation on the contours of f, for the first two variables. Dense clusters show where the search refined, and a sparse scatter elsewhere shows its coverage. Clusters should sit in the low basins. A large unsampled region on the box means that the search has never looked there. In more than two dimensions, the picture holds the other variables at the best point for the contours, while it projects the samples, so that they need not line up exactly.

## How to Read the Budget Figures

**Convergence Curve** shows a falling stairs shape. Long flat stretches are normal, since the method is also exploring. **Evaluation Budget** gives the point at which the final best value was first reached, and its share of the budget. A late hit suggests that more budget may help. An early hit is reassuring, though the search may have stopped improving through lack of precision. `MAXEVAL_REACHED` is the normal code, and on **QuadDirect**, the code always sets that value.

## How to Test Budget Sensitivity

**Budget Study** reruns at budgets from 50 to 2000, and prints the gap to and the distance from the current answer. Values should improve with the budget, with falling returns. A large drop between two budgets suggests that a basin was found only at the higher budget, so that more may still come. A gap can be negative at budgets above **Max Evaluations**, since the reference is the current run. The reference is not the true minimum, so a small gap does not establish global success.

## How to Test the Box Dependence

**Box Perturbation Study** shifts and widens the box in five ways, and reports each best value, each point and each distance to the original. Stable values suggest that the result is real. With the default function, the point can jump between the two global minima, with `distance_to_original` large and the value unchanged, which is a sign of symmetry and not of failure. A change in value is more serious. It shows that the budget, or the positions of the samples, decides the result.

## How to Check the Answer Locally

**Solution Sensitivity** moves each coordinate by 1% of its range, and reports the change in f. All increases support a local minimum at that resolution, although a small basin can fit within such a step. **Local Refinement** polishes with BOBYQA, and prints the gain. A tiny gain means that the method had already reached the bottom, and a large gain only means that it stopped early in the right basin. **Boundary Check** reports any coordinate on a bound. Widen the box if one appears.

## How to Check for Other Basins

**Candidate Minima** lists up to 5 low points at least 10% of the box apart. Those are samples, and not exact minima, so a polish from each one can reveal their real values. Close values suggest near-ties, which matter in practice. **Deterministic vs Stochastic** runs CRS2 and ISRES at the same budget. A stochastic method beating a deterministic one is a warning that a basin was missed. For a costly objective, a surrogate method such as that of [Jones, Schonlau and Welch (1998)](#ref-JSW1998a) is another useful cross-check.

## References

<a id="ref-JSW1998a"></a>Jones, D. R., Schonlau, M. and Welch, W. J. (1998). Efficient global optimization of expensive black-box functions. *Journal of Global Optimization* 13(4), 455–492. [doi:10.1023/A:1008306431147](https://doi.org/10.1023/A:1008306431147)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
