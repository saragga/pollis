# Assumptions

A nonlinear mixed model assumes a structure at each of its levels and an observation process that links them to the data. Each assumption can fail on its own, and a failure at one level often shows up as a pattern at another.

## What the Structural Model of a Nonlinear Mixed Model Assumes

The structural model assumes that one functional form describes every subject, with only the parameters changing between subjects. A wrong form leaves systematic patterns in residuals over time that no choice of random effects removes. In **ODE Dynamics** the assumption extends to the set of compartments and rates, and in **Markov Models** to the number of states and the allowed transitions. Enough random effects can hide a wrong form in individual fits, so a good **Fitted Trajectories** plot does not settle the question alone. A **Visual Predictive Check** tests the form at population level as well.

## What Nonlinear Mixed Models Assume About Random Effects

The usual assumption is that random effects are independent of the covariates and follow the stated distribution, often normal on a transformed scale. Positive parameters are commonly written as a typical value times `exp(eta)`, which makes them log-normal across subjects. Random effects left out of the model push subject differences into the residual error. Too many random effects, on the other hand, make the fit unstable, because the data of one subject rarely inform many of them. Correlation between random effects is an assumption too: separate `RandomEffect` terms treat them as independent, and an `MvNormal` allows correlation.

## What Nonlinear Mixed Models Assume About the Residual Error

Given a subject's parameters, observations are assumed independent with the stated distribution. In the Normal case with a constant `sigma`, the spread is the same at low and high responses. Many biological and physical measurements have a spread that grows with the response, which calls for a proportional or combined error model, or a different distribution in `@formulas`. Observations taken close together may also stay correlated even given the parameters, which a plain independent error cannot describe.

## Which Assumptions the Markov Models Tab Adds

A first-order Markov process assumes that the next state depends only on the current state and that the transition rates hold over the interval. A hidden Markov model further assumes that, given the hidden state, each observation is independent of the rest and has a state-specific distribution, as in [Rabiner (1989)](#ref-Rab1989a). The rate matrix in **Markov Models** is time-homogeneous unless covariates or time enter it. Time spent in a state is then exponential, so processes with long memory or fixed stays are misdescribed.

## What Estimators Assume on Top of the Model

**Laplace** and **FOCEI** assume that each subject's random-effect posterior is close to normal around its mode. The assumption weakens with few observations per subject, or with strongly nonlinear random effects, and [Pinheiro and Bates (1995)](#ref-PB1995a) compare such approximations. **SAEM** and **MCEM** avoid the assumption but depend on their simulation settings. **MCMC** depends on the priors and on chains that have mixed. A large gap in **Compare Two Estimators** suggests that one of these conditions fails.

## References

<a id="ref-PB1995a"></a>Pinheiro, J. C. and Bates, D. M. (1995). Approximations to the Log-Likelihood Function in the Nonlinear Mixed-Effects Model. *Journal of Computational and Graphical Statistics* 4(1), 12–35. [doi:10.1080/10618600.1995.10474663](https://doi.org/10.1080/10618600.1995.10474663)

<a id="ref-Rab1989a"></a>Rabiner, L. R. (1989). A tutorial on hidden Markov models and selected applications in speech recognition. *Proceedings of the IEEE* 77(2), 257–286. [doi:10.1109/5.18626](https://doi.org/10.1109/5.18626)

## See Also

- [Diagnostics](diagnostics.md) · [Estimation Methods](estimation-methods.md) · [Markov Models](markov-models.md) · [Decision Guide](decision-guide.md)
