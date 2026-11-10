# Check a Convergence Order: Overview

What the order of a solver is, how DiffEqDevTools estimates it, what the strong and the weak order of a solver for stochastic differential equations measure, and how a convergence test differs from the other checks of Compose > Correctness Tests.

## What Is the Order of a Solver?

A solver of a differential equation moves the solution forward in steps of a given size, and its result differs from the exact solution by an error that falls as the step gets smaller. A solver has order p when the error falls like the step raised to the power p: halving the step then divides the error by about 2^p. [Hairer, Nørsett and Wanner (1993)](#ref-HNW1993a) treat the order of methods for ordinary differential equations, from Euler's method, of order 1, to the classical Runge-Kutta method, of order 4. The order of a solver follows from its formulas, so a solver whose errors fall more slowly than its order says has a mistake in it, in its formulas or in their code. Such a mistake can leave results close to the right ones at the step tried, which is why a convergence test looks at how the error falls rather than at its size.

## How Does DiffEqDevTools Estimate an Order?

`test_convergence(dts, prob, alg)` of DiffEqDevTools.jl solves the problem `prob` with the solver `alg` at each step size in `dts`, with fixed steps, and compares each solution with the exact solution, which the problem carries as its `analytic` function. The errors at the end of the interval are in `errors[:final]` of the result, with other measures of the error under other keys. Check a Convergence Order takes the steps of the tab, each half the one before, and estimates the order as the slope of the logarithm of the error against the logarithm of the step, by least squares. A problem with no exact solution can be checked with `analyticless_test_convergence`, which compares with a solution computed at a much smaller step. DiffEqDevTools belongs to the ecosystem of DifferentialEquations.jl that [Rackauckas and Nie (2017)](#ref-RN2017a) describe, whose solvers the tabs check.

## What Do the Strong and the Weak Order Measure?

A solver of a stochastic differential equation follows a path of Brownian motion, so its error can be measured on each path or on averages over paths. [Higham (2001)](#ref-Hig2001a) defines the strong error as the mean over the paths of the distance between the solution of the solver and the exact solution on the same path, E|X_n - X(T)|, and the weak error as the distance between their means, |E X_n - E X(T)|. Euler-Maruyama, the scheme of [Maruyama (1955)](#ref-Mar1955a), has strong order 1/2 and weak order 1. The scheme of [Mil'shtejn (1975)](#ref-Mil1975a) adds a correction term that raises the strong order to 1. The stochastic Runge-Kutta methods of [Rößler (2010)](#ref-Ros2010a), among them SRIW1, reach strong order 3/2, and the documentation of StochasticDiffEq gives SRIW1 weak order 2. [Kloeden and Platen (1992)](#ref-KP1992a) treat both kinds of convergence at length, and give the Milstein scheme weak order 1, the weak order of Euler-Maruyama. Strong order matters when a result follows a particular path, and weak order when it is a mean over many paths.

## What Do the Three Tabs of Check a Convergence Order Check?

| Tab | Problem | Error | Solvers and their orders |
|---|---|---|---|
| **ODE Solver** | Exponential growth, du/dt = a u | At the end of the interval | Euler 1, Midpoint 2, RK4 4 |
| **SDE Strong Order** | Geometric Brownian motion, dX = mu X dt + sigma X dW | Mean over the paths of the error on each path | Euler-Maruyama 1/2, Milstein 1, SRIW1 3/2 |
| **SDE Weak Order** | Geometric Brownian motion | Difference between the means of the solver and of the exact solution, on the same paths | Euler-Maruyama 1, Milstein 1, SRIW1 2 |

Both problems have exact solutions: exp(a t) for exponential growth, and exp((mu - sigma^2 / 2) t + sigma W(t)) on each Brownian path W for geometric Brownian motion. Each tab ends with `@test`, which passes when the estimated order lies within the **Allowed Gap** of the order of the theory.

## How Does a Convergence Test Differ from a Property and a Saved Result?

Check a Property tries a rule on many generated inputs, and Compare with Saved Results compares a result with an earlier result of the same code. A convergence test is a property of a different kind: it is not about one result but about how results change as the step gets smaller, a rule that a solver satisfies whatever its inputs. A saved result can pass while a solver has the wrong order, if the result was saved from the faulty code, and a solver with the right order can change its saved results when its code changes the order of its operations. The Diffusion Processes panel, in Simulate, has a Strong Convergence action for Euler-Maruyama on the same model; Check a Convergence Order compares solvers and schemes written by hand.

## References

<a id="ref-HNW1993a"></a>Hairer, E., Nørsett, S. P. and Wanner, G. (1993). *Solving Ordinary Differential Equations I*, 2nd ed. Springer. [doi:10.1007/978-3-540-78862-1](https://doi.org/10.1007/978-3-540-78862-1)

<a id="ref-Hig2001a"></a>Higham, D. J. (2001). An algorithmic introduction to numerical simulation of stochastic differential equations. *SIAM Review* 43(3), 525–546. [doi:10.1137/S0036144500378302](https://doi.org/10.1137/S0036144500378302)

<a id="ref-KP1992a"></a>Kloeden, P. E. and Platen, E. (1992). *Numerical Solution of Stochastic Differential Equations*. Springer. [doi:10.1007/978-3-662-12616-5](https://doi.org/10.1007/978-3-662-12616-5)

<a id="ref-Mar1955a"></a>Maruyama, G. (1955). Continuous Markov processes and stochastic equations. *Rendiconti del Circolo Matematico di Palermo* 4(1), 48–90. [doi:10.1007/BF02846028](https://doi.org/10.1007/BF02846028)

<a id="ref-Mil1975a"></a>Mil'shtejn, G. N. (1975). Approximate integration of stochastic differential equations. *Theory of Probability & Its Applications* 19(3), 557–562. [doi:10.1137/1119062](https://doi.org/10.1137/1119062)

<a id="ref-RN2017a"></a>Rackauckas, C. and Nie, Q. (2017). DifferentialEquations.jl: a performant and feature-rich ecosystem for solving differential equations in Julia. *Journal of Open Research Software* 5(1), 15. [doi:10.5334/jors.151](https://doi.org/10.5334/jors.151)

<a id="ref-Ros2010a"></a>Rößler, A. (2010). Runge–Kutta methods for the strong approximation of solutions of stochastic differential equations. *SIAM Journal on Numerical Analysis* 48(3), 922–952. [doi:10.1137/09076636X](https://doi.org/10.1137/09076636X)

## See Also

- [Factsheet](factsheet.md) · [Convergence Tests in a Package](convergence-in-a-package.md)
