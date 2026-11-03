# Neural Components

Theory often fixes the overall form of a model yet leaves one relationship open. A small neural network can stand in for that relationship, while everything else keeps its mechanistic meaning.

## What the Neural Components Tab Fits

The **Neural Components** tab keeps the decay curve of **Nonlinear Curves** but leaves the rate's dependence on a covariate open:

y_ij = A exp(eta_i) exp(-k_i t_ij) + e_ij, with k_i = exp(NN(x_i; w))

NN is a feed-forward network with one input, two hidden units and one output. The exponential keeps the rate positive, and the seven weights w are fixed effects, estimated together with A, omega and sigma. Each hidden unit of the network adds flexibility, and networks with one hidden layer can approximate any continuous function given enough units, as [Hornik, Stinchcombe and White (1989)](#ref-HSW1989a) showed.

## How to Add a Network to a Model in NoLimits.jl

`FFNNParameters((1, 2, 1); activation=:tanh, function_name=:NN)` declares a network by its layer sizes and needs no other package. Inside `@formulas` the network is called as `NN([x], w)[1]`, with `w` as the name of its weights. `NNParameters` accepts a `Lux.jl` `Chain` or a `SimpleChains.jl` `SimpleChain` for richer architectures. `SoftTreeParameters` and `SplineParameters` offer soft decision trees and B-splines in the same way.

## Where a Network Can Sit in a Nonlinear Mixed Model

A network can replace a covariate effect, as on this tab, a rate law inside `@DifferentialEquation`, or a transition rate in a Markov model. Networks inside differential equations are the neural ordinary differential equations of [Chen, Rubanova, Bettencourt and Duvenaud (2018)](#ref-CRBD2018a), and combining them with known mechanisms gives the universal differential equations of [Rackauckas, Ma, Martensen, Warner, Zubov, Supekar, Skinner, Ramadhan and Edelman (2020)](#ref-RMMWZ...2020a). Random effects can also enter the weights themselves, which gives each subject a personal version of the network, at a high cost in dimension.

## Why Network Fits Often Report No Convergence

Network weights have flat directions and symmetries: swapping two hidden units leaves the output unchanged, and some weight changes barely alter the output. **Laplace** and **FOCEI** can therefore reach their iteration limit with `get_converged` false, while the parameters that matter have settled. **SAEM** and **MCEM** stop by their own rules, and the `NoLimits.jl` documentation fits neural models with **SAEM**. The check that counts is whether A, omega, sigma and the learned function stay put under a longer run or another estimator, not the values of individual weights.

## How to Read the Results of the Neural Components Tab

Individual weights have no meaning, so `calculate_se` is off for them by default, and **Uncertainty Intervals** reports the other parameters. **Learned Rate Against the Covariate** plots the function the network found, which is the actual result. The function is only supported where the data have covariate values, so its behaviour outside that range is arbitrary.

## How to Keep a Neural Component From Overfitting

A network adds parameters quickly, and each subject gives only one value of a subject-level covariate, so the number of subjects limits what the network can learn. Keep the network small and start with few hidden units. `prior=` shrinks the weights under **MCMC**, and `penalty` in `fit_model` gives a similar effect in the other estimators. **Cross-Validation of Two Estimators** uses held-out rows, while `cross_validate(dm, 3; kind=:id)` holds out whole subjects, which is the stricter test for a subject-level covariate.

## References

<a id="ref-CRBD2018a"></a>Chen, R. T. Q., Rubanova, Y., Bettencourt, J. and Duvenaud, D. (2018). Neural Ordinary Differential Equations. [doi:10.48550/arXiv.1806.07366](https://doi.org/10.48550/arXiv.1806.07366)

<a id="ref-HSW1989a"></a>Hornik, K., Stinchcombe, M. and White, H. (1989). Multilayer feedforward networks are universal approximators. *Neural Networks* 2(5), 359–366. [doi:10.1016/0893-6080(89)90020-8](https://doi.org/10.1016/0893-6080(89)90020-8)

<a id="ref-RMMWZ...2020a"></a>Rackauckas, C., Ma, Y., Martensen, J., Warner, C., Zubov, K., Supekar, R., Skinner, D., Ramadhan, A. and Edelman, A. (2020). Universal Differential Equations for Scientific Machine Learning. [doi:10.48550/arXiv.2001.04385](https://doi.org/10.48550/arXiv.2001.04385)

## See Also

- [Factsheet](factsheet.md) · [Nonlinear Curves](nonlinear-curves.md) · [Decision Guide](decision-guide.md) · [Diagnostics](diagnostics.md)
