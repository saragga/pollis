# Surrogate Testing

A surrogate is an artificial series that keeps some properties of the data and destroys the rest. Comparing a statistic on the data with its values on surrogates tests whether the destroyed properties matter.

## How the Test Works

[Theiler, Eubank, Longtin, Galdrikian and Farmer (1992)](#ref-TELGF1992a) set out the method. State a null hypothesis, generate many series that fit it, and compute a statistic on the data and on each surrogate. If the data value lies outside the surrogate distribution, the null is rejected. The approach builds its null distribution from the data, with no need for a formula, and it can use any statistic. In the code, the statistic is permutation entropy.

## Which Nulls the Panel Offers

| Method | Keeps | Destroys | Null |
|---|---|---|---|
| `RandomShuffle` | Value distribution | All time order | Independent draws |
| `RandomFourier` | Power spectrum | Value distribution and phases | Linear Gaussian process |
| `IAAFT` | Distribution, spectrum closely | Nonlinear phase structure | Monotonic transform of a linear Gaussian process |

Rejecting a shuffle null only shows time dependence. Rejecting a Fourier null may just reflect a non-Gaussian shape. `IAAFT`, from [Schreiber and Schmitz (1996)](#ref-SS1996a), keeps both properties through iteration, and so it is the more useful test of nonlinearity.

## How the p-Value Is Computed

The code counts surrogates at or below the observed entropy:

- p = (1 + count(null ≤ obs)) / (1 + number of surrogates)

Adding 1 counts the data as one possible draw, so that p is never 0.

| Surrogates | Smallest p | Used by |
|---|---|---|
| 99 | 0.01 | **Surrogate Testing** |
| 199 | 0.005 | **Multiple Surrogates** |
| 999 | 0.001 | **Nonlinearity Test** |

The test is one-sided, on the view that structure lowers permutation entropy.

## What a Rejection Means

A low p says that the data have less ordinal entropy than the null allows. That can reflect nonlinear determinism, and it can also reflect non-stationarity, a non-Gaussian shape, or differences between end points of the series. Fourier methods assume a periodic series, and a large jump between its first and last values causes spurious high-frequency power, as [Schreiber and Schmitz (2000)](#ref-SS2000a) discuss. Trim the series so that its ends match. Chaos remains only one explanation among several.

## What Failing to Reject Means

A high p does not prove linearity. The statistic may have little power, the series may be short or noisy, or the nonlinear structure may not show in ordinal patterns. A verdict of "no significant nonlinearity", as **Nonlinearity Test** prints it, should be read as no evidence in this test. Trying other statistics is reasonable, provided the number tried is reported, as searching over statistics inflates false positives. A two-sided test is also appropriate when the direction is not known in advance.

## Why Permutation Entropy Is a Convenient Statistic

Permutation entropy does not change under monotonic transforms, which suits `IAAFT`, where shape differences are handled by the null. Its reaction to order fits an interest in time structure. It may be less powerful than other statistics in some cases, such as time-reversal asymmetry, or a prediction error in a nonlinear model. Since m! patterns need data, keep m modest relative to the length. **Surrogate Distribution** shows the entire null, which tells more than the p-value alone.

## References

<a id="ref-SS1996a"></a>Schreiber, T. and Schmitz, A. (1996). Improved surrogate data for nonlinearity tests. *Physical Review Letters* 77(4), 635–638. [doi:10.1103/PhysRevLett.77.635](https://doi.org/10.1103/PhysRevLett.77.635)

<a id="ref-SS2000a"></a>Schreiber, T. and Schmitz, A. (2000). Surrogate time series. *Physica D: Nonlinear Phenomena* 142(3–4), 346–382. [doi:10.1016/S0167-2789(00)00043-9](https://doi.org/10.1016/S0167-2789(00)00043-9)

<a id="ref-TELGF1992a"></a>Theiler, J., Eubank, S., Longtin, A., Galdrikian, B. and Farmer, J. D. (1992). Testing for nonlinearity in time series: the method of surrogate data. *Physica D: Nonlinear Phenomena* 58(1–4), 77–94. [doi:10.1016/0167-2789(92)90102-S](https://doi.org/10.1016/0167-2789(92)90102-S)

## See Also

- [Factsheet](factsheet.md) · [Permutation Entropy](permutation-entropy.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
