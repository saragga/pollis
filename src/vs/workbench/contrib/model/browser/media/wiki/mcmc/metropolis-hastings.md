# Metropolis-Hastings

The **Metropolis-Hastings** algorithm is the original MCMC method, and the simplest: it needs only the ability to evaluate the target density up to a constant.

## The Algorithm
From the current point x:
1. **Propose** a new point x' from a proposal distribution q(x' | x).
2. **Accept** it with probability

       min(1, [p(x') q(x | x')] / [p(x) q(x' | x)])

   and otherwise **stay** at x (the current point is repeated in the chain).

The normalising constant of p cancels in the ratio, which is why the method works for posteriors. The acceptance rule makes p the stationary distribution of the chain, whatever the proposal, as long as the chain can reach the whole target.

## Proposals
- **Random walk**: x' = x plus a small symmetric perturbation, so q cancels in the ratio (the original Metropolis algorithm). The step scale is the only setting; an acceptance rate around 0.23 is the classic optimum in many dimensions.
- **Independence**: x' is drawn from a fixed distribution, regardless of x. It works well only when that distribution is close to the target.

In Turing, **MH()** with no arguments is an independence sampler that proposes each parameter from its **prior**. MH(Sigma), with a covariance matrix, gives a random-walk proposal; pairs of a parameter and a proposal set them one by one.

## Strengths and Limits
It needs no gradients, so it works with discrete parameters, black-box likelihoods and non-differentiable models. But a random walk covers a distance that grows only with the square root of the number of steps, and its efficiency falls as the dimension grows: beyond a handful of parameters, or with strong correlations, gradient-based samplers are far more efficient. Expect a low ESS relative to the number of draws.

## In Turing.jl

    chain = sample(model(data), MH(), 10_000)

## See Also
- [NUTS](nuts.md) · [HMC](hmc.md) · [Diagnostics](diagnostics.md)
