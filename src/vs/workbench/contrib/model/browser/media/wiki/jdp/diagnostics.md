# Diagnostics

The checks in the jump-diffusion panel test whether a simulation behaves as its own assumptions predict. None compares the model with observed data, so a clean set of results says nothing about whether jumps of this kind exist in a real system.

## How to Inspect a Simulated Jump-Diffusion Path

**Plot Trajectory** draws X(t) from `sol` and marks a point after each jump, found where two saved times are equal. Vertical moves at the marked points, with a rough continuous curve between them, are the expected picture. A number of marks far from lambda T calls for a look at the rate. In **Custom Rate** the marks do not appear, since `VariableRateJump` by default saves the state only after a jump, leaving no repeated time. Jumps then show only as steep segments in the line.

## How to Read the Jump Counting Check

**Jump Counting** prints the observed count from repeated times and an expected count, Lambda, a sum of the rate over the saved steps. With a constant rate, Lambda is lambda T and the count is Poisson, so a gap within 2 sqrt(Lambda) is usual, and a larger one calls for another run before anything else. Repeated large gaps call for a review of any edit made to `rate` or to the jump. In **Custom Rate**, the observed count prints 0, because `VariableRateJump` by default saves no state before a jump. Editing the jump to `VariableRateJump(rate, affect!; save_positions=(true, true))` restores it. Even then the printed claim of a Poisson count does not hold, since the rate depends on the path, and 2 sqrt(Lambda) is only a rough guide.

## How to Compare Ensemble Moments with Theory

**Ensemble Moments** prints E[X(T)] and Var[X(T)] over 500 paths with the standard error of the mean, and in the two constant-rate tabs a theory line. A Monte Carlo mean within about two standard errors of the theory is the good result. Variance is noisier, particularly with large jumps or long horizons. The theory reads m and s from f and g at X = 1 and needs f = m X and g = s X. A drift such as `-0.1*(X-1.0)` gives m = 0, and a constant g gives a wrong s, while the line still prints. **Custom Rate** prints no theory, so only repeated runs give a reference.

## What the With vs Without Jumps Check Should Show

**With vs Without Jumps** solves 500 paths of `prob`, which has no jumps, and 500 of `jprob`, and prints the mean, the standard deviation, the skew and the excess kurtosis of log(X(T) / X0). Added spread is the expected signature, with excess kurtosis above zero and with skew following the sign of E[J^3]. In **Gaussian Jumps** the diffusion-only run keeps the compensated drift, so its mean log growth differs from the jump run by lambda muJ T, which is no error. With little or no visible effect, look at lambda T and at the jump size: rare or small jumps barely alter the law.

## How to Read the Jump Size Distribution Check

**Jump Size Distribution** solves 200 paths, takes the realised log-jump at each repeated time, prints their count, mean and standard deviation, and overlays the assumed density. Agreement between histogram and curve confirms that `affect!` does what the overlay says, and not that the model suits any real system. A gap appears when `affect!` has been edited and the overlay has not. In **Custom Rate** the list of jumps stays empty under the default `save_positions`, so the mean is `NaN`. Writing `VariableRateJump(rate, affect!; save_positions=(true, true))` fills the list.

## How to Test the Step Size of a Jump-Diffusion Run

The panel has no convergence check, and the test is done by hand. Compare the printed values of **Ensemble Moments** at **Step size dt** and at half of it, or, with SRIW1, LambaEM or RKMil, after adding `abstol=1e-3, reltol=1e-3` to `skw`. A shift larger than twice the standard error calls for further refinement. Raising `trajectories` in the same code lowers that error, at a higher cost. **Custom Rate** deserves particular care, as its jump times depend on the solver as well.

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Custom Rate](custom-rate.md)
