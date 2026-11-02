# Decision Guide

The structure of the model largely picks the method. The remaining choices are the factorisation, the starting values, and whether message passing suits the problem at all.

## Which Tab Fits the Model

| Model | Tab |
|---|---|
| Tree of conjugate factors, such as Gaussian chains | **Belief Propagation** |
| Conjugate-exponential with loops, such as unknown means and precisions | **Variational Message Passing** |
| Non-conjugate likelihood with a Gaussian prior, such as binary outcomes | **Expectation Propagation** |

Models can mix these, since `RxInfer.jl` uses the rule that belongs to each part of the graph. Work out which parts of a new model fall into which row, and begin with the closest tab.

## When to Use Another Kind of Method

| Situation | Better choice |
|---|---|
| Exact tails or multiple modes needed | MCMC |
| Complex non-conjugate model | MCMC, or black-box variational inference |
| Streaming data, tight latency | Message passing, as here |
| Very large conjugate graphs | Message passing, as here |
| Simple model, few parameters | Closed forms or a sampler |

As a rule, message passing trades flexibility for speed. Use a sampler at least once to check a new model, on a small data set.

## How to Choose a Factorisation

Start with the tightest grouping that the rules support, and split only when needed. Full mean field is the simplest and the most biased. Keep together any variables that are expected to be strongly dependent. If a chain of states is involved, keep the states together, and factor them from the parameters, in the structured form that is common for state-space models. Compare options by final F on the same data, on the understanding that a lower F is better.

## How to Set Initial Marginals and Iterations

Use `vague` starts unless they cause numerical problems, and then use starts informed by the data, such as a sample mean and variance. Check a few alternatives on a new model, because agreement across starts gives reassurance. Set **Iterations** from **Iteration Sensitivity**, by raising it until values stop moving at the digits required. Extra iterations cost little on small models, so leave a margin. On real-time models, the iterations per observation become a key part of the design.

## How to Scale and Parameterise the Data

Rescale data to a modest range, so that default priors are weak and numbers stay stable. State each Gaussian with the parameter you mean, as `variance` and `precision` differ widely. For binary outcomes, choose the link and the step size together: a smaller step gives a smoother trend. Estimating the step, rather than fixing it, is a natural extension, and the free energy can choose among fixed values. Report any scaling so that results can be read back on the original scale.

## What to Report from a Message-Passing Analysis

State the model with its priors, the algorithm and any constraints, the initialisation, and the number of iterations. Report posterior means and intervals, and name the approximation behind them. Give the final free energy, and the checks: convergence, a comparison with an exact or sampling reference, and predictive fit. Note any known bias, such as understated variances under mean field. Give the package version and the seed for simulated data, since rule implementations may change between releases.

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Variational Message Passing](vmp.md) · [Expectation Propagation](ep.md)
