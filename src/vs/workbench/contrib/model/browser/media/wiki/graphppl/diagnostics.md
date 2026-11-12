# Diagnostics

Message passing returns deterministic numbers with no sampler noise, so a wrong answer can look just as tidy as a right one. The checks look at convergence, at agreement with known answers, and at fit to the data.

## How to Read the Free Energy

**Free Energy** does a different job by tab:

| Tab | What to look for |
|---|---|
| **Belief Propagation** | Value equals the exact −log p(y) |
| **Variational Message Passing** | Non-increasing, levelling off |
| **Expectation Propagation** | Levelling off, with possible small rises |

A rise under mean field points to a numerical issue or a bad rule. A failure to level off shows that **Iterations** was too low. [Wainwright and Jordan (2008)](#ref-WJ2008a) treat these objectives in one framework.

## How to Check Convergence

**Convergence Check** prints the last change in E[mu] with a tolerance of 1e-6 on **Variational Message Passing**, and the last change in F on **Expectation Propagation**. A small change in one quantity does not cover them all, as a mean may settle before a variance. **Iteration Sensitivity** reruns with 1, 2, 5, 10 and 20 iterations, which shows how the estimate depends on effort. On a long chain, information spreads along it over the iterations, so that later points settle more slowly.

## How to Test Accuracy

**Approximate vs Exact** compares with a reference, by tab:

| Tab | Reference | Expected |
|---|---|---|
| **Belief Propagation** | Closed form | Error 0, ratio 1 |
| **Variational Message Passing** | Grid over mu and tau | Variance ratio below 1 |
| **Expectation Propagation** | Gibbs sampling | Variance ratio near 1, skewness near 0 if the Gaussian form fits |

Grids work only in low dimensions. For the probit model of **Expectation Propagation**, the reference is the data-augmentation Gibbs sampler of [Albert and Chib (1993)](#ref-AC1993a): each 0/1 outcome is the sign of a latent normal variable, and given those variables the trend is a linear Gaussian model whose whole path can be drawn exactly. Its 4000 draws of the final trend, after 1000 discarded, give the mean, variance and skewness that EP is compared with. **Posterior Distribution** draws their histogram under the EP density, so a skew that the Gaussian form cannot follow shows there.

## How to Check Priors and Fit

**Prior Predictive** shows data implied by the priors. If observed values fall far outside, then the prior clashes with the data. **Posterior Predictive** should cover the data on the first two tabs, and it gives a next-step probability on the third. A better check holds out some observations, or compares the predictive with statistics such as range or runs. Neither action tests the assumption of independence. To test that, plot the residuals from the posterior mean against time.

## How to Compare with Another Method

An independent result guards against mistakes in rules. On small models, a Monte Carlo sampler gives a reference with the same priors, and it can show skewness that a Gaussian hides. Compare means, standard deviations and tails. A difference in means of more than a small share of the sd suggests a real problem. For a known conjugate subset, a hand formula is the cheapest reference. That is why [Belief Propagation](bp.md) and [Variational Message Passing](vmp.md) give the updates in closed form.

## How to Diagnose Common Failures

| Symptom | Likely cause |
|---|---|
| Error about missing initial messages | A loop, so `@initialization` is needed |
| Error about a missing rule | Non-conjugate pair, or a missing constraint |
| Infinite or NaN free energy | Poor starting values or an impossible value |
| Unchanged posterior | The data variable is not reaching the model |
| Variances collapsing | Prior too strong, or a mistaken precision |

The second row is the most common with new models. Reading the keyword arguments is a good first step, since precision and variance can easily be confused.

## References

<a id="ref-AC1993a"></a>Albert, J. H. and Chib, S. (1993). Bayesian analysis of binary and polychotomous response data. *Journal of the American Statistical Association* 88(422), 669–679. [doi:10.1080/01621459.1993.10476321](https://doi.org/10.1080/01621459.1993.10476321)

<a id="ref-WJ2008a"></a>Wainwright, M. J. and Jordan, M. I. (2008). Graphical models, exponential families, and variational inference. *Foundations and Trends in Machine Learning* 1(1–2), 1–305. [doi:10.1561/2200000001](https://doi.org/10.1561/2200000001)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Belief Propagation](bp.md) · [Expectation Propagation](ep.md)
