# Overview

This webview does **Bayesian inference by sampling**. A model states a **prior** distribution for the unknown parameters and a **likelihood** for the data given them; Bayes' rule combines them into the **posterior**, the distribution of the parameters given the data. The posterior rarely has a closed form, so Turing.jl draws samples from it by **Markov Chain Monte Carlo** (MCMC), and every summary (means, intervals, predictions) is computed from the draws.

## The Models
- **Gaussian**: a mean mu and a standard deviation sigma for one sample of observations.
- **Linear Regression**: an intercept, a slope and a noise standard deviation; the Bayesian version of least squares.
- **Logistic Regression**: an intercept and a slope on the log-odds of a 0/1 outcome.
- **Hierarchical**: observations in groups, each group with its own mean, drawn from a common distribution whose mean and spread are also estimated. Groups with few observations **borrow strength** from the others. The model is written in its **non-centred** form, which samples much better when the group spread is small.

## The Samplers
- **NUTS** (No-U-Turn Sampler): Hamiltonian Monte Carlo that tunes its own step size, to reach a **target acceptance** rate, and its own trajectory length. The default, and the best choice for continuous parameters.
- **HMC**: Hamiltonian Monte Carlo with a fixed **step size** epsilon and number of **leapfrog steps** L, both set by hand.
- **MH**: random-walk Metropolis-Hastings. Needs no gradients, but mixes slowly beyond a few parameters.

NUTS and HMC need the gradient of the log posterior, from the chosen **AD backend**: ForwardDiff for a few parameters, a reverse-mode backend (Enzyme, Mooncake, ReverseDiff) for many. The Markov Chain Monte Carlo panel covers the samplers themselves in more depth.

## Common Workflow

1. Choose the model and enter the data; keep the default NUTS sampler and run several **chains**.
2. Check convergence: the **Trace Plot**, **R-hat** and the **Effective Sample Size**.
3. Read the **Posterior Summary** and the **HPD Interval**; compare posterior and prior in **Marginal Posteriors**.
4. Check the fit with the **Posterior Predictive Check**.
5. Compare with an alternative model by **LOO-CV** and **LOO Compare**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
