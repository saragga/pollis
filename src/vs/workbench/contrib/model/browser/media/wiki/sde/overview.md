# Overview

A diffusion is a continuous random path whose small moves have a mean set by a drift and a variance set by a diffusion coefficient. The integral that gives such an equation a precise meaning was introduced by [Itô (1944)](#ref-Ito1944a), and a second definition with ordinary calculus rules by [Stratonovich (1966)](#ref-Str1966a).

## What a Stochastic Differential Equation Says

The form dX = f(X,t) dt + g(X,t) dW is shorthand for an integral equation: X(t) equals X(0), plus the integral of f over time, plus the integral of g against Brownian motion W. Over a short step h, X moves by about f h plus g times a Normal(0, h) draw, so the noise is of size sqrt(h) and dominates the drift at small scales. Brownian paths are too rough for an ordinary integral, and the result depends on where g is read within each step: at the start for Itô, at the midpoint for Stratonovich.

## Where the Numerical Methods for Diffusions Come From

The Euler scheme for these equations goes back to [Maruyama (1955)](#ref-Mar1955a), hence the name Euler-Maruyama, shortened to EM in **Solver**. [Mil'shtejn (1975)](#ref-Mil1975a) added a correction that raises the strong order to 1, and stochastic Runge-Kutta methods such as SRIW1 and SRA1 reach 3/2 ([Rößler (2010)](#ref-Ros2010a)). [Higham (2001)](#ref-Hig2001a) gives a short introduction to these schemes. The panel calls them through the ecosystem of [Rackauckas and Nie (2017)](#ref-RN2017a).

## How the Additive Noise Tab Works

The **Additive Noise** tab solves dX = f(X,t) dt + sigma dW with `SDEProblem(f, g, X0, (0.0, T))`, where g returns **Noise sigma**. The size of a noise shock is unrelated to the level of X. With f = a X and a < 0 the equation is the model of [Uhlenbeck and Ornstein (1930)](#ref-UO1930a), whose paths stay Gaussian and settle into a stationary law. The menu holds two general Itô solvers, EM and LambaEM, and two made for additive noise, SRA1 and SOSRA2.

## How the Multiplicative Noise Tab Works

The **Multiplicative Noise** tab takes any **Diffusion g(X,t)** and solves the Itô equation, so noise can grow or shrink with the state. With f = a X and g = b X the result is geometric Brownian motion, the price model of [Black and Scholes (1973)](#ref-BS1973a), in which X stays positive and has a log-normal law. The solver must now handle the changing size of g across a step, which is why EM drops to strong order 1/2 here, and why RKMil and SRIW1 add further terms.

## How the Stratonovich Tab Works

`SDEProblem` holds no flag for the calculus, because the solver decides it. The **Stratonovich** tab differs from **Multiplicative Noise** only in its menu, where EulerHeun and LambaEulerHeun read g across the step and so solve the Stratonovich equation. [Wong and Zakai (1965)](#ref-WZ1965a) showed that ordinary integrals driven by smoothed noise converge to this form in the limit. RKMilCommute also sits in that menu, but the panel calls it without `interpretation`, and the package then applies Itô.

## A Common Workflow in the Diffusion Processes Panel

1. Choose the tab from the form of the noise, and type the drift and the diffusion.
2. Run the code, and look at one path through **Plot Trajectory**.
3. Run **Ensemble Paths** to see how far paths spread.
4. With linear f and g, compare with the closed forms through **Mean and Variance**.
5. Lower **Step size dt** or tighten the tolerances until the statistics of interest settle.
6. Use **Ito vs Stratonovich** and **Stationary Distribution** where the question calls for them.

## References

<a id="ref-BS1973a"></a>Black, F. and Scholes, M. (1973). The pricing of options and corporate liabilities. *Journal of Political Economy* 81(3), 637–654. [doi:10.1086/260062](https://doi.org/10.1086/260062)

<a id="ref-Hig2001a"></a>Higham, D. J. (2001). An algorithmic introduction to numerical simulation of stochastic differential equations. *SIAM Review* 43(3), 525–546. [doi:10.1137/S0036144500378302](https://doi.org/10.1137/S0036144500378302)

<a id="ref-Ito1944a"></a>Itô, K. (1944). Stochastic integral. *Proceedings of the Japan Academy, Series A, Mathematical Sciences* 20(8), 519–524. [doi:10.3792/pia/1195572786](https://doi.org/10.3792/pia/1195572786)

<a id="ref-Mar1955a"></a>Maruyama, G. (1955). Continuous Markov processes and stochastic equations. *Rendiconti del Circolo Matematico di Palermo* 4(1), 48–90. [doi:10.1007/BF02846028](https://doi.org/10.1007/BF02846028)

<a id="ref-Mil1975a"></a>Mil'shtejn, G. N. (1975). Approximate integration of stochastic differential equations. *Theory of Probability & Its Applications* 19(3), 557–562. [doi:10.1137/1119062](https://doi.org/10.1137/1119062)

<a id="ref-RN2017a"></a>Rackauckas, C. and Nie, Q. (2017). DifferentialEquations.jl: a performant and feature-rich ecosystem for solving differential equations in Julia. *Journal of Open Research Software* 5(1), 15. [doi:10.5334/jors.151](https://doi.org/10.5334/jors.151)

<a id="ref-Ros2010a"></a>Rößler, A. (2010). Runge–Kutta methods for the strong approximation of solutions of stochastic differential equations. *SIAM Journal on Numerical Analysis* 48(3), 922–952. [doi:10.1137/09076636X](https://doi.org/10.1137/09076636X)

<a id="ref-Str1966a"></a>Stratonovich, R. L. (1966). A new representation for stochastic integrals and equations. *SIAM Journal on Control* 4(2), 362–371. [doi:10.1137/0304028](https://doi.org/10.1137/0304028)

<a id="ref-UO1930a"></a>Uhlenbeck, G. E. and Ornstein, L. S. (1930). On the theory of the Brownian motion. *Physical Review* 36(5), 823–841. [doi:10.1103/PhysRev.36.823](https://doi.org/10.1103/PhysRev.36.823)

<a id="ref-WZ1965a"></a>Wong, E. and Zakai, M. (1965). On the convergence of ordinary integrals to stochastic integrals. *The Annals of Mathematical Statistics* 36(5), 1560–1564. [doi:10.1214/aoms/1177699916](https://doi.org/10.1214/aoms/1177699916)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md) · [Additive](additive.md) · [Multiplicative](multiplicative.md) · [Stratonovich](stratonovich.md)
