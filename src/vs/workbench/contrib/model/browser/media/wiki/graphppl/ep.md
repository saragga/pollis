# Expectation Propagation

Expectation propagation approximates each hard factor with a simple one, by matching moments in context. In `RxInfer.jl`, the `Probit` node works this way for binary outcomes.

## What Makes the Probit Model Hard

The tab's model has a Gaussian random-walk trend x and binary outcomes with P(y = 1) = Φ(x). A Gaussian prior multiplied by Φ is not Gaussian, so exact messages leave the family after the first step, and they become harder to represent as the chain grows. Message passing requires a fixed form. A local approximation can restore it, which is what [Minka (2001)](#ref-Min2001b) proposes, by treating each factor in the light of all the others.

## How One Update Works

For each outcome, the update has four steps:

1. Remove that factor's current Gaussian site from q, giving the cavity.
2. Multiply the cavity by the true factor, giving the tilted distribution.
3. Find the Gaussian with the same mean and variance as the tilted one.
4. Divide out the cavity, and keep the remainder as the new site.

Matching moments minimises KL(tilted ‖ Gaussian), which is the reverse of the direction used by variational methods. For a probit factor, the moments have closed forms, as set out in [Rasmussen and Williams (2006)](#ref-RW2006a).

## Why Repeated Passes Are Needed

Each site depends on its cavity, which depends on the other sites, so one pass is not enough, and **Iterations** sets how many are done. The default of 20 is generous on this chain. Unlike variational methods, EP has no assurance of a falling objective, and it may in some models fail to converge. A probit factor is log-concave, which generally keeps it well-behaved. **Free Energy** can thus move up and down, and it should level off. **Convergence Check** reads the last change in F.

## What the Direction of the Divergence Changes

KL(p ‖ q) penalises q for missing any part of p, so that matching moments gives a broader q than a mean-field fit. In practice, EP variances are close to the true ones in many models with a log-concave likelihood, whereas mean-field ones are too small. The comparison made by [Minka (2001)](#ref-Min2001a) shows the family link: EP, belief propagation and assumed-density filtering are all forms of message passing with different projections. EP is local, and so there is no overall guarantee as to which way an error goes.

## What the Trend Model Assumes

Steps have an sd of 0.15, or a precision of 1 / 0.15². Over 100 steps, the walk has a prior sd of about 1.5, a range that covers probabilities from near 0 to near 1. Each outcome carries little information, so that the estimate of the trend is a smoothed average of many outcomes, and the posterior band stays fairly wide. The step size is a fixed choice in the code, and a value that is too large makes a trend chase the noise.

## How to Read the Prediction

For a next outcome, the code adds one step of variance to the final marginal, and it integrates Φ over the Gaussian:

- P(y = 1) = Φ(m / √(1 + v))

The closed form holds for any Gaussian, with m and v its mean and variance. Larger v pulls the probability towards 0.5, which is how uncertainty about the trend shows up in the prediction. **Posterior Predictive** prints it. Without the 1 in the square root, the formula would be overconfident, as it would ignore the noise built into the probit link.

## References

<a id="ref-Min2001a"></a>Minka, T. P. (2001). *A Family of Algorithms for Approximate Bayesian Inference*. PhD thesis, MIT. [tminka.github.io](https://tminka.github.io/papers/ep/minka-thesis.pdf)

<a id="ref-Min2001b"></a>Minka, T. P. (2001). Expectation propagation for approximate Bayesian inference. In *Proceedings of the 17th Conference in Uncertainty in Artificial Intelligence (UAI)*. [dl.acm.org](https://dl.acm.org/doi/10.5555/2074022.2074101)

<a id="ref-RW2006a"></a>Rasmussen, C. E. and Williams, C. K. I. (2006). *Gaussian Processes for Machine Learning*. MIT Press. [gaussianprocess.org/gpml](https://gaussianprocess.org/gpml/)

## See Also

- [Factsheet](factsheet.md) · [Belief Propagation](bp.md) · [Variational Message Passing](vmp.md) · [Diagnostics](diagnostics.md)
