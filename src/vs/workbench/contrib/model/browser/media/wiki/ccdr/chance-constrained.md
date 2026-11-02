# Chance-Constrained

A chance constraint limits the probability of failure, rather than ruling failure out. With a normal distribution and a single linear constraint, it becomes a tractable cone constraint.

## How the Gaussian Reformulation Works

Suppose that xi is normal with mean mu and covariance Sigma. Then xi'x is normal with mean mu'x and variance x' Sigma x, and the constraint at level epsilon becomes deterministic:

- mu'x + z ‖L x‖ ≤ b, with z = Phi^(-1)(1 − epsilon) and Sigma = L'L

The term z ‖L x‖ is a safety margin that grows with the risk taken and with tighter reliability. In JuMP, the code writes `[(b - dot(mu, x)) / z; L * x] in SecondOrderCone()`, an exact statement of the same inequality, and Clarabel solves it. [Shapiro, Dentcheva and Ruszczyński (2021)](#ref-SDR2021a) treat such constraints in full.

## Why epsilon Must Stay Below One Half

For epsilon below 0.5, z is positive, and the constraint is a convex cone. At epsilon = 0.5, z is zero and the margin vanishes, so the code's division by z fails. Above 0.5, z is negative, the set stops being convex, and a planner would in any case be accepting failure as the normal outcome. The tooltip states that limit. Typical settings are between 0.01 and 0.10. Smaller values cost more, since z grows quickly as epsilon falls, and the extra cost tends to rise steeply as reliability nears 1.

## Why Estimated Parameters Weaken the Guarantee

The tab estimates mu and Sigma from **Samples (n)** and plugs them in, as if they were true. A decision is then tuned to those estimates, and optimisation favours estimates that look too favourable. The real probability of failure can therefore exceed epsilon, and it often does for small n. **Reliability** repeats the whole procedure, and shows how often the target is missed. A rise in n reduces the gap. Inflating z, or using a fitted ball as in [Distributionally Robust](dro.md), protects against the problem more directly.

## How Other Distributions and Several Constraints Change the Problem

A normal assumption gives a closed form that no other family generally shares. Heavy tails make the normal quantile too small, and the constraint under-protects. Several constraints that must hold together, a joint chance constraint, generally give a non-convex set. A sample-based approach then counts violated scenarios with binary variables, as analysed by [Luedtke and Ahmed (2008)](#ref-LA2008a), at the cost of a mixed-integer program. A convex alternative replaces the constraint with a safe bound such as CVaR, following [Nemirovski and Shapiro (2006)](#ref-NS2006a).

## Which Inputs the Chance-Constrained Tab Uses

**Violation Probability (epsilon)** sets z, and **Samples (n)** sets how many draws inform mu and Sigma. **Wasserstein Radius (theta)** has no effect on `solve_cc`, and is used only in comparisons. Samples use a fixed seed of 1, so changing n adds to the same stream, and **Reliability** provides the fresh sets. The printed `true_violation` compares the decision with fresh draws from the true distribution. A real application has no such check, so it needs a held-out sample instead.

## Where Chance Constraints Are Strong and Weak

A chance constraint speaks in a language that managers use, such as service level or reliability, and it can cost far less than a worst-case plan. The normal case is cheap to solve and easy to explain. Weakness comes from reliance on a distribution, and the probability says nothing about how bad a failure would be. **Violation Rate** therefore adds `expected_overflow`. Where the size of a failure matters more than its frequency, a CVaR constraint is often the better statement.

## References

<a id="ref-LA2008a"></a>Luedtke, J. and Ahmed, S. (2008). A sample approximation approach for optimization with probabilistic constraints. *SIAM Journal on Optimization* 19(2), 674–699. [doi:10.1137/070702928](https://doi.org/10.1137/070702928)

<a id="ref-NS2006a"></a>Nemirovski, A. and Shapiro, A. (2006). Convex approximations of chance constrained programs. *SIAM Journal on Optimization* 17(4), 969–996. [doi:10.1137/050622328](https://doi.org/10.1137/050622328)

<a id="ref-SDR2021a"></a>Shapiro, A., Dentcheva, D. and Ruszczyński, A. (2021). *Lectures on Stochastic Programming: Modeling and Theory*, 3rd ed. SIAM. [doi:10.1137/1.9780898718751](https://doi.org/10.1137/1.9780898718751)

## See Also

- [Factsheet](factsheet.md) · [Distributionally Robust](dro.md) · [Assumptions](assumptions.md) · [Interpretation](interpretation.md)
