# Estimation Methods

Every estimator of a nonlinear mixed model has to deal with the same integral over the random effects. The methods differ in whether they approximate the integral, simulate it, or sample the parameters along with the random effects.

## What the Estimators of a Nonlinear Mixed Model Must Compute

The marginal likelihood of subject i is the integral of p(y_i | theta, eta) p(eta | theta) over eta, where theta holds the fixed effects. No closed form exists when eta enters the model nonlinearly, and the total likelihood is the product over subjects. The dimension of the integral equals the number of random effects per subject. [Pinheiro and Bates (1995)](#ref-PB1995a) compare approximations to the integral, including a linearisation, Laplace's method, importance sampling and Gaussian quadrature.

## How the Laplace Estimator Works

**Laplace** finds each subject's mode of the random effects, the empirical Bayes estimate, and replaces the integrand by a normal curve with the curvature at that mode. The outer optimizer then maximizes the resulting approximate likelihood over theta, so each step solves one inner problem per subject. [Wolfinger (1993)](#ref-Wol1993a) relates Laplace's approximation to estimating equations for nonlinear mixed models. Accuracy improves with more observations per subject, as the posterior of the random effects then approaches a normal curve.

## How the FOCEI Estimator Works

First-Order Conditional Estimation With Interaction (**FOCEI**) has the same structure as **Laplace** with a cheaper curvature, built from Fisher information instead of second derivatives of the observation model. The term "interaction" means that the residual variance may depend on the random effects. [Wang (2007)](#ref-Wan2007a) derives first-order, conditional and Laplace estimation from a common starting point. In `NoLimits.jl` the method needs an outcome family with a known information matrix, such as `Normal` or `Poisson`, so **Markov Models** uses **Laplace** instead.

## How the SAEM Estimator Works

**SAEM** builds on the expectation-maximization algorithm of [Dempster, Laird and Rubin (1977)](#ref-DLR1977a), treating random effects as missing data. Each iteration draws them by a short run of a Markov chain, then updates running averages of the sufficient statistics with a decreasing step. Early steps explore, and later ones average out the simulation noise. [Delyon, Lavielle and Moulines (1999)](#ref-DLM1999a) proved convergence of the stochastic approximation scheme, [Kuhn and Lavielle (2004)](#ref-KL2004a) extended the proof to draws from a Markov chain, and [Kuhn and Lavielle (2005)](#ref-KL2005a) applied the approach to nonlinear mixed models.

## How the MCEM Estimator Works

**MCEM** replaces the expectation step of the algorithm by an average over simulated random effects, following [Wei and Tanner (1990)](#ref-WT1990a). It assumes no shape for the posterior of the random effects. The simulation size should grow as the iterations approach the optimum, since noise in the average eventually hides any real improvement. The cost per iteration is usually higher than for **SAEM**, which reuses earlier simulations through its running averages.

## How the MCMC Estimator Works

**MCMC** treats fixed effects as unknown too and samples their joint posterior with the random effects, using `Turing.jl` by [Ge, Xu and Ghahramani (2018)](#ref-GXG2018a). The documentation of `NoLimits.jl` pairs **MCMC** with the No-U-Turn Sampler of [Hoffman and Gelman (2014)](#ref-HG2014a). Priors are required on all free fixed effects, and they matter when the data are thin. The result is a chain instead of a point estimate, with intervals coming directly from the draws.

## Which Methods NoLimits.jl Adds Beyond the Estimation Input

`GHQuadrature` integrates by Gauss-Hermite quadrature with accuracy set by its nodes, and its cost grows quickly with the number of random effects. `VEM` uses a variational lower bound. `Pooled` and `pooled_init` plug in random effects at their mean for a cheap warm start. `MLE`, `MAP` and `VI` serve models with no random effects. `Multistart` wraps an optimization-based method and repeats the method from several starting points, which guards against local optima. All of these go through `fit_model`.

## References

<a id="ref-DLM1999a"></a>Delyon, B., Lavielle, M. and Moulines, E. (1999). Convergence of a stochastic approximation version of the EM algorithm. *The Annals of Statistics* 27(1), 94–128. [doi:10.1214/aos/1018031103](https://doi.org/10.1214/aos/1018031103)

<a id="ref-DLR1977a"></a>Dempster, A. P., Laird, N. M. and Rubin, D. B. (1977). Maximum Likelihood from Incomplete Data Via the EM Algorithm. *Journal of the Royal Statistical Society Series B: Statistical Methodology* 39(1), 1–22. [doi:10.1111/j.2517-6161.1977.tb01600.x](https://doi.org/10.1111/j.2517-6161.1977.tb01600.x)

<a id="ref-GXG2018a"></a>Ge, H., Xu, K. and Ghahramani, Z. (2018). Turing: A Language for Flexible Probabilistic Inference. In *Proceedings of the 21st International Conference on Artificial Intelligence and Statistics (AISTATS)*, 1682–1690. [https://proceedings.mlr.press/v84/ge18b.html](https://proceedings.mlr.press/v84/ge18b.html)

<a id="ref-HG2014a"></a>Hoffman, M. D. and Gelman, A. (2014). The No-U-Turn Sampler: Adaptively Setting Path Lengths in Hamiltonian Monte Carlo. [doi:10.48550/arXiv.1111.4246](https://doi.org/10.48550/arXiv.1111.4246)

<a id="ref-KL2004a"></a>Kuhn, E. and Lavielle, M. (2004). Coupling a stochastic approximation version of EM with an MCMC procedure. *ESAIM: Probability and Statistics* 8, 115–131. [doi:10.1051/ps:2004007](https://doi.org/10.1051/ps:2004007)

<a id="ref-KL2005a"></a>Kuhn, E. and Lavielle, M. (2005). Maximum likelihood estimation in nonlinear mixed effects models. *Computational Statistics & Data Analysis* 49(4), 1020–1038. [doi:10.1016/j.csda.2004.07.002](https://doi.org/10.1016/j.csda.2004.07.002)

<a id="ref-PB1995a"></a>Pinheiro, J. C. and Bates, D. M. (1995). Approximations to the Log-Likelihood Function in the Nonlinear Mixed-Effects Model. *Journal of Computational and Graphical Statistics* 4(1), 12–35. [doi:10.1080/10618600.1995.10474663](https://doi.org/10.1080/10618600.1995.10474663)

<a id="ref-Wan2007a"></a>Wang, Y. (2007). Derivation of various NONMEM estimation methods. *Journal of Pharmacokinetics and Pharmacodynamics* 34(5), 575–593. [doi:10.1007/s10928-007-9060-6](https://doi.org/10.1007/s10928-007-9060-6)

<a id="ref-WT1990a"></a>Wei, G. C. G. and Tanner, M. A. (1990). A Monte Carlo Implementation of the EM Algorithm and the Poor Man's Data Augmentation Algorithms. *Journal of the American Statistical Association* 85(411), 699–704. [doi:10.1080/01621459.1990.10474930](https://doi.org/10.1080/01621459.1990.10474930)

<a id="ref-Wol1993a"></a>Wolfinger, R. (1993). Laplace's Approximation for Nonlinear Mixed Models. *Biometrika* 80(4), 791–795. [doi:10.1093/biomet/80.4.791](https://doi.org/10.1093/biomet/80.4.791)

## See Also

- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Uncertainty Quantification](uncertainty-quantification.md) · [Assumptions](assumptions.md)
