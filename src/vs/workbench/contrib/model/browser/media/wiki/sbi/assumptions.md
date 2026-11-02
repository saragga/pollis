# Assumptions

No likelihood is written down, but the model has not gone away: it now lives in `sampler` and `simulator`. Most failures of a neural estimator come from what those two functions assume, or from applying the network outside what it saw in training.

## Why the Simulator Must Describe the Real Data

The estimator learns only from simulated data sets, so it is trained for the world that `simulator` describes. If real data have heavier tails, dependence or outliers that the simulator lacks, the network still returns confident numbers, with nothing in its output to warn of the gap. Every check in the panel uses the same simulator and so cannot reveal this. To test it, compare summaries of the observed data with the same summaries from data simulated at the estimate, and look for observed values at the edge of the simulated range. A clear gap means the simulator should change before any estimate is trusted.

## Why the Prior Limits What the Estimator Can Return

Training draws parameters from `sampler`, so that function acts as the prior and also sets the region where the network has seen examples. Outside that region, the output is an extrapolation. A prior that is too narrow can pull estimates towards its range and hide a true value beyond it, while one that is too wide spreads the training effort thinly. Estimates that pile up near a limit of the prior are the usual sign. Retrain with a wider range if the limit has no firm justification.

## Why New Data Must Have the Form Used in Training

**Replicates (m)** fixes the size of each simulated data set, and the tooltip asks that it fit the observed data. An estimator trained at one m is not guaranteed to work at another, as **RMSE vs Replicates** can show. The same goes for the tab's other fixed choices.

| Architecture | What must stay fixed |
|---|---|
| **DeepSet** | Replicates that are independent, as their order is ignored |
| **LSTM** | A sequence whose order carries the information |
| **GNN (Graph Neural Network)** | A neighbourhood graph built with `r = 0.15`, on locations in `S` scaled like the training ones |

The default `S` holds 100 random points, so replace it with the real locations.

## Why Training Must Reach a Good Estimator

The result is the Bayes estimator only if the network is flexible enough and training comes close to its best. A small network, too few **Simulations per epoch (K)** or too few **Epochs** gives an estimator that falls short, even with a sound model. The loss alone does not show how far short. **Estimates vs Truth** and **Bias and RMSE** show the effect on the parameters, and retraining with greater K or a larger network shows whether those results still improve. Where a known estimator exists, **vs Maximum Likelihood** offers a firm yardstick.

## What Each Interval Method Assumes

Bootstrap intervals in the **Point** tab rest on the simulator at the estimate standing in for the true model, so a poor estimate carries over into the interval. Bounds in the **Interval** and **Quantile** tabs are amortised, so they rest on quantile regression being learnt well in the region of the data. Both are marginal, one parameter at a time, and none of them says how two parameters vary together. **Interval Coverage** tests each of them on data from the assumed simulator, not on real data.

## See Also

- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
