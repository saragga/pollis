# Stratonovich

The Stratonovich integral of [Stratonovich (1966)](#ref-Str1966a) reads the integrand at the middle of each step and not at its start. Ordinary calculus rules then apply, at the price of a process that looks ahead within the step.

## What the Stratonovich Tab Computes

The tab solves dX = f(X,t) dt + g(X,t) o dW, where o dW marks the Stratonovich integral, with **Drift f(X,t)**, **Diffusion g(X,t)**, **Initial state X0** and **Time span T**. In StochasticDiffEq.jl, `SDEProblem` is the same call as in the Itô tabs, and the calculus depends on the solver alone. A step of EulerHeun is a predictor and a corrector:

- Predictor: U = X + f(X) dt + g(X) dW
- Corrector: X(n+1) = X + 0.5 (f(X) + f(U)) dt + 0.5 (g(X) + g(U)) dW

Averaging g across the step is what brings in the Stratonovich meaning. The scheme is the improved Euler form of [Roberts (2012)](#ref-Rob2012a).

## How the Stratonovich and Itô Equations Are Related

Each Stratonovich equation has an Itô equation with the same solution: f_Ito(X,t) = f(X,t) + 0.5 g(X,t) dg/dX, with g unchanged. A comment in the main code of the tab states this relation. For f = a X and g = b X in Stratonovich form:

- Solution: X(t) = X0 exp(a t + b W(t))
- Mean: E[X(t)] = X0 exp((a + b^2/2) t)
- Variance: Var[X(t)] = X0^2 exp((2 a + b^2) t) (exp(b^2 t) - 1)

**Mean and Variance** in this tab overlays these formulas. They hold only when the solver really treats the equation as Stratonovich.

## Why Smooth Noise Leads to the Stratonovich Form

[Wong and Zakai (1965)](#ref-WZ1965a) studied ordinary differential equations driven by smooth approximations of Brownian motion. As the approximation tightens, the solutions tend to the Stratonovich equation and not the Itô one. Physical noise is usually smooth on some short time scale, which is the usual argument for this form in physics and engineering. The argument has limits, and which form suits a system depends on the time scales involved ([van Kampen (1981)](#ref-Kam1981a)).

## Which Solvers Solve the Stratonovich Equation in the Panel

| Solver | Step control | Calculus as called by the panel |
|---|---|---|
| EulerHeun | Fixed | Stratonovich |
| LambaEulerHeun | Adaptive | Stratonovich |
| RKMilCommute | Adaptive | Itô |

The panel writes `RKMilCommute()`, whose keyword `interpretation` defaults to Itô, so choosing it here solves the Itô equation under a Stratonovich heading, and the overlay of **Mean and Variance** no longer applies. To run it as a Stratonovich solver, edit the call to `RKMilCommute(interpretation=SciMLBase.AlgorithmInterpretation.Stratonovich)`. Its label also says fixed step, whereas the type is adaptive.

## Where the Stratonovich Tab Is Strong

The form suits models derived from physics, and any setting where a change of variable should follow the ordinary chain rule. Transforming to log X, for example, gives d(log X) = (f / X) dt + (g / X) o dW with no extra term, and manifolds and coordinate changes stay simple. EulerHeun has strong order 1 for scalar or commutative noise, without needing any derivative of g.

## Where the Stratonovich Form Misleads

X(t) is no longer a martingale when f = 0, since the hidden drift 0.5 g dg/dX remains. Readers used to Itô models may then misjudge the mean, which for g = b X grows even with a = 0. Finance models usually assume that positions are set before the shock, which is an Itô setting, so applying this form to prices changes the model's meaning. Coefficients taken from a paper in one form and run in the other shift the drift without any error appearing. The form also changes nothing when g is constant.

## What to Compare the Stratonovich Tab With

**Ito vs Stratonovich** is meant for this comparison, though as written it needs `save_noise=true` in its first solve for both curves to share a Brownian path. A more direct test runs **Multiplicative Noise** with the same g and the corrected drift f + 0.5 g dg/dX, and compares the ensembles of the two tabs, which should agree up to Monte Carlo and discretisation error.

## References

<a id="ref-Kam1981a"></a>van Kampen, N. G. (1981). Itô versus Stratonovich. *Journal of Statistical Physics* 24(1), 175–187. [doi:10.1007/BF01007642](https://doi.org/10.1007/BF01007642)

<a id="ref-Rob2012a"></a>Roberts, A. J. (2012). Modify the improved Euler scheme to integrate stochastic differential equations. arXiv:1210.0933. [doi:10.48550/arXiv.1210.0933](https://doi.org/10.48550/arXiv.1210.0933)

<a id="ref-Str1966a"></a>Stratonovich, R. L. (1966). A new representation for stochastic integrals and equations. *SIAM Journal on Control* 4(2), 362–371. [doi:10.1137/0304028](https://doi.org/10.1137/0304028)

<a id="ref-WZ1965a"></a>Wong, E. and Zakai, M. (1965). On the convergence of ordinary integrals to stochastic integrals. *The Annals of Mathematical Statistics* 36(5), 1560–1564. [doi:10.1214/aoms/1177699916](https://doi.org/10.1214/aoms/1177699916)

## See Also

- [Factsheet](factsheet.md) · [Additive](additive.md) · [Multiplicative](multiplicative.md) · [Decision Guide](decision-guide.md)
