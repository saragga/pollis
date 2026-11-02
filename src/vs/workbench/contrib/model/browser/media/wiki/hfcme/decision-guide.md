# Choosing a High-Frequency Covariance Estimator

The right tab depends on how noisy the data are, how unevenly the assets trade and what the matrix will be used for.

## Quick choices by situation

| Situation | Reasonable tab | Reason |
|---|---|---|
| Need a matrix that feeds an optimiser directly | **Realized Kernel** | Positive semi-definite by construction, robust to noise and asynchrony |
| Liquid assets and a quick first look | **Realized** | Fast, simple, valid matrix |
| Noise is the main worry and assets trade at similar rates | **Two-Scales** or **Pre-averaged** | Noise correction uses the ticks more fully |
| Very different trading rates | **Pre-averaged** | Works on overlapping intervals rather than a common grid |
| Unsure | **All Five Estimators** on the simulated default, then on your data | Shows how far the methods differ |

## Realized for speed, with its limits

**Realized** is the benchmark: sums of outer products of log-returns on a common grid. Its theory is simple and its matrix is always valid. It needs a sampling interval long enough for noise to fade, and that throws away most of the ticks.

Pick it when assets are very liquid and a coarse grid still leaves many returns. Leave it when **Microstructure Noise** reports a high `noise_to_signal`, or when correlations on it fall well below those of the other tabs.

## Pre-averaged and the choice of theta

**Pre-averaged** smooths tick returns over a window of k = theta × √(number of ticks) ticks before forming products, so noise shrinks through local averaging. Its overlap rule descends from the Hayashi-Yoshida estimator, which sums products of all overlapping return intervals without any synchronisation ([Hayashi and Yoshida (2005)](#ref-HY2005a)). The panel's window follows [Christensen, Podolskij and Vetter (2013)](#ref-CPV2013a).

A larger **Pre-averaging Window (theta)** smooths more noise but leaves fewer effective returns. Keep 0.15 to start, then try 0.1 and 0.3: with 10,000 ticks those give windows of 10 and 30. Estimates that barely move with theta are a good sign. A matrix that fails **Matrix Validity** needs regularising before use.

## Two-Scales and the number of sub-grids

**Two-Scales** averages realised covariance across K sub-sampled grids, then subtracts (n̄ / n) times the all-ticks estimate, where n̄ is the average returns per sub-grid. The noise bias is 2n̄ω² in the first term and 2nω² in the second, so the scaling cancels it ([Zhang, Mykland and Aït-Sahalia (2005)](#ref-ZMA2005a)).

A larger **Sub-grids (K)** reduces noise further but leaves less signal per grid. Blank is fine at first. An explicit K deserves a check at half and double its value, and a result that moves a lot with K suggests too few ticks. The convergence rate of the original estimator is n^(1/6), slow compared with the rival methods.

## Realized Kernel and the bandwidth

**Realized Kernel** weighs autocovariance matrices up to lag H with Parzen weights, which keep the matrix positive semi-definite, on refresh-time returns. Its convergence rate is n^(1/5) in its positive semi-definite form ([Barndorff-Nielsen, Hansen, Lunde and Shephard (2011)](#ref-BHLS2011a)).

The cost comes from refresh-time sampling, which reduces every asset to the pace of the slowest. The default bandwidth grows as (mean ticks per asset)^0.6: at 2,500 ticks per asset, 2,500^0.6 ≈ 109 before the constant c*. A larger **Kernel Bandwidth (H)** captures more lead-lag structure but raises variance. Leave it blank unless you have a reason to do otherwise, and compare at half and double the default if you do set one.

## Repair or re-estimate

A matrix that fails **Matrix Validity** has two remedies, compared in **Raw Against Regularised**. `:nearest_correlation_matrix` makes the smallest change that restores validity, using the projection method of [Higham (2002)](#ref-Hig2002a), and suits a matrix that is only slightly invalid.

`:eigenvalue_clean` treats the eigenvalues that fall inside the range expected from pure noise as uninformative ([Laloux, Cizeau, Bouchaud and Potters (1999)](#ref-LCBP1999a)). With N assets and T returns that range runs from (1 − √(N/T))² to (1 + √(N/T))²: for N = 4 and T = 2,500, from 0.92 to 1.08. Prefer it for many assets and few returns. A badly invalid matrix calls for a switch of tab or a longer window before any repair.

## Where the fifth estimator fits

**All Five Estimators** also runs `:spectral_covariance`, which has no tab of its own. Spectral methods work with local frequency-domain averages of the noisy returns, and they can reach high efficiency in theory ([Bibinger, Hautsch, Malec and Reiß (2014)](#ref-BHMR2014a)).

Treat it here as an extra voice in the comparison. If it agrees with **Realized Kernel** and **Pre-averaged**, the estimate is on firmer ground. If your own analysis settles on it, carry the code from that action into your script and call `estimate_covariance` with the symbol directly.

## References

<a id="ref-BHLS2011a"></a>Barndorff-Nielsen, O. E., Hansen, P. R., Lunde, A., & Shephard, N. (2011). Multivariate Realised Kernels: Consistent Positive Semi-Definite Estimators of the Covariation of Equity Prices with Noise and Non-Synchronous Trading. *Journal of Econometrics* 162(2), 149-169. [doi:10.1016/j.jeconom.2010.07.009](https://doi.org/10.1016/j.jeconom.2010.07.009)

<a id="ref-BHMR2014a"></a>Bibinger, M., Hautsch, N., Malec, P., & Reiß, M. (2014). Estimating the Quadratic Covariation Matrix from Noisy Observations: Local Method of Moments and Efficiency. *The Annals of Statistics* 42(4), 1312-1346. [doi:10.1214/14-AOS1224](https://doi.org/10.1214/14-AOS1224)

<a id="ref-CPV2013a"></a>Christensen, K., Podolskij, M., & Vetter, M. (2013). On Covariation Estimation for Multivariate Continuous Itô Semimartingales with Noise in Non-Synchronous Observation Schemes. *Journal of Multivariate Analysis* 120, 59-84. [doi:10.1016/j.jmva.2013.05.002](https://doi.org/10.1016/j.jmva.2013.05.002)

<a id="ref-HY2005a"></a>Hayashi, T., & Yoshida, N. (2005). On Covariance Estimation of Non-Synchronously Observed Diffusion Processes. *Bernoulli* 11(2), 359-379. [doi:10.3150/bj/1116340299](https://doi.org/10.3150/bj/1116340299)

<a id="ref-Hig2002a"></a>Higham, N. J. (2002). Computing the Nearest Correlation Matrix: A Problem from Finance. *IMA Journal of Numerical Analysis* 22(3), 329-343. [doi:10.1093/imanum/22.3.329](https://doi.org/10.1093/imanum/22.3.329)

<a id="ref-LCBP1999a"></a>Laloux, L., Cizeau, P., Bouchaud, J.-P., & Potters, M. (1999). Noise Dressing of Financial Correlation Matrices. *Physical Review Letters* 83(7), 1467-1470. [doi:10.1103/PhysRevLett.83.1467](https://doi.org/10.1103/PhysRevLett.83.1467)

<a id="ref-ZMA2005a"></a>Zhang, L., Mykland, P. A., & Aït-Sahalia, Y. (2005). A Tale of Two Time Scales: Determining Integrated Volatility With Noisy High-Frequency Data. *Journal of the American Statistical Association* 100(472), 1394-1411. [doi:10.1198/016214505000000169](https://doi.org/10.1198/016214505000000169)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
