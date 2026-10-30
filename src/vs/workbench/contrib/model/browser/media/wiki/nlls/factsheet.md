# Nonlinear Least Squares — Factsheet

**Nonlinear least squares** estimates the parameters p of a model y = f(t, p) + error that is nonlinear in p, by minimising the sum of squared residuals S(p) = sum (y_i - f(t_i, p))^2. Its solvers exploit that structure: the Jacobian J of the residuals gives an approximation J'J of the Hessian without second derivatives.

| | |
|---|---|
| **Purpose** | Fit a nonlinear model to data: growth and decay curves, dose-response, kinetics, yield curves |
| **Input** | A Julia expression for the model f(t, p), the initial parameters p0, the inputs t and the observations y |
| **Core packages** | [LeastSquaresOptim.jl](https://github.com/matthieugomez/LeastSquaresOptim.jl), [NonlinearSolve.jl](https://github.com/SciML/NonlinearSolve.jl), [ForwardDiff.jl](https://github.com/JuliaDiff/ForwardDiff.jl), [Distributions.jl](https://github.com/JuliaStats/Distributions.jl) |
| **Models** | Levenberg-Marquardt, Dogleg, Gauss-Newton |
| **Output** | The fitted parameters, the sum of squares, standard errors and confidence intervals, residuals and predictions |
| **Key choice** | The solver, and above all a sensible starting point |

## When to Use

- **The model is nonlinear in its parameters**: an exponential decay p1 exp(-p2 t), a logistic curve, a Michaelis-Menten rate.
- **The errors are additive** and roughly of constant variance, so equal weights are sensible.
- **You need standard errors and intervals**, from the linearised covariance s^2 (J'J)^-1.

## What It Is Not

Not linear regression: if the model is linear in p (polynomials, splines, linear combinations of fixed functions), ordinary least squares solves it exactly in one step. Not robust to outliers, which the squared loss amplifies; and not a global method: from a poor start the solvers may stop in a local minimum.

## See Also
- [Overview](overview.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
