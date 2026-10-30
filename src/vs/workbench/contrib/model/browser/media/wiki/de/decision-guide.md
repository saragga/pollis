# Decision Guide

| Situation | Method |
|---|---|
| A first look at the data, counts per range | **Histogram** |
| A smooth shape, possibly with several modes | **Kernel Density** |
| A known family, small sample, or a model for simulation | **Parametric** |
| Counts, proportions or categories | **Parametric** with a discrete family |
| Extremes and tails | Parametric GEV or Generalized Pareto, or the Extreme Value panels |
| More than two variables | A parametric multivariate family, or a copula |

## Decision Flow

1. **Start with a histogram** to see the shape.
2. **Smooth it with a kernel**, checking the bandwidth against cross-validation.
3. **If the shape suggests a family**, fit it and compare candidates by AIC.
4. **Check the fit** with the CDF comparison and the KS test.
5. **If no family fits**, keep the kernel estimate.

## Rules of Thumb

- **Bins**: Freedman-Diaconis for skewed or heavy-tailed data, Scott for nearly normal data.
- **Bandwidth matters, the kernel hardly**: try half and twice the default.
- **Silverman oversmooths** multimodal data: prefer cross-validation there.
- **A Normal fit is a summary**, not a description, of skewed or multimodal data.
- **Positive data**: LogNormal, Gamma or Weibull before Normal.
- **Fewer than about 50 observations**: prefer a parametric family.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
