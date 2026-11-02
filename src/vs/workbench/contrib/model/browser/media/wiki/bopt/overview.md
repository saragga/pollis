# Overview

Bayesian optimisation finds a good input to a function that is expensive to evaluate and has no usable gradient. It spends computing on deciding where to look next, so as to spend few evaluations.

## What Bayesian Optimisation Does

Each evaluation of the true function teaches a statistical surrogate more about it. An acquisition function then scores every candidate point, and the highest score becomes the next evaluation. After the last evaluation, the best point seen is returned. The loop suits tasks such as tuning a model's hyperparameters, where one trial may take hours. [Frazier (2018)](#ref-Fra2018a) gives a short tutorial, and [Garnett (2023)](#ref-Gar2023a) a full book. A surrogate is no substitute for the function, and only real evaluations count as results.

## What the Gaussian Process Surrogate Provides

A Gaussian process gives a prediction with an uncertainty at any point: a mean mu(x) and a standard deviation sigma(x). Near an observation, sigma is small, and far from one, it grows. Its kernel states how smooth the function is expected to be. The panel uses a squared exponential kernel with one length scale per dimension, `SEArd`, from `GaussianProcesses.jl`. Refitting its hyperparameters takes place every 10 evaluations. [Rasmussen and Williams (2006)](#ref-RW2006a) give the theory of such models.

## How the Four Tabs of the Bayesian Optimisation Panel Differ

| Tab | Scores a point by | Tendency |
|---|---|---|
| **Expected Improvement** | Expected gain over the best so far | Balanced, the usual first choice |
| **Probability of Improvement** | Chance of any gain | Greedy, close to the best so far |
| **Upper Confidence Bound** | Optimistic bound | Exploration set by beta |
| **Thompson Sampling** | Random draw from the posterior | Diverse, suits batches |

All other settings are shared, so a comparison changes the acquisition alone.

## What the Bayesian Optimisation Panel Solves by Default

The default is the Styblinski-Tang function, with **Dimension (n)** of 2 on the box from -5 to 5, and 50 **Evaluations**. It has many local minima, and its global minimum is known, which allows a result to be judged. `BayesianOptimization.jl` runs the loop, and prints the best value and the point that achieved it. For a real problem, **Objective Body** holds an expression in `x`, a vector of length n, or a call to the user's own function.

## A Common Workflow for Bayesian Optimisation

1. Run **Expected Improvement** on the problem with a small budget.
2. Use **Convergence Trace** to see whether progress continues.
3. Use **GP Hyperparameters** to check the surrogate.
4. Use **Sample Efficiency** to confirm that the method beats random search.
5. Use **Acquisition Comparison** and **Run Consistency** to test stability.
6. Use **Local Refinement** to polish the final point.

Every action starts a fresh run, so each one spends its own evaluations.

## References

<a id="ref-Fra2018a"></a>Frazier, P. I. (2018). A tutorial on Bayesian optimization. [arXiv:1807.02811](https://arxiv.org/abs/1807.02811)

<a id="ref-Gar2023a"></a>Garnett, R. (2023). *Bayesian Optimization*. Cambridge University Press. [bayesoptbook.com](https://bayesoptbook.com)

<a id="ref-RW2006a"></a>Rasmussen, C. E. and Williams, C. K. I. (2006). *Gaussian Processes for Machine Learning*. MIT Press. [gaussianprocess.org/gpml](https://gaussianprocess.org/gpml/)

## See Also

- [Factsheet](factsheet.md) · [Expected Improvement](ei.md) · [Probability of Improvement](pi.md) · [Upper Confidence Bound](ucb.md) · [Thompson Sampling](ts.md)
