# Interpretation

Outputs from the diffusion panel describe the equation you typed, not any observed system. Reading them well means separating one random draw from the law it comes from, and the behaviour of the exact equation from that of its scheme.

## What One Simulated Diffusion Path Represents

The object `sol` from the main code holds one draw of the random path, with times in `sol.t` and states in `sol.u`. Peaks, troughs and crossings in **Plot Trajectory** belong to that draw and change on each run, since the panel sets no `seed`. Passing `seed=1` to `solve` repeats a draw. Fixed-step solvers save points evenly, and adaptive ones crowd points where the error control asks for smaller steps. Between saved points `sol(t)` interpolates in a straight line, which understates the true roughness of the path.

## How to Read the Spread in Ensemble Paths

**Ensemble Paths** shows how far outcomes can differ under one equation and one starting point. The width of the fan at a time t reflects Var[X(t)], and its shape reflects the law: symmetric under additive noise with linear drift, skewed upward under g = b X. With 50 paths the outer edge is a rough sketch and not a confidence band. Tail probabilities need many more paths, and a dedicated count over the simulated values.

## Why the Mean and the Typical Path Differ Under Multiplicative Noise

For f = a X and g = b X in the Itô sense, E[X(t)] = X0 exp(a t), while the median is X0 exp((a - b^2/2) t). With a less than b^2/2, the mean can grow while almost every path decays to zero. The mean is carried by rare, very large paths, so sample means from a few paths tend to undershoot it at long horizons. A common misreading treats the mean curve from **Mean and Variance** as the path to expect.

## How to Read Strong and Weak Order in the Solver Menu

Strong order describes how fast E|X(T) - X_h(T)| falls with the step h, so it concerns following a particular Brownian path. Weak order describes how fast errors in expectations such as E[X(T)^2] fall, so it concerns the law only. Orders are rates, not accuracies, and a high-order solver can lose to EM at a coarse step. For statistics over many paths, weak order is the one that counts, and pathwise work such as filtering or sensitivity along a path needs strong order.

## How to Read the Difference Between Itô and Stratonovich

The two calculi are linked by a drift term: a Stratonovich equation with drift f equals an Itô equation with drift f + 0.5 g dg/dX. For g = b X the term is 0.5 b^2 X, so the Stratonovich mean grows at a + b^2/2 where the Itô mean grows at a. Neither answer is more accurate than the other, since they solve different models. The term vanishes for constant g, which makes the choice irrelevant under **Additive Noise**.

## What the Histogram in Stationary Distribution Means

The histogram pools states along one long path, so it estimates a long-run law only if the process forgets its start and the run far exceeds the correlation time. Neighbouring points are strongly dependent, so the effective sample is smaller than the count of points. Under g = b X and f = a X, the state heads to zero or to infinity, apart from the boundary case a = b^2/2 in the Itô form, so the plot shows only where this path has been.

## See Also

- [Diagnostics](diagnostics.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
