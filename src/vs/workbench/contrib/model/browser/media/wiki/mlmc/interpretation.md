# Multilevel Monte Carlo — Interpretation

Most outputs of the panel describe how the work was shared across levels, not the quantity being estimated. The estimate is one number, and the rest says how much to believe it and what it cost.

## How to Read the Printed Results of a Multilevel Run

The run prints the estimate and the exact answer, the error, the estimated RMSE and the tolerance, the number of levels, the samples per level and the total cost. Total cost is the sum over levels of samples times 2^l, a count of grid points or time steps and not of seconds. On **MLQMC**, the samples per level are points per shift multiplied by **n Shifts**. An error under the tolerance in one run is a good sign and no more, since that error is itself random.

## How to Read the Level Decay Plot of a Multilevel Estimator

**Level Decay Plot** shows three lines on a log2 scale against level: Var[Q_l], Var[Q_l - Q_(l-1)] and |E[Q_l - Q_(l-1)]|. The first stays about flat, since the quantity itself changes little with the grid. The two others should fall as straight lines, with slopes -beta and -alpha. The vertical gap between the two variance lines on a level is roughly the saving from using the correction there.

## How to Read Samples and Cost Across Multilevel Levels

**Level Table** gives samples, E[dQ], Var[dQ], cost per sample and cost share on each level. Level 0 reports Q_0 itself, and the estimate is the sum of the E[dQ] column. **Sample Allocation** plots samples and cost share. The spread of the cost share shows the regime that the complexity theorem predicts: piled on coarse levels for beta > gamma, even for beta = gamma, and piled on the finest levels for beta < gamma.

## What the Fitted Rates of a Multilevel Run Mean

**Rates** prints alpha, beta and gamma next to the theory for the chosen problem. The fits use levels 1 to L, so a run needs at least three levels to give a rate, and a rate from three or four noisy points is rough. A gamma of exactly 1 is not a measurement: it comes from the cost model in the code. Beta on **MLQMC** is a rate for independent points, and says nothing about the gain from the lattice.

## How to Read the Multilevel Bias Estimate

**Mean Decay** and **Confidence Interval** print a bias estimate, and the label in **Mean Decay** writes it as |E[Q - Q_L]|. The value in fact comes from the package's extrapolation of the next correction, |E[Q_(L+1) - Q_L]|. With regular decay the full remainder is larger, by a factor of about 2 when alpha = 1 and 4/3 when alpha = 2. Reading the printed figure as the whole bias therefore understates it.

## How to Read the Multilevel Confidence Interval

**Confidence Interval** gives the estimate plus or minus 1.96 times the square root of the estimator variance. It covers sampling error only, and the bias estimate appears on a line of its own. A last line says whether the exact answer lies inside. An exact answer just outside is no failure by itself, as about one run in twenty lands there even with no bias, while repeated misses across values of **Seed** point to bias.

## How to Read the Cost Forecast and Cost Curves of the Multilevel Panel

**Cost Forecast** applies the complexity theorem to the measured rates and predicts the cost of a tolerance ten times smaller. Rates within 0.25 of each other count as equal, so a small error in beta can change the regime. **Cost vs Tolerance** plots measured cost against tolerance, with a dashed line of slope tol^-2. On **MLQMC**, the forecast uses the rates of independent sampling and tends to overstate the growth.

## See Also

- [Diagnostics](diagnostics.md) · [Complexity Theorem](complexity-theorem.md) · [Decision Guide](decision-guide.md)
