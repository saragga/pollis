# Network Hawkes

A network Hawkes process runs several streams of events at once, and an event on one node can raise the intensity of others along directed links. [Linderman and Adams (2014)](#ref-LA2014a) joined the multivariate process of [Hawkes (1971)](#ref-Haw1971a) with a random graph prior, so that the links themselves are inferred.

## What the Network Hawkes Model Computes

For node n, the conditional intensity is

lambda_n(t) = mu_n + sum over t_i < t of A[m_i, n] W[m_i, n] theta[m_i, n] exp(-theta[m_i, n] (t - t_i))

where m_i is the node of event i. A[m, n] is 1 when a link runs from m to n, W[m, n] is the expected number of direct offspring on n per event on m, and theta[m, n] is the decay. The matrix A.*W replaces the single branching ratio of a one-node Hawkes process.

## How the Network Hawkes Tab Samples Its Posterior

`NHP.mcmc!` updates in each sweep the parent of each event, the baselines, the weights, the decays, the links and the link probability. Priors are Gamma(1, 1) for baselines, weights and decays, and Beta(1, 1) on the one link probability shared by all pairs in `BernoulliNetworkModel`. The sampler starts from a baseline of n/(N T), weights of 0.1, decays of 1, all links present and a link probability of 0.5. Each draw holds every parameter, and the tab discards the first quarter.

## Which Panel Inputs Affect the Network Hawkes Tab

**Nodes (N)** sets the dimension, and **Event Nodes** gives a node from 1 to N for each event, in the order of **Event Times**. **Gibbs Iterations** and **Time Horizon (T)** act as in the other tabs. **Baseline (mu)** and **Decay (beta)** set only the simulated example, which also uses a link probability of 0.5 and a weight of 0.6/N. Parameters grow with N squared, while events do not, so large N needs long records.

## How the Network Hawkes Tab Builds Its Plug-In Fit

**Intensity Function**, the compensators and **Log-Likelihood** use one fitted process, with the mean baselines, the mean of `theta_draws` and the mean of A.*W. Link probabilities and **Branching Ratio** use the draws directly. The mean decay runs over all draws, including those where a link is absent, when the decay of that pair is informed mainly by the prior. A pair with a weak link can thus have a plug-in decay some way from what its link would imply.

## Where a Network Hawkes Fit Is Strong and Where It Misleads

The model turns timing into a directed graph, and gives a probability for each link. It misleads when a common outside driver moves several nodes, as this appears as links between them. A strict lead and lag may also come from the recording delay of one stream. With few events on a pair, a P(link) near the prior says the data are silent, and not that a link is unlikely. **Future Events** and **Expected Count** have no simulator for this tab. Exponential kernels are the only choice offered, and there are no inhibitory links.

## What to Compare a Network Hawkes Fit With

Fit **Hawkes** on a single node, by passing that node's events to it, to see how much the node explains alone. **Poisson vs Hawkes** pools all nodes, so it tests pooled clustering rather than the network. **Branching Ratio** gives the spectral radius of A.*W, and a value under 1 is the stationarity condition, which plays the role of kappa < 1. At 1 or more, the stationary rates solved by **Branching Structure** have no meaning.

## References

<a id="ref-Haw1971a"></a>Hawkes, A. G. (1971). Spectra of some self-exciting and mutually exciting point processes. *Biometrika* 58(1), 83–90. [doi:10.1093/biomet/58.1.83](https://doi.org/10.1093/biomet/58.1.83)

<a id="ref-LA2014a"></a>Linderman, S. W. and Adams, R. P. (2014). Discovering latent network structure in point process data. arXiv:1402.0914. [doi:10.48550/arXiv.1402.0914](https://doi.org/10.48550/arXiv.1402.0914)

## See Also

- [Hawkes Process](hawkes-process.md) · [Goodness of Fit](goodness-of-fit.md) · [Interpretation](interpretation.md)
