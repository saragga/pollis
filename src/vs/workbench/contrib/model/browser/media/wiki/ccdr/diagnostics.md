# Diagnostics

The central check is whether stated reliability matches realised reliability. Simulation allows a direct test, and the other checks explain any gap.

## How to Check the Realised Failure Rate

**Violation Rate** reports the target, `true_violation` from 100000 fresh draws, `reliable` if the rate is at or under the target, and `expected_overflow`. It speaks about one data set only. A rate slightly over the target on one sample may be bad luck in that sample, and not in the test draws, whose error is small. A rate far below the target means that the plan is over-protected, and that profit has been given away. Overflow tells how large the excess is, on average, across all draws.

## How to Measure Reliability Across Data Sets

**Reliability** repeats the whole procedure on 100 independent data sets, and shows the true failure rates as a histogram with epsilon marked. It prints the share of sets that exceeded the target. A plug-in chance constraint often misses in a large share of sets, and the histogram shows by how much. A distributionally robust plan with a sensible radius should sit further to the left. This is the most direct test, and a guarantee in a theorem says nothing about a specific radius until a test of this kind has been run.

## How to Compare Methods Across Sample Sizes

**CC vs DRO** plots the mean failure rate of each method at n from 10 to 1000, with 20 data sets at each size. Averages can hide the spread, so **Reliability** is a useful companion at a chosen n. As the sample grows, a Gaussian chance constraint on Gaussian data should approach the target, and a fixed theta holds its margin. Conclusions depend on theta, so rerun with others. With few samples, **Chance-Constrained** may also fail outright if the estimated covariance is near-singular.

## How to Confirm That a Constraint Is Active

**Worst-Case Distribution** shows what the formula guards against. In **Chance-Constrained**, the worst realisation lies at mu + z Sigma x / sqrt(x' Sigma x), and its printed use should match capacity at the optimum. In **Distributionally Robust**, the tail samples are shifted by theta / epsilon along x, which spends the whole transport budget where it hurts most. The picture shows whether the moved points cross the line. A plot far from the capacity line suggests that the constraint is not active, or that the solve has gone wrong.

## How to Read Solver Status and Numerical Issues

`solved` should be true. Clarabel, described by [Goulart and Chen (2024)](#ref-GC2024a), reports infeasible or numerical failures, which `is_solved_and_feasible` turns into false. With epsilon near 0.5, the `/ z` term becomes huge in the cone. With few samples, `cholesky` can fail when the sample covariance is singular. `JuMP.jl`, by [Dunning, Huchette and Lubin (2017)](#ref-DHL2017a), keeps the model readable, so a problem can be printed for inspection. A value of `x` that is near zero everywhere suggests a radius so large that nothing is safe to produce.

## How to Check the Picture of the Constraints

**Feasible Region** draws the boundary of each constraint along rays from the origin, with the optimum marked. Regions should nest, with nominal outermost and box robust usually innermost. An optimum should lie on the active boundary. If a tighter method's region lies outside a looser one, look for a coding error. **Uncertainty Set** shows samples with the line xi'x* = b. Its ellipsoid is what the constraint protects against, and its own probability content is smaller than 1 − epsilon, as the action's description explains.

## References

<a id="ref-DHL2017a"></a>Dunning, I., Huchette, J. and Lubin, M. (2017). JuMP: a modeling language for mathematical optimization. *SIAM Review* 59(2), 295–320. [doi:10.1137/15M1020575](https://doi.org/10.1137/15M1020575)

<a id="ref-GC2024a"></a>Goulart, P. J. and Chen, Y. (2024). Clarabel: an interior-point solver for conic programs with quadratic objectives. [arXiv:2405.12762](https://doi.org/10.48550/arXiv.2405.12762)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
