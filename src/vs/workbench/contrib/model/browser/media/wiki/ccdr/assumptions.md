# Assumptions

Each formulation trades one assumption for another. The important questions are what is taken as known, what the guarantee covers, and whether the example matches a real task.

## What the Gaussian Assumption Costs

**Chance-Constrained** takes xi to be normal, so that the margin depends only on z and on variance. Under a skewed or heavy-tailed truth, the quantile can be wrong, and failure can be more frequent than epsilon. The panel's samples really are normal, so this flattering case hides the risk, and a run with a different `dist` in the code shows it. [Shapiro, Dentcheva and Ruszczyński (2021)](#ref-SDR2021a) give conditions for convexity and alternatives. Check the shape of xi before relying on the formula.

## Why Plugged-in Estimates Are an Assumption

The formula treats the sample mean and covariance as the truth. With limited data, this is false, and optimisation exploits the error: a decision tends to load on coefficients that the sample happens to understate. A real failure rate often sits above the nominal level as a result. **Reliability** measures that effect for this problem. Larger samples reduce the effect, and so do the wider margins from a robust formulation. A decision is only as reliable as the estimate behind it.

## What the Wasserstein Ball Assumes

A guarantee holds only if the true distribution lies in the ball, and a fixed theta may or may not reach it. The distance is the Euclidean norm, as seen in `SecondOrderCone()` over x, so xi's components should be on comparable scales, or one component will dominate. The samples are taken to be independent draws of the future. Should the future drift away from the past, a ball around history does not necessarily cover it, and a larger radius only partly compensates. [Mohajerin Esfahani and Kuhn (2018)](#ref-EK2018a) derive their guarantees under independent sampling and light tails.

## What a Single Linear Constraint Assumes

The example has one capacity and linear use. Those features yield exact forms. Several constraints jointly reach a different problem: individual constraints each at level epsilon can jointly fail far more often than epsilon. A simple but conservative fix splits the allowed risk across the constraints. Nonlinear constraints lose the cone structure, and a loss that is not Lipschitz breaks the theta ‖x‖ term. Treat the small model as an instruction in method, rather than as a template that applies everywhere.

## What Probability Does Not Cover

A chance constraint bounds how often a failure happens, and not how bad it is. A rare catastrophe and a rare small excess look the same to it. The example also assumes that failure is acceptable with a fixed probability, and that a planner cannot react once xi is seen. If decisions can adapt, a two-stage model is a better representation, and it usually gives better plans. CVaR constraints address the size of failure, as the **Distributionally Robust** tab does in effect.

## What the Test Against Truth Assumes

`violation` uses 100000 draws from the true `dist`. That is possible only in simulation, and the standard error near 0.05 is about 0.0007, so small differences are noise. Real data have no such oracle. A held-out sample serves the same purpose less precisely, and needs the assumption that the future resembles it. Claims from these runs apply to this model and to its fixed seeds. They may not transfer, even though the method does.

## References

<a id="ref-EK2018a"></a>Mohajerin Esfahani, P. and Kuhn, D. (2018). Data-driven distributionally robust optimization using the Wasserstein metric. *Mathematical Programming* 171(1–2), 115–166. [doi:10.1007/s10107-017-1172-1](https://doi.org/10.1007/s10107-017-1172-1)

<a id="ref-SDR2021a"></a>Shapiro, A., Dentcheva, D. and Ruszczyński, A. (2021). *Lectures on Stochastic Programming: Modeling and Theory*, 3rd ed. SIAM. [doi:10.1137/1.9780898718751](https://doi.org/10.1137/1.9780898718751)

## See Also

- [Factsheet](factsheet.md) · [Chance-Constrained](chance-constrained.md) · [Distributionally Robust](dro.md) · [Diagnostics](diagnostics.md)
