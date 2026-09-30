# Integration — Assumptions

## The Integral Must Exist

- **Improper integrals must converge.** $\int_1^{\infty} 1/x^2\,dx = 1$ but $\int_1^{\infty} 1/x\,dx$ diverges; a numerical method will still return a number for the second, with a large error estimate.
- **Integrable singularities.** $\int_0^1 1/\sqrt{x}\,dx = 2$ is fine: QuadGK never evaluates at the endpoints. A singularity *inside* the interval should be put at a limit, e.g. `quadgk(f, a, c, b)` splits at `c`.

## Smoothness Drives Accuracy

- Error formulas such as $O(h^2)$ and $O(h^4)$ assume $f$ has two or four continuous derivatives. With a kink the rate drops, and Gauss rules lose their advantage.
- Discontinuities and kinks should be at a limit or a split point.
- Highly oscillatory integrands ($\sin(100x)$) need many points per oscillation.

## Tolerances Are Estimates

The adaptive error estimate compares two rules; it is usually conservative for smooth $f$ but can be fooled by a narrow spike that no node lands on. Plot the integrand (Area Plot) before trusting the number.

## Monte Carlo

- Needs finite variance of $f$ over the region for the $N^{-1/2}$ rate and the standard error to hold.
- Results change from run to run; fix the seed (`using Random; Random.seed!(1)`) for reproducibility.

## Sampled Data

- The trapezoid rule assumes the curve is roughly linear between the points; Simpson assumes it is roughly quadratic across each pair of intervals.
- $x$ must be increasing. Measurement noise in $y$ passes straight into the integral.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
