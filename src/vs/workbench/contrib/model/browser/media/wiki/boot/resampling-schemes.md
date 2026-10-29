# Resampling Schemes

The nonparametric bootstrap draws each replicate from the data with replacement. Bootstrap.jl offers three ways of making these draws; they target the same bootstrap distribution, and differ in how much **Monte Carlo noise** a given number of replicates leaves.

## Basic Sampling
Each replicate draws n observations independently and uniformly from the data, with replacement. Some observations appear several times, others not at all: on average, a replicate contains about 63% of the distinct observations. It is the standard scheme, and the one the theory is written for.

## Balanced Sampling
Over all m replicates together, **each observation is used exactly m times**: the scheme concatenates m copies of the data, shuffles them and cuts the result into m replicates. The overall mean of the replicates of a mean then equals the sample mean exactly, which removes one source of Monte Carlo error, mainly in the estimate of the bias.

## Antithetic Sampling
Replicates come in **pairs**: the data are sorted, and where one replicate of the pair draws the observation of rank i, the other draws the one of rank n + 1 - i. For statistics that increase with the data, such as means and quantiles, the two replicates of a pair err in opposite directions, and their average varies less. For other statistics the gain may vanish.

## Parametric Resampling
Not a scheme of the nonparametric bootstrap but an alternative to it: each replicate is drawn from a **distribution fitted** to the data rather than from the data themselves. It fills in values between and beyond the observations, which helps in small samples, but rests on the fitted distribution being right.

## Time-Series Resampling
Drawing observations independently breaks the dependence of a series. Block bootstraps resample stretches of consecutive observations; the panel uses the **maximum entropy bootstrap**, which keeps the whole time order. See [Maximum Entropy Bootstrap](maximum-entropy.md).

## See Also
- [Overview](overview.md) · [Confidence Intervals](confidence-intervals.md) · [Maximum Entropy Bootstrap](maximum-entropy.md)
