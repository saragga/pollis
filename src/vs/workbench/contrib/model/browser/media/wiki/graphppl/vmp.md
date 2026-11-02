# Variational Message Passing

Variational message passing assumes that the posterior factorises, and updates each factor in turn. The result is fast and it comes with a bound that falls at every step, at the cost of overconfident variances.

## What the Mean-Field Assumption Does

With both mu and tau unknown, the exact posterior links them. The constraint `q(mu, tau) = q(mu)q(tau)` replaces it with two independent factors. Variational inference then picks the factors that minimise KL(q ‖ p), which is the same as minimising the free energy. [Blei, Kucukelbir and McAuliffe (2017)](#ref-BKM2017a) review the approach. Dropping the dependence makes every update simple, in exchange for a known bias.

## What the Updates Are by Hand

With conjugate factors, each update has a closed form. For a Normal prior of precision 0.1, a Gamma(1, 1) prior on tau, and n observations:

| Factor | Update |
|---|---|
| q(mu) | Precision 0.1 + n E[tau], mean E[tau] Σ y / precision |
| q(tau) | Shape 1 + n / 2, rate 1 + ½ Σ ((y − m)² + v) |

Here m and v are the mean and variance of q(mu), and with n = 20 the shape is 11 from the first update on. Only the rate changes after that. [Bishop (2006)](#ref-Bis2006a) derives a close relative of this example step by step, and in a message-passing form these become messages on the factor graph.

## Why the Free Energy Must Fall

Each update minimises F with the other factor held fixed, so that F cannot rise from one update to the next. **Free Energy** should thus trace a non-increasing curve, and **Convergence Check** tests it with a small tolerance. An increase signals a numerical or a coding problem. The value at the end is an upper limit on −log p(y), and the gap to it is the KL divergence from q to the true posterior. A falling F does not ensure a good q, as it can settle in a local optimum on some models.

## Why the Variances Are Too Small

KL(q ‖ p) penalises q heavily wherever p is small, and so q avoids the tails. By treating tau as if it were independent, the mean-field update also uses a single E[tau] in place of averaging over it. The exact variance of mu is about E[1 / (n tau)], and the mean-field one is about 1 / (n E[tau]). For a Gamma of shape a, the ratio is (a − 1) / a, which at a = 11 gives about 0.91. **Approximate vs Exact** computes that ratio on a grid, and **Credible Interval** warns that the interval for mu is too narrow.

## Why It Needs Initialisation

Updates for mu need E[tau], and updates for tau need the moments of mu, so that the loop must start somewhere. `@initialization` sets `vague` starting marginals. Convergence on this small model is fast, within a few iterations. On larger models, the start can matter: different starts can lead to different optima, so try a few and compare final F. **Iteration Sensitivity** shows how quickly the estimate settles, which then guides **Iterations**.

## Where VMP Is Strong and Weak

| Strong | Weak |
|---|---|
| Fast deterministic iterations | Understated variances |
| Falling objective, easy to monitor | Bias from the assumed factorisation |
| Scales to large conjugate graphs | Needs conjugacy, or extra rules |
| Free energy for model comparison | Local optima in larger models |

Means are often good, while uncertainties should be treated with care, above all where parameters are strongly correlated in the true posterior.

## References

<a id="ref-Bis2006a"></a>Bishop, C. M. (2006). *Pattern Recognition and Machine Learning*. Springer. [doi:10.1007/978-0-387-45528-0](https://doi.org/10.1007/978-0-387-45528-0)

<a id="ref-BKM2017a"></a>Blei, D. M., Kucukelbir, A. and McAuliffe, J. D. (2017). Variational inference: a review for statisticians. *Journal of the American Statistical Association* 112(518), 859–877. [doi:10.1080/01621459.2017.1285773](https://doi.org/10.1080/01621459.2017.1285773)

## See Also

- [Factsheet](factsheet.md) · [Belief Propagation](bp.md) · [Expectation Propagation](ep.md) · [Interpretation](interpretation.md)
