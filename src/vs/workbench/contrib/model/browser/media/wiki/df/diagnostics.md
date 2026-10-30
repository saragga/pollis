# Diagnostics

## Check the Targets Are Met
**Check the Targets Are Met** lists, for each family and each target, the target and the value the built distribution achieves: its mean, variance, quantiles, support. They should agree to numerical precision. A gap means the solver did not converge, which can happen for targets at the edge of the family's feasible region.

## Sensitivity to the Targets
**Sensitivity to the Targets** multiplies each numeric target by 0.9 and 1.1 in turn and solves again. With Moments, it prints the new parameters, or "infeasible"; with Discover, the families still feasible. Parameters that move a lot for a 10% change in a target mean the distribution is fragile: a shape parameter near a boundary, such as a Gamma shape near 0.

## Density of the Matched Distribution
**Density of the Matched Distribution** plots the density, or the probability mass as sticks for discrete families, over its central 99%. With Discover, all feasible families are drawn together: the same targets, visibly different shapes.

## CDF With Quartiles
**CDF With Quartiles** plots the CDF, with the quartiles dashed for Moments. Quartile targets can be read off directly.

## Simulate From the Distribution
**Simulate From the Distribution** draws 10,000 values and compares their mean, variance and quartiles with the distribution's. The sample values should be close; heavy-tailed families show larger gaps in the variance, which converges slowly.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Targets met | Exact agreement | Gaps |
| Sensitivity | Parameters move smoothly | Infeasible or large jumps |
| Density | Plausible shape and support | Mass where impossible |
| Simulation | Close to the targets | Variance far off |
| Families | Several feasible | Only one, or none |

## See Also
- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
