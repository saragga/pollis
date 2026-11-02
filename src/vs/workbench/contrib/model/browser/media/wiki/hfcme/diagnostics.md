# High-Frequency Covariance Diagnostics

A covariance matrix can look plausible and still be unusable for a portfolio or badly distorted by noise. A few checks show which problem you have and what to do about it.

## Is the matrix a valid covariance?

**Matrix Validity** reports `is_psd_matrix`, `valid_correlation_matrix` and the three smallest eigenvalues of `rho`. A negative eigenvalue means some portfolio has negative estimated variance, which is impossible for a real portfolio. An optimiser fed such a matrix may exploit exactly that portfolio.

**Pre-averaged** and **Two-Scales** build the matrix without any guarantee, so small negative eigenvalues are common with them, especially with many assets and few ticks. **Realized** and **Realized Kernel** should pass. Eigenvalues very close to zero on any tab mean a nearly redundant combination of assets, whose risk will be estimated poorly even though the matrix is formally valid.

## How noisy are these ticks?

**Microstructure Noise** reports per asset the noise variance ω² from a two-scales estimate, `vol_squared` and their ratio `noise_to_signal`. The ratio turns into a bias by hand. With n returns over T time units, the bias relative to integrated variance is 2(n / T) × `noise_to_signal`.

A ratio of 1 with one return per time unit gives 2 × 1 × 1 = 2, so naive realised variance would be about three times the true value. The sampling trade-off behind this calculation is worked out by [Aït-Sahalia, Mykland and Zhang (2005)](#ref-AMZ2005a). A large ratio is the signal to leave naive sampling behind and use a noise-robust tab. Because the ratio divides a per-tick noise variance by a variance per time unit, comparisons across assets are fair only at similar tick rates.

## Signature plots and the Epps effect

Two simple plots diagnose the same issues from the outside, though you must build them from your own data. A signature plot shows realised variance against sampling interval: a flat line at long intervals that rises sharply at short ones marks the arrival of noise, and the interval at which it flattens is a sensible lower limit for naive sampling.

The covariance version plots the realised correlation against sampling interval. A correlation that falls steadily as the interval shortens is the pattern [Epps (1979)](#ref-Epp1979a) reported. Seeing that pattern on the **Realized** results means asynchrony is at work, and an estimator built for asynchrony should be preferred.

## Do the estimators agree?

**All Five Estimators** runs `:simple_covariance`, `:bnhls_covariance`, `:spectral_covariance`, `:preaveraged_covariance` and `:two_scales_covariance`, and reports `calculate_mean_abs_distance`. On the simulated default the distance is measured to `true_covar`, so a smaller value means a truly better estimate.

On your own data no truth exists, and the distance is measured to the current `est`. A small value there shows agreement with the method you already chose, not accuracy, and that method always shows a distance of zero. Broad agreement among the noise-robust methods is reassuring. **Realized** standing apart from them points to noise or asynchrony.

## Does repair change the answer?

**Raw Against Regularised** applies `regularise` with `:nearest_correlation_matrix` and `:eigenvalue_clean`, then reports the `squared_frobenius_distance` of each to `rho`. Nearest-correlation repair finds the closest valid correlation matrix ([Higham (2002)](#ref-Hig2002a)), so it moves a slightly invalid matrix very little and leaves a valid one where it is.

Eigenvalue cleaning changes a valid matrix too, on purpose. A large distance from repair signals that the raw matrix was far from valid, and that its problem is probably too few ticks for the number of assets rather than a rounding effect.

## Is one asset starving the others?

**Trading Activity** prints `ticks_per_asset`. Tick counts that differ by a large factor warn that any synchronised sampling will reduce everything to the pace of the slowest asset, leaving few joint returns, and that **Two-Scales** picks its default K from that same slowest asset.

A remedy is to refit without the thin asset and compare the remaining correlations. If they change noticeably, the thin asset was dragging the estimate. Reporting that asset's relationships separately from a lower-frequency estimate is often a better answer than forcing all assets into one fit.

## References

<a id="ref-AMZ2005a"></a>Aït-Sahalia, Y., Mykland, P. A., & Zhang, L. (2005). How Often to Sample a Continuous-Time Process in the Presence of Market Microstructure Noise. *Review of Financial Studies* 18(2), 351-416. [doi:10.1093/rfs/hhi016](https://doi.org/10.1093/rfs/hhi016)

<a id="ref-Epp1979a"></a>Epps, T. W. (1979). Comovements in Stock Prices in the Very Short Run. *Journal of the American Statistical Association* 74(366a), 291-298. [doi:10.1080/01621459.1979.10482508](https://doi.org/10.1080/01621459.1979.10482508)

<a id="ref-Hig2002a"></a>Higham, N. J. (2002). Computing the Nearest Correlation Matrix: A Problem from Finance. *IMA Journal of Numerical Analysis* 22(3), 329-343. [doi:10.1093/imanum/22.3.329](https://doi.org/10.1093/imanum/22.3.329)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
