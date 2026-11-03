# Decision Guide

Two choices shape every fit in the panel: the structure of the model and the estimator. A third comes first, namely whether a mixed model is needed at all.

## Which Tab Fits Which Situation

| Situation | Tab | Why |
|---|---|---|
| The mean response has a known formula | **Nonlinear Curves** | Fast, and the parameters read directly |
| The mechanism is known as rates, with doses or other inputs | **ODE Dynamics** | Parameters keep a mechanistic meaning |
| The outcome reflects a discrete state that changes over time | **Markov Models** | States and transitions are modelled directly |
| One part of the mechanism has no known form | **Neural Components** | A network fills that part and the rest stays interpretable |

## When a Simpler Model Is Enough Instead of a Nonlinear Mixed Model

A model linear in its parameters and random effects belongs in **Linear Mixed Models**, or in **Generalised Linear Mixed Models** for binary and count outcomes, where estimation is much faster. A nonlinear curve with no real subject structure belongs in **Nonlinear Models**. Nonlinear mixed models earn their cost when the parameters have a scientific meaning, when subjects differ in those parameters, and when each subject has several observations.

## How to Choose an Estimator for a Nonlinear Mixed Model

| Question | Answer | Estimator |
|---|---|---|
| Is a full posterior needed? | Yes | **MCMC** |
| Are the random effects mildly nonlinear, with several observations per subject? | Yes | **Laplace** |
| The same, with a common outcome family and a need for speed? | Yes | **FOCEI** |
| Are the random effects strongly nonlinear, or the observations per subject few? | Yes | **SAEM** |
| Should the fit avoid any curvature assumption, at a higher cost per iteration? | Yes | **MCEM** |

A practical order is to start with **Laplace**, then check the result with **SAEM** through **Compare Two Estimators**. Agreement between the two is good evidence that the approximation is not driving the result.

## How to Reduce the Cost of a Nonlinear Mixed Model Fit

Differential equations and networks make each likelihood evaluation expensive. Fewer random effects help most, as each one adds a dimension to the integral. Sensible starting values in `@fixedEffects` also help, and `pooled_init` in `NoLimits.jl` provides a warm start from a fit with random effects at their mean. Coarser solver tolerances in `set_solver_config` speed up exploratory fits, provided the final fit uses tighter ones. For **ODE Dynamics**, a stiff system needs a stiff solver, and an unsuitable solver can dominate the run time.

## Whether to Use a Network or a Formula Inside a Nonlinear Mixed Model

Prefer a formula when theory gives one, as the parameters then have a meaning and transfer to new settings. A network suits a part of the model that is truly unknown, and it asks for more data, because its weights are many and individually meaningless. **Learned Rate Against the Covariate** shows what the network found, and the shape it finds can suggest a formula for a later, simpler model.

## See Also

- [Overview](overview.md) · [Estimation Methods](estimation-methods.md) · [Factsheet](factsheet.md) · [Neural Components](neural-components.md)
