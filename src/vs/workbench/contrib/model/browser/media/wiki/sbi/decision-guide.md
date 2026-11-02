# Decision Guide

Neural estimation pays off when simulating is cheap, the likelihood is out of reach and similar data sets will keep arriving. Start by asking whether the likelihood really is out of reach, then choose what to estimate and how to summarise the data.

## When to Use Simulation-Based Inference at All

| Situation | Better option | Why |
|---|---|---|
| A likelihood that can be evaluated and is differentiable | Probabilistic Programming with Turing.jl panel | Exact posterior sampling, with its own diagnostics |
| A likelihood that is intractable, and a simulator that is cheap | This panel | Training needs only simulations |
| Many similar data sets to estimate | This panel | One forward pass per data set after training |
| One data set, with a simulator that is very slow | Reconsider the approach | K simulations in each epoch may be out of reach |

A model with a closed-form estimator rarely needs a network at all, apart from practice or as a test of training.

## Which Simulation-Based Inference Tab Suits Which Need

| Need | Tab | Why |
|---|---|---|
| A single best guess, with intervals when asked | **Point** | Trains one network, and the bootstrap adds intervals afterwards |
| Credible bounds at every estimate, at low cost | **Interval** | Forward pass gives the 95% bounds directly |
| The shape of each marginal posterior | **Quantile** | Five quantiles for each parameter from one estimator |
| Many data sets with intervals for each | **Interval** or **Quantile** | No simulation is needed at estimation time |

The **Point** tab's bootstrap needs new simulations for every data set, so its intervals are the slowest at estimation time.

## Which Architecture Suits Which Data

| Data | **Architecture** | Why |
|---|---|---|
| Independent replicates, in no meaningful order | **DeepSet** | Permutation-invariant summary |
| Observations at irregular spatial locations | **GNN (Graph Neural Network)** | Uses neighbourhoods, and needs the real locations in `S` |
| One ordered sequence | **LSTM** | Keeps the order, and the final hidden state summarises it |

Check that the `simulator` for the chosen option gives data in the same form as the observed values, as changing **Architecture** alone leaves the model's assumptions unchanged.

## How to Set Replicates, Simulations and Epochs

Set **Replicates (m)** to the size of the observed data, and retrain if that size changes much. Keep **Simulations per epoch (K)** at the default of 10000 at first, and raise it when **Bias and RMSE** still improve on retraining, since more simulations reduce overfitting. The tooltip for **Epochs** gives 100 to 500 as a typical range, with 200 as the default. Start small to confirm that the code runs and that **Estimates vs Truth** moves in the right direction, then scale up for the final fit.

## How to Decide That an Estimator Is Ready

| Check | Ready when | If not |
|---|---|---|
| **Estimates vs Truth** | Clouds follow the line over the whole prior | Train for longer, or use a larger network |
| **Bias and RMSE** | Stable on retraining at greater K | Raise K or **Epochs** |
| **Interval Coverage** | Near the nominal level | Retrain, or move to a tab with learnt bounds |
| **vs Maximum Likelihood** | Close to the known estimator, where one exists | Treat the network as untrained for the purpose |
| Observed summaries | Inside the range simulated at the estimate | Change the simulator |

Only the last row concerns the real data, so do not skip it before reporting a result.

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
