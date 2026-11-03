# SDE Ensemble Analysis: Assumptions

What the panel assumes about the equation, the noise, the paths and the horizon, and what each analysis needs to hold.

## An Itô equation with one Brownian motion

The panel solves a scalar SDE, dX = f(X, t) dt + g(X, t) dW, with one Brownian motion. `SDEProblem` treats it in the Itô sense, the interpretation of SRIW1, EM and LambaEM in the DifferentialEquations.jl documentation; RKMil solves the Itô problem by default and can be switched to Stratonovich.

[Särkkä and Solin (2019)](#ref-SS2019a) explain the difference: the Itô integral evaluates the integrand at the start of each interval, the Stratonovich integral at its middle point. A Stratonovich SDE can be converted into an equivalent Itô equation, and when the diffusion does not depend on the state, as with the default g = 0.3, the two interpretations are the same.

## Independent paths

Every path of the ensemble uses its own Brownian motion, so the paths are independent draws from the law of the solution. The mean and standard deviation across paths, the crossing times and the terminal values are then samples of independent, identically distributed quantities; the panel's standard errors divide the standard deviation across paths by √N.

[Rackauckas and Nie (2017)](#ref-RN2017a) describe the Monte Carlo functionality of DifferentialEquations.jl as solving a problem N times and returning a vector of results along with summary statistics. The documentation warns that a custom noise process may need its own `prob_func`, since each trajectory needs its own noise process; the panel uses the default Wiener process.

## Additive or multiplicative noise

**Diffusion g(X,t)** accepts a constant, for additive noise, or an expression in X, for multiplicative noise, such as 0.2*X. [Särkkä and Solin (2019)](#ref-SS2019a) note that with additive noise the Milstein method reduces to Euler–Maruyama, so that the strong order of Euler–Maruyama is 1 in that case, and that simulating strong solutions with a state-dependent diffusion is harder, because iterated Itô integrals appear already in low-order methods.

The DifferentialEquations.jl documentation lists SRIW1 for diagonal or scalar Itô SDEs, and RKMil for scalar and diagonal noise; a scalar equation has scalar noise.

## Solver accuracy

The ensemble statistics are those of the numerical paths, not of the exact solution. [Särkkä and Solin (2019)](#ref-SS2019a) define the strong order through the error of the paths, E|x(t_M) − x̂(t_M)| ≤ K Δtᵞ, and the weak order through the error of expectations, |E[g(x(t_M))] − E[g(x̂(t_M))]| ≤ K Δtᵅ for polynomial g. Euler–Maruyama has strong order 1/2 and weak order 1.

For the means, variances and densities of the panel, the weak order is the relevant one; the documentation recommends high weak order solvers when only an accurate draw from the distribution induced by the SDE is wanted. **Convergence in N** checks the mean against the exact Ornstein–Uhlenbeck value, when the drift and diffusion have that form.

## A long enough horizon

**Invariant Distribution** treats the terminal values X(T) as draws from the stationary distribution. The tooltip of **Time span T** asks for a long horizon, such as 1 000, so that the paths converge to the stationary measure.

For the Ornstein–Uhlenbeck process dx = −λx dt + dβ, [Särkkä and Solin (2019)](#ref-SS2019a) give the mean and variance equations dm/dt = −λm and dP/dt = −2λP + q, with m(0) = x₀ and P(0) = 0. **Convergence in N** prints their solutions at T for the current inputs, x₀ exp(−θT) for the mean and |σ| √((1 − exp(−2θT))/(2θ)) for the standard deviation, which show how far X(T) still is from the stationary law.

## A stationary distribution exists

[Särkkä and Solin (2019)](#ref-SS2019a) note that solving the stationary Fokker–Planck–Kolmogorov equation is hard in general, and tractable when the SDE has the form dx = −½ ∇v(x) dt + dβ, with a potential v and diffusion constant q. The stationary density is then p(x) = exp(−v(x)/q)/Z, with Z = ∫ exp(−v(x)/q) dx.

For the Ornstein–Uhlenbeck process, v(x) = λx² and the stationary law is normal with mean 0 and variance q/(2λ). For more general stationary solutions, [Särkkä and Solin (2019)](#ref-SS2019a) refer to the book by Gardiner.

## References

<a id="ref-RN2017a"></a>Rackauckas, C., & Nie, Q. (2017). DifferentialEquations.jl: A Performant and Feature-Rich Ecosystem for Solving Differential Equations in Julia. *Journal of Open Research Software* 5(1), 15. [doi:10.5334/jors.151](https://doi.org/10.5334/jors.151)

<a id="ref-SS2019a"></a>Särkkä, S., & Solin, A. (2019). *Applied Stochastic Differential Equations*. Cambridge University Press. [doi:10.1017/9781108186735](https://doi.org/10.1017/9781108186735)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Path Statistics](path-statistics.md) · [First Passage Time](first-passage.md) · [Invariant Distribution](invariant.md)
