# Multilevel Monte Carlo — Quasi-Monte Carlo Extension

Multilevel quasi-Monte Carlo keeps the ladder of levels and changes how the points on each level are chosen. [Giles and Waterhouse (2009)](#ref-GW2009a) put rank-1 lattice rules with random shifts on the levels of a path simulation, and the **MLQMC** tab uses the same kind of rule.

## What Multilevel Quasi-Monte Carlo Computes

Each level l uses M random shifts, set by **n Shifts**, with N_l lattice points per shift. For shift m, the mean of D_l over the points gives one estimate, and the level's estimate is the mean over shifts:

Y_l = (1/M) sum for m = 1 to M of (1/N_l) sum for k = 1 to N_l of D_l(x_k,m)

The sum of Y_l over levels gives the final estimate. The shifts are independent between levels, so the variances of the levels add.

## How a Randomly Shifted Lattice Rule Works

A rank-1 lattice takes the points x_k = frac(k z / N + s), where z is a fixed generating vector, s is a random shift in the unit cube, and frac keeps the fractional part. [Cranley and Patterson (1976)](#ref-CP1976a) introduced the random shift, which makes each mean unbiased and lets independent shifts give an error estimate. In the package, `LatticeRule32` holds a generating vector for up to 3600 dimensions and produces an extensible sequence, so points can be added without discarding those already used. Inputs pass through the inverse normal distribution function to become normal draws.

## How the MLQMC Tab Estimates and Controls Its Error

The estimator variance on level l is the sample variance of the M shift means divided by M, and the panel's total is the sum over levels. While this total exceeds theta eps^2, the package picks the level with the largest variance per unit cost and multiplies its points by 1.2. The package notes this factor as a practical choice in place of the factor of 2 that theory supports. No formula like the one for **MLMC** applies, as the error no longer falls like N^(-1/2).

## What the Inputs of the MLQMC Tab Do

| Input | Effect on **MLQMC** |
|---|---|
| **n Shifts** | Replicates per level, with a cost in direct proportion and a steadier error estimate |
| **Max Level** | Finest level, and also the dimension for **GBM Call Option**, at 2^l coordinates on level l |
| **Relative Tolerance** | Target RMSE, with the same meaning as on **MLMC** |
| **Seed** | Draws the random shifts, while the generating vector stays fixed |

## Where the MLQMC Tab Gains and Where It Does Not

The gain is largest on levels with a smooth integrand and few important dimensions, which is why **Random Integral**, with one input, suits it. Kinks and discontinuities reduce the gain. Fine levels of a path simulation have many inputs of about equal importance, and the code feeds Brownian increments in time order, with no bridge construction to concentrate the variance. So **GBM Call Option** tests a hard case. Conditions for a proved gain, which do not cover these two problems as such, exist for lognormal diffusion problems in the analysis of [Kuo, Scheichl, Schwab, Sloan and Ullmann (2017)](#ref-KSSSU2017a).

## Which Multilevel Next Steps Measure the Effect of the Lattice

The gain of the lattice shows in the estimator variance and in the total cost of a run. **Confidence Interval** reports the first, from the spread across the shifts. **Multilevel vs Single Level** sets the cost of the run against a single level sampled the same way, at the same finest level and tolerance. A run on each tab at one **Relative Tolerance** and one **Problem** gives the direct comparison between independent samples and the lattice, since the levels and `sample_fn` are the same on both tabs.

## References

<a id="ref-CP1976a"></a>Cranley, R. and Patterson, T. N. L. (1976). Randomization of number theoretic methods for multiple integration. *SIAM Journal on Numerical Analysis* 13(6), 904–914. [doi:10.1137/0713071](https://doi.org/10.1137/0713071)

<a id="ref-GW2009a"></a>Giles, M. B. and Waterhouse, B. J. (2009). Multilevel quasi-Monte Carlo path simulation. *Advanced Financial Modelling*, 165–182. [doi:10.1515/9783110213140.165](https://doi.org/10.1515/9783110213140.165)

<a id="ref-KSSSU2017a"></a>Kuo, F. Y., Scheichl, R., Schwab, C., Sloan, I. H. and Ullmann, E. (2017). Multilevel quasi-Monte Carlo methods for lognormal diffusion problems. *Mathematics of Computation* 86(308), 2827–2860. [doi:10.1090/mcom/3207](https://doi.org/10.1090/mcom/3207)

## See Also

- [Overview](overview.md) · [MLMC Algorithm](mlmc-algorithm.md) · [Decision Guide](decision-guide.md)
