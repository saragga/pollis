# Decision Guide

| Situation | Method |
|---|---|
| Symmetric dependence, no joint extremes | **Gaussian** |
| Symmetric, joint extremes in both tails | **Student's t** |
| Joint crashes, lower tail | **Clayton** |
| Joint peaks, upper tail | **Gumbel** or **Joe** |
| Both tails, asymmetrically | **BB1** |
| Symmetric, no tails, negative dependence allowed | **Frank** |
| Weak dependence only | **AMH** |
| Componentwise maxima | **Extreme value** copulas |
| Common shocks, simultaneous events | **Marshall-Olkin** |
| No family assumed | **Empirical**, Beta or Bernstein |

## Decision Flow

1. **Plot the pseudo-observations**: which corners are dense?
2. **Shortlist** the families with the right tails and symmetry.
3. **Fit with pseudo-observations** unless the margins are well established.
4. **Compare by AIC** and check the bootstrap goodness of fit.
5. **Check the tails**: tail dependence and joint exceedances, data against model.

## Rules of Thumb

- **Never default to Gaussian** for joint risk: it has no tail dependence.
- **Pseudo-observations** when unsure of the margins.
- **Rank inversion** for a quick, robust start; maximum likelihood for efficiency.
- **Filter time series** before fitting.
- **Several hundred observations** before trusting tail estimates.
- **In d > 2**, one-parameter Archimedean copulas impose equal dependence on all pairs; vines relax that.

## See Also
- [Factsheet](factsheet.md) · [Elliptical Copulas](elliptical.md) · [Archimedean Copulas](archimedean.md)
