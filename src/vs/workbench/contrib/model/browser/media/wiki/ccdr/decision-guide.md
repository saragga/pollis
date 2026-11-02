# Decision Guide

The main choice is how much trust to place in a distribution. Others follow from the amount of data and from what failure really costs.

## Which Formulation Fits the Situation

| Situation | Choice | Why |
|---|---|---|
| Plenty of data, shape believed normal | **Chance-Constrained** | Simple and cheap, and not over-protected |
| Few data, shape unknown | **Distributionally Robust** | Protection for the unknown shape |
| No probabilistic information, hard limits | Box robust | Holds across a whole set |
| Failure is cheap and data are good | Nominal, or a loose epsilon | Protection adds little |
| Several joint constraints | Sample-based or CVaR forms | Normal form covers one constraint |

## When to Use Reliability or Worst-Case Thinking

Use a chance constraint when occasional failure is acceptable, and when its frequency is what matters, as with service levels. Use a robust plan when failure is unacceptable, as with safety limits, and accept the higher cost. [Ben-Tal, El Ghaoui and Nemirovski (2009)](#ref-BGN2009a) develop that second view. Use a distributionally robust plan when failure is acceptable in principle, but the distribution is doubtful. The cost of being wrong should drive the choice, and a cost that rises sharply with size of failure argues for CVaR.

## How to Choose epsilon

Start from what failure costs, or from a stated service level. A value such as 0.05 is a convention, not a law. **Epsilon Sweep** shows the trade-off for a given problem, and it often reveals a point beyond which further reliability costs a lot. Very small values rely heavily on tail assumptions that data cannot support, so a value of 0.001 from 100 samples means little. **Chance-Constrained** rests on the normal for that tail, and **Distributionally Robust** on very few samples in it, as only about epsilon n of them count.

## How to Choose the Radius

Try a range on a log scale, and use **Reliability** or a held-out sample to pick the smallest value that gives the desired failure rate. Compare it to the scale of xi, so a radius near the standard deviation is very large. Shrink it as data grow. Theory by [Mohajerin Esfahani and Kuhn (2018)](#ref-EK2018a) ties the radius to n, and it is a useful guide for the rate. Practical values come from data. Do not choose it by the profit it gives, as that always favours a smaller radius.

## When to Use Other Reformulations

For non-normal data with many samples, a sample-based form is more direct: it allows at most epsilon n scenarios to fail, as studied by [Luedtke and Ahmed (2008)](#ref-LA2008a), and it needs binaries, which HiGHS can solve. For a convex alternative, the CVaR constraint at theta = 0 is simple and safe, if conservative, as [Nemirovski and Shapiro (2006)](#ref-NS2006a) discuss. For mean and covariance knowledge alone, a moment set gives a closed form, covered in the notebook. Try the simplest form that meets the requirement first.

## What to Report from a Reliability Study

Report epsilon, n, the theta if any, and the assumptions on xi. Show realised failure rates from held-out data with spread across repeated samples, as one number is not enough. State profit against a baseline, so that the reader sees the cost of protection. Report overflow, as well as frequency, as failures are not all equal. Note that a guarantee for one constraint does not hold for a group of constraints taken together. Results are specific to the example's costs and capacity.

## References

<a id="ref-BGN2009a"></a>Ben-Tal, A., El Ghaoui, L. and Nemirovski, A. (2009). *Robust Optimization*. Princeton University Press. [doi:10.1515/9781400831050](https://doi.org/10.1515/9781400831050)

<a id="ref-LA2008a"></a>Luedtke, J. and Ahmed, S. (2008). A sample approximation approach for optimization with probabilistic constraints. *SIAM Journal on Optimization* 19(2), 674–699. [doi:10.1137/070702928](https://doi.org/10.1137/070702928)

<a id="ref-EK2018a"></a>Mohajerin Esfahani, P. and Kuhn, D. (2018). Data-driven distributionally robust optimization using the Wasserstein metric. *Mathematical Programming* 171(1–2), 115–166. [doi:10.1007/s10107-017-1172-1](https://doi.org/10.1007/s10107-017-1172-1)

<a id="ref-NS2006a"></a>Nemirovski, A. and Shapiro, A. (2006). Convex approximations of chance constrained programs. *SIAM Journal on Optimization* 17(4), 969–996. [doi:10.1137/050622328](https://doi.org/10.1137/050622328)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Chance-Constrained](chance-constrained.md) · [Distributionally Robust](dro.md)
