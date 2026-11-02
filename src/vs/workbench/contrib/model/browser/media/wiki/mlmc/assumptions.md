# Multilevel Monte Carlo — Assumptions

The saving of a multilevel estimator rests on how fast the corrections shrink, and the size of the error it reports rests on a regression over a few levels. Neither is guaranteed, and each assumption has its own check among the Next Steps.

## Why Fine and Coarse Levels Must Share Their Random Input

Multilevel Monte Carlo needs Q_l and Q_(l-1) to be computed from the same random input. The **GBM Call Option** code builds the coarse path by summing pairs of fine Brownian increments, and **Random Integral** reads the same X on both grids. A broken coupling leaves the variance of the correction as large as the variance of Q_l, and the method then costs more than single-level sampling. A flat curve in **Variance Decay** is the sign.

## What Happens When Multilevel Corrections Do Not Decay Regularly

The theory needs |E[Q_l - Q_(l-1)]| and Var[Q_l - Q_(l-1)] to fall geometrically in l, at rates alpha and beta. A payoff with a jump, a coarsest grid too coarse to resolve the problem, or a wrong coupling can break the pattern. **Mean Decay** and **Variance Decay** then show ratios that wander from level to level. The fitted rates, the allocation and the stopping rule all lose their basis.

## Why the Multilevel Bias Estimate Relies on Extrapolation

The exact bias is unknown in general, so the package fits a line to log2 |E[Q_l - Q_(l-1)]| over the last three levels and reads off the size of the next correction. A noisy last level moves this estimate, and an estimate that is too small stops the run too early. The panel prints the exact answer, which a real application would lack, so the true error can be compared with the tolerance.

## How the Cost Model of the Multilevel Panel Can Mislead

`cost(level) = 2.0^level[1]` fixes the cost of one sample, both for the allocation and for the printed total, so gamma equals 1 by construction. Real time per sample may differ, especially on coarse levels where the overhead of parallel evaluation outweighs the work. **Cost per Level** plots the model against the measured time. A wide gap on fine levels makes the allocation less than optimal, though the estimate itself remains valid.

## What the MLQMC Tab Assumes About Smoothness

Lattice rules gain over random sampling when the integrand is smooth and its variation is concentrated in a few coordinates. **Random Integral** has one smooth input and suits this well. **GBM Call Option** has a kink in the payoff, and it feeds Brownian increments to the lattice in time order, with no Brownian bridge or principal component ordering, so every coordinate matters about equally on a fine level. Running **Multilevel vs Single Level** on both tabs shows what the lattice actually saved.

## See Also

- [Diagnostics](diagnostics.md) · [Complexity Theorem](complexity-theorem.md) · [Decision Guide](decision-guide.md)
