# Diagnostics

The checks in the panel simulate fresh data sets with known parameters and see what the trained estimator returns. They show how well the network learnt its task, and all of them take the simulator as true.

## How Estimates vs Truth Shows Parameter Recovery

**Estimates vs Truth** simulates 500 test data sets and plots each parameter's estimate against the value that generated it, with a dashed line where the two are equal. A good result is a narrow cloud along that line over the whole prior range. A wide cloud means weak information about the parameter, or too little training. A cloud that bends away from the line at the ends shows that the estimator shrinks towards the middle of the prior. Flat clouds say that the data barely inform the parameter, so check its identifiability before training for longer.

## How Bias and RMSE Measure Accuracy

**Bias and RMSE** reports both quantities for each parameter over 1000 simulated test data sets.

| Result | Likely reading | What to do |
|---|---|---|
| Bias small against RMSE | Errors are mostly random | Nothing, or raise **Replicates (m)** if the data allow |
| Bias large against RMSE | Systematic error, possibly shrinkage | Inspect **Estimates vs Truth**, then raise **Epochs** or **Simulations per epoch (K)** |
| RMSE near the spread of the prior | The network has learnt little beyond the prior | Check the parameter's identifiability and the network size |

Bayes estimators can be biased at a given parameter value, so read small bias as a good sign and not as a requirement.

## How Interval Coverage Tests the Uncertainty

**Interval Coverage** simulates 200 test data sets and reports the share of intervals holding the true value, beside the nominal level. That level is 0.95 for **Point** and **Interval**, and 0.90 for **Quantile**. Values near nominal are good. Lower values mean intervals that are too narrow, and higher ones mean intervals that are wider than needed. With 200 data sets, the standard error at a level of 0.95 is about 0.015, so small gaps are noise. Credible intervals need not reach their level at every parameter value, but here parameters come from the prior, the setting in which the level is meant to hold on average. In the **Point** tab, this step runs a bootstrap of `B = 100` per data set, so it is slower there.

## How Sampling Distribution Shows the Estimator's Spread

**Sampling Distribution** fixes the parameters at the observed estimate, simulates 500 data sets there and estimates again, with a vertical line at the observed estimate. A narrow, roughly bell-shaped histogram around the line is good. A histogram shifted from the line suggests bias near that point, even if bias looks small on average. A pile-up at one edge suggests that the estimate sits near a limit of the prior.

## How vs Maximum Likelihood Sets a Yardstick

**vs Maximum Likelihood** compares the RMSE of the network with that of the sample mean and standard deviation, over 1000 simulated data sets. Values close to each other suggest that training has done its job. A network well short of the closed form needs more training or a larger architecture. The step holds only for the default Normal model, so replace its formula when the model changes.

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
