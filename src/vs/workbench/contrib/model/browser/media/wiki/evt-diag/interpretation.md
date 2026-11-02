# Interpretation

The outputs of the Extreme Value Diagnostics panel describe the shape of a tail and whether a threshold is defensible. They do not by themselves give a risk figure, and a tail estimate read from a single point of a plot carries more uncertainty than the plot shows.

## How to Read the Direction of a Mean Excess Plot

The direction of the straight part of a mean excess plot indicates the sign of the shape, through the slope xi / (1 − xi) that holds for xi under 1.

| Straight part of the plot | Shape xi | Tail |
|---|---|---|
| Rising | Above 0 | Heavy, of Pareto type |
| Flat | Near 0 | Exponential-like |
| Falling | Negative | Bounded on the right |

The printed **Mean excess at Q50**, **Q75** and **Q90** are three points of the same curve, and each says how far a loss goes past that level on average. They are in the units of the data. A rise from Q50 to Q90 alone does not show a heavy tail, because the lower levels may lie outside the tail.

## How to Read the Hill Estimate and the Tail Index Alpha

The **Hill Plot** tab prints xi and alpha = 1/xi at k = 10, 50 and 100, when those are under the number of positive losses. The three k values are fixed reference points and are not chosen by the data.

Alpha is the rate at which the tail falls: under a Pareto-type tail, moments of order under alpha are finite and moments of order above it are not. So alpha above 2 suggests a finite variance, and alpha under 1 an infinite mean. Such a statement carries the uncertainty of the estimate, whose standard error is roughly xi / sqrt(k) under the assumptions of the estimator. An estimate of alpha near 2 therefore cannot separate finite from infinite variance.

## How to Read Xi and the Modified Scale in Threshold Stability

**Threshold Stability** prints the modified scale sigma − xi u in place of sigma. If a GP holds above u, then at a higher threshold v the scale is sigma(v) = sigma(u) + xi (v − u). The scale itself therefore changes with the threshold whenever xi is not 0, while the modified scale does not. A rising raw scale is no warning. A drift in the modified scale is.

The printed n shows how much data each row uses. Rows with few excesses vary more, so a change in **xi_hat** at the highest threshold needs more evidence before it is treated as a real change.

## What the Shape Xi Says About Tail Behaviour

| Shape xi | Family member | Consequence |
|---|---|---|
| Above 0 | Fréchet type in the GEV, Pareto type in the GP | No upper bound; moments of order 1/xi and above do not exist |
| Near 0 | Gumbel type in the GEV, exponential in the GP | No upper bound; every moment exists |
| Negative | Weibull type in the GEV, bounded in the GP | An upper endpoint exists, at sigma / (−xi) above the threshold for the GP |

The **QQ Plot** tab prints **Shape xi** and scale sigma for the chosen fit. A small sample often cannot separate a small positive shape from 0.

## How to Read the Bends of an Extreme Value QQ Plot

The vertical axis of the **QQ Plot** holds the empirical quantiles and the horizontal axis the fitted ones. A point above the 45-degree line is a loss larger than the fit expects. An upward bend at the top means the tail of the data is heavier than the fitted tail, so tail quantiles from the fit would be too low. A downward bend means the reverse.

The last few points always scatter the most, since each is a single order statistic. One point off the line is weak evidence. A run of them in the same direction is stronger evidence, particularly with **GP**, where the fit should work best at the top.

## Common Misreadings of Extreme Value Diagnostics

- A QQ correlation near 1 is not evidence of a correct model, since sorted samples tend to give high correlation against almost any fitted quantiles.
- A straight mean excess plot does not prove a GP tail. It is a necessary sign under the model, not a sufficient one.
- A flat Hill stretch does not confirm a heavy tail. A positive Hill value is produced by any positive losses.
- The default threshold is a starting value and has no special status.
- The panel's plots describe the past sample. They do not give the chance that a larger loss will occur.

## See Also

- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
