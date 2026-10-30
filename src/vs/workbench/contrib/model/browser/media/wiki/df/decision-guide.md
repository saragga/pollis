# Decision Guide

| Situation | Method |
|---|---|
| The family is known; its parameters must match given statistics | **Moments** |
| Only the statistics are known; which families fit them? | **Discover** |
| Symmetric, unbounded | Normal, Logistic, Laplace, TDist for heavier tails |
| Positive, right-skewed | Gamma, LogNormal, Weibull |
| Proportions on [0, 1] | Beta |
| Counts | Poisson; NegativeBinomial if over-dispersed, Binomial if bounded |
| Expert judgement as a range | Two quantiles, e.g. [(0.05, a), (0.95, b)] |

## Decision Flow

1. **State what is known**: the moments, the quantiles and the support.
2. **Run Discover** with those constraints to see which families qualify.
3. **Choose a family** from knowledge of the quantity, not from the list alone.
4. **Build it with Moments** and check the targets are met.
5. **Compare the tails** across feasible families if the decision depends on them.

## Rules of Thumb

- **Give the support** whenever the quantity cannot be negative or is bounded.
- **Quantiles over moments** for expert judgement: people state ranges better than variances.
- **Report several families** when the tails matter.
- **cv near 1** suggests Exponential or Gamma near shape 1; **cv much below 1**, a near-normal shape.
- **Over-dispersed counts** (variance above the mean) rule out Poisson.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
