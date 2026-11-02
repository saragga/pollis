# Additive

Additive noise means a diffusion coefficient that does not depend on the state. The equation is then simpler both to analyse and to solve, and the tab offers solvers that exploit that.

## What the Additive Noise Tab Computes

The **Additive Noise** tab solves dX = f(X,t) dt + sigma dW from **Initial state X0** over [0, **Time span T**], where g(X, p, t) returns **Noise sigma**. A step of EM reads X(n+1) = X(n) + f(X(n), t(n)) dt + sigma dW(n), with dW(n) a Normal(0, dt) draw. Any Julia expression in X is accepted for **Drift f(X,t)**, and the default `-0.5*X` is mean-reverting. The result `sol` is one simulated path.

## What the Linear Additive Equation Gives in Closed Form

With f = a X, the Ornstein-Uhlenbeck equation of [Uhlenbeck and Ornstein (1930)](#ref-UO1930a) has a Gaussian solution at each time.

- Mean: E[X(t)] = X0 exp(a t)
- Variance: Var[X(t)] = sigma^2 (exp(2 a t) - 1) / (2 a)
- Stationary law for a < 0: Normal(0, sigma^2 / (2 theta)), where theta = -a

**Mean and Variance** and **Stationary Distribution** overlay these formulas. Both read a from f at X = 1, so the overlay is valid only for a drift without a constant term. A level other than zero, as in `-0.5*(X-2)`, needs the curves worked out by hand.

## Which Solvers Suit Additive Noise

Since g is constant, the Milstein correction is zero, and EM in fact reaches strong order 1 and not the 1/2 shown in its label. SRA1 and SOSRA2 are built for this noise class, with strong order 3/2 and weak order 2. SRA1 comes from [Rößler (2010)](#ref-Ros2010a), and SOSRA2 is a stability-optimised method ([Rackauckas and Nie (2020)](#ref-RN2020a)). Both are adaptive, though the label of SRA1 says fixed step. LambaEM adapts the step of EM with the controller of [Lamba (2003)](#ref-Lam2003a).

## Where Additive Noise Modelling Is Strong

Additive noise fits disturbances whose size has nothing to do with the state: outside forcing and measurement-like shocks. Results are easy to check, as the linear case is fully known. Itô and Stratonovich give one equation here, so no choice of calculus is involved. Solver cost is low too, as there is no derivative of g to approximate. That makes it a sound first model to try.

## Where Additive Noise Modelling Misleads

Additive noise pays no attention to boundaries, so X can go negative with positive probability, however large the current level and however small sigma is. Prices, populations and concentrations therefore fit it poorly, except as an approximation near a level far from zero. A state-dependent expression typed into **Noise sigma** still runs with EM or LambaEM, but SRA1 and SOSRA2 then lose their basis, and **Mean and Variance** reads the value at X = 1 as a constant. Under a drift with a > 0 there is no stationary law, and the panel draws no normal curve.

## What to Compare the Additive Noise Tab With

Run the same drift in **Multiplicative Noise** with a proportional **Diffusion g(X,t)** such as `0.3*X`, and note how shocks scale with the level. Inside the tab, compare EM against SOSRA2 at tight tolerances for a sense of discretisation error. For a process with sudden moves as well as additive noise, the **Custom Rate** and **Compound Poisson** tabs of the Jump-Diffusion Processes panel accept a constant in **Diffusion g(X,t)**.

## References

<a id="ref-Lam2003a"></a>Lamba, H. (2003). An adaptive timestepping algorithm for stochastic differential equations. *Journal of Computational and Applied Mathematics* 161(2), 417–430. [doi:10.1016/j.cam.2003.05.001](https://doi.org/10.1016/j.cam.2003.05.001)

<a id="ref-RN2020a"></a>Rackauckas, C. and Nie, Q. (2020). Stability-optimized high order methods and stiffness detection for pathwise stiff stochastic differential equations. *2020 IEEE High Performance Extreme Computing Conference (HPEC)*, 1–8. [doi:10.1109/hpec43674.2020.9286178](https://doi.org/10.1109/hpec43674.2020.9286178)

<a id="ref-Ros2010a"></a>Rößler, A. (2010). Runge–Kutta methods for the strong approximation of solutions of stochastic differential equations. *SIAM Journal on Numerical Analysis* 48(3), 922–952. [doi:10.1137/09076636X](https://doi.org/10.1137/09076636X)

<a id="ref-UO1930a"></a>Uhlenbeck, G. E. and Ornstein, L. S. (1930). On the theory of the Brownian motion. *Physical Review* 36(5), 823–841. [doi:10.1103/PhysRev.36.823](https://doi.org/10.1103/PhysRev.36.823)

## See Also

- [Factsheet](factsheet.md) · [Multiplicative](multiplicative.md) · [Stratonovich](stratonovich.md) · [Diagnostics](diagnostics.md)
