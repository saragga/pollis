# Assumptions

All five models treat events as points on one time axis, seen in full across a known window. They differ in what they assume about the rate and about the influence of one event on the next.

## What Event Data a Point Process Fit Requires

Each event needs an exact time inside [0, **Time Horizon (T)**], and T should be the true end of the observation window, since the likelihood counts the quiet time after the last event. A T set too long makes the rate look too low. The tabs assume no two events at one time, and **Hawkes** needs distinct times, so rounded timestamps with ties call for another model. Missed events bias all rates downward.

## What the Poisson Tab of a Point Process Assumes

**Poisson** assumes a constant rate and independent gaps, which makes the gaps exponential. A trend or a daily cycle breaks the first, and clustering breaks the second. The estimate N / T is still the average rate, but the Garwood interval is too narrow if events cluster, as the count then has more variance than a Poisson count. **Inter-Event Times** and **Time-Rescaling Test** both reveal this.

## What the Inhomogeneous Tab of a Point Process Assumes

**Inhomogeneous** assumes that rate varies with time only, and that events are independent once the rate is given. Clusters caused by triggering are read as a rise in the rate, so the tab cannot tell the two causes apart. **Bandwidth (h)** is a choice of smoothness that the tab does not estimate, and the fitted rate describes only [0, T].

## What the Cox Tab of a Point Process Assumes

**Cox** assumes that the log baseline is a Gaussian process with the chosen **Kernel**, **GP Variance (sigma2)** and **Length Scale (l)**, centred on the log of the average rate. These hyperparameters stay fixed, with no estimate and no check. A short length scale can follow every cluster, and a long one forces bursts into W. The path is linear between 51 grid points, so features shorter than T/50 are lost.

## What the Hawkes Tab of a Point Process Assumes

**Hawkes** assumes a constant baseline, an exponential decay and the same jump after every event. A trend in the baseline gets read as excitation, which inflates the branching ratio kappa. The offspring of events before time 0 are not modelled, so the opening stretch can look too quiet. A stationary process needs kappa < 1, and the sampler's prior does not enforce this, so draws above 1 can occur.

## What the Network Hawkes Tab of a Point Process Assumes

**Network Hawkes** assumes a constant baseline per node and exponential excitation along directed links, with one decay per pair. All relevant sources must be among the N nodes, since a shared outside driver can appear as links. Few events per pair leave much influence to the priors, Gamma(1, 1) for weights and decays. The links describe a pattern of timing under this model and are not proof of cause.

## Why a Point Process Sampler Must Have Converged

**Cox**, **Hawkes** and **Network Hawkes** summarise Gibbs draws after discarding the first quarter, and those summaries hold only if the chain has settled. Correlated draws also carry less information than their count suggests. The Next Steps hold no trace plot or effective sample size, so raise **Gibbs Iterations** and compare the summaries. A sampler that has not settled gives intervals with no clear meaning.

## See Also

- [Diagnostics](diagnostics.md) · [Goodness of Fit](goodness-of-fit.md) · [Decision Guide](decision-guide.md)
