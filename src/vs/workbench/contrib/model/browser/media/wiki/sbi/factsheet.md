# Factsheet

The Simulation-Based Inference panel trains a neural network to act as an estimator, using only draws from a prior and a simulator. No likelihood is written down, so it suits models that are easy to simulate and hard to evaluate.

## What the Simulation-Based Inference Panel Does

| Item | Description |
|---|---|
| **Purpose** | Estimate model parameters when the likelihood is unavailable or too slow to evaluate |
| **Julia stack** | NeuralEstimators.jl for estimators and training, Flux.jl for the networks, Distributions.jl for the prior, Plots.jl for the charts |
| **Input** | `sampler`, `simulator` and the observed **Data** |
| **Output** | `estimator`, which maps a data set to estimates in one forward pass |
| **Key choice** | The tab sets what is estimated, and **Architecture** sets how the data are summarised |

The default `sampler` and `simulator` describe m independent draws from Normal(mu, sigma), with `mu` from Normal(0, 1) and `sigma` from Uniform(0.1, 1). They are a template, so replace both with the model at hand.

## What Each Simulation-Based Inference Tab Returns

| Tab | Estimator | Loss | Result |
|---|---|---|---|
| **Point** | `PointEstimator` | Absolute error | Posterior median, with 95% parametric-bootstrap intervals |
| **Interval** | `IntervalEstimator` | Quantile, at 0.025 and 0.975 | 95% credible bounds |
| **Quantile** | `QuantileEstimator` | Quantile, at each of `probs` | Posterior quantiles at 0.05, 0.25, 0.5, 0.75 and 0.95 |

Training is the costly stage in all three tabs, and later data sets of the same form need only a forward pass.

## Which Inputs the Simulation-Based Inference Tabs Take

| Input | Default | Effect |
|---|---|---|
| **Data** | `Z` | Observed values passed to the trained estimator |
| **Architecture** | DeepSet | DeepSet for replicates, GNN for irregular spatial data, LSTM for sequences |
| **Parameters (p)** | 2 | Length of the estimator output |
| **Replicates (m)** | 150 | Replicates, or sequence length, in each simulated data set |
| **Simulations per epoch (K)** | 10000 | Prior draws and data sets simulated in every epoch |
| **Epochs** | 200 | Passes through the simulated training set |

## Which Next Steps the Simulation-Based Inference Panel Offers

| Group | Next Steps |
|---|---|
| Visualise | **Estimates vs Truth**, **Sampling Distribution** |
| Diagnose | **Bias and RMSE**, **Interval Coverage** |
| Predict | **Estimate New Data** |
| Compare | **vs Maximum Likelihood** |
| Interpret | **RMSE vs Replicates** |

Most steps score the estimator on fresh simulated data sets, so they judge it under the assumed simulator. **vs Maximum Likelihood** holds only for the default Normal model, whose closed form it uses.

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
