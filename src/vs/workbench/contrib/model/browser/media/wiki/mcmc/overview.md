# Overview

The Markov Chain Monte Carlo panel draws samples from a probability distribution known only up to a constant, usually a Bayesian posterior, by **Markov Chain Monte Carlo** (MCMC). An MCMC sampler builds a chain of draws in which each one depends only on the previous one, constructed so that, after a **warm-up**, the draws are distributed as the target. Averages over the chain then estimate means, quantiles and probabilities. The panel shows three samplers, from the most to the least efficient on smooth continuous targets.

## NUTS
The **No-U-Turn Sampler**, through Turing.jl's @model syntax: Hamiltonian Monte Carlo that chooses its own trajectory length, by stopping when the trajectory starts to turn back, and tunes its step size during warm-up to reach a target acceptance rate. The default for continuous parameters. See [NUTS](nuts.md).

## HMC
**Hamiltonian Monte Carlo** with AdvancedHMC.jl, from a log-density function written by hand: the sampler treats the parameters as the position of a particle, gives it a random momentum and follows its motion over the log-density surface for a fixed number of **leapfrog steps**. The step size and a diagonal mass matrix are adapted during 500 warm-up steps. See [HMC](hmc.md).

## Metropolis-Hastings
Through Turing.jl: propose a new point, accept it with a probability that depends on the ratio of the target densities, otherwise stay. It needs no gradients, so it works for any model, but it explores slowly when there are more than a few parameters. See [Metropolis-Hastings](metropolis-hastings.md).

## Common Workflow

1. Write the model (the @model body, or the log density for HMC) and choose the number of samples and of warm-up steps.
2. Run, and look at the **Trace Plot** and the **Marginal Histogram**.
3. Check **R-hat**, the **ESS** and the **Autocorrelation**.
4. Summarise with the **Posterior Mean**, the **Credible Interval** and the **HPD Interval**.
5. Compare samplers by **Sampler Efficiency** (ESS per second), and models by **WAIC** and **LOO-CV**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [NUTS](nuts.md) · [HMC](hmc.md) · [Metropolis-Hastings](metropolis-hastings.md)
