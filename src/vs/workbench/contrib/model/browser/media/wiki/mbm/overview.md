# Model-Based Methods

Some objectives can be computed but not differentiated: a simulation, a legacy code, a fit that runs a whole procedure inside it. Model-based methods minimise such functions by building a small local approximation from the values already computed, then trusting it only as far as it has earned.

## Why build a model without derivatives?

Each evaluation of a costly objective carries information, and a method that discards it pays again for the same knowledge. An interpolation model keeps it: a simple function, linear or quadratic, is fitted through points already evaluated, and it supplies the slope and curvature that derivatives would otherwise give.

Finite differences are the obvious alternative, but they spend n or more evaluations on a single gradient and those points serve no other purpose. An interpolation set is updated one point at a time, so most iterations cost one evaluation. The book-length treatment is by [Conn, Scheinberg and Vicente (2009)](#ref-CSV2009a), and a more recent survey of the field is by [Larson, Menickelly and Wild (2019)](#ref-LMW2019a).

## One iteration of a trust-region method

Five of the seven methods share the same loop around a current best point x with a radius.

1. Minimise the model m within the trust region, the set of points no further than the radius from x, to get a trial step d.
2. Evaluate f at x + d.
3. Compute the ratio of actual to predicted reduction: (f(x) − f(x + d)) / (m(x) − m(x + d)).
4. Move to x + d if f fell. Enlarge the radius if the ratio is high and shrink it if the ratio is low.
5. Replace one interpolation point with the new one, so that the set keeps its shape.

**Initial Radius** sets the first radius, and the run ends when the radius has shrunk to `rhoend`. The framework itself does not depend on how the model was built, as [Conn, Gould and Toint (2000)](#ref-CGT2000a) show at length.

## What separates the five trust-region methods

The methods differ in the kind of constraint they handle and in how much of a quadratic they fit.

| Method | Model | Constraints | Typical use |
|---|---|---|---|
| **COBYLA** | Linear | Nonlinear inequalities | Constraints that are themselves black boxes |
| **BOBYQA** | Partial quadratic | Box | Bounded parameters, the common case |
| **NEWUOA** | Partial quadratic | None | Larger unconstrained problems |
| **UOBYQA** | Full quadratic | None | Small unconstrained problems |
| **LINCOA** | Partial quadratic | Linear inequalities | Budgets, weights and similar limits |

All five come from M. J. D. Powell, and the panel runs them through the implementations of [Zhang (2023)](#ref-Zha2023a).

## Two methods that build no interpolation model

**PRAXIS** and **Sbplx** come through [Johnson (2007)](#ref-Joh2007b) and give the panel a contrast to the trust-region family.

**PRAXIS** is the principal-axis method of [Brent (1973)](#ref-Bre1973a). It runs line searches along a set of directions and improves those directions from what the searches reveal about curvature. **Sbplx** reimplements the Subplex method of [Rowan (1990)](#ref-Row1990a), which runs Nelder-Mead on small groups of variables in turn. It uses only comparisons of values, so it depends less on smoothness than any method that fits a model.

## Do models actually beat direct search?

On smooth problems, generally yes. [Moré and Wild (2009)](#ref-MW2009a) compared solvers under limits on the budget and found that the model-based solver tested performed better than the two direct search solvers tested, on smooth, noisy and piecewise-smooth problem sets alike.

A wider test by [Rios and Sahinidis (2013)](#ref-RS2013a) covers 22 implementations on 502 bound-constrained problems. Evidence of that kind rests on test sets and budgets, so it guides a first choice and does not settle one. **Method Comparison** runs the same kind of contest on the objective in hand, and the **Direct Search Methods** panel holds the methods on the other side.

## The default problem and why it is hard

**Objective f(x)** defaults to the extended Rosenbrock function: a sum over i of 100 (x[i+1] − x[i]²)² + (1 − x[i])². A long curved valley makes progress slow for any method that assumes a roughly round bowl, and the global minimum is 0 at `ones(n)`.

The defaults add a twist on two methods. On **COBYLA** the ball sum(x²) ≤ 2 and on **LINCOA** the limit sum(x) ≤ 2 both exclude `ones(n)` once n is 3 or more, so the answer lies on the constraint and has a nonzero gradient. Rosenbrock is also not unimodal in general: [Kok and Sandrock (2009)](#ref-KS2009a) found no more than two local minimisers up to dimension 100, along with many saddle points, which gives **Multi-Start** something real to detect.

## What the panel leaves out

Everything here is local. A method settles near one minimiser and has no plan for finding others, so global work belongs under **Global Optimisation**, or under **Bayesian Optimisation** and **Surrogate-Based Optimisation** when each evaluation is very costly.

When derivatives can be had, by automatic differentiation or otherwise, a gradient-based method such as those in **Quasi-Newton Methods** will almost always cost fewer evaluations. Equality constraints have no input in the panel, since **Constraints c(x) <= 0** and **Constraint Matrix (A)** both state inequalities. The [Decision Guide](decision-guide.md) wiki sets out the choice among the seven, and the [Factsheet](factsheet.md) lists every action.

## References

<a id="ref-Bre1973a"></a>Brent, R. P. (1973). *Algorithms for Minimization without Derivatives*. Prentice-Hall.

<a id="ref-CGT2000a"></a>Conn, A. R., Gould, N. I. M., & Toint, P. L. (2000). *Trust Region Methods*. SIAM. [doi:10.1137/1.9780898719857](https://doi.org/10.1137/1.9780898719857)

<a id="ref-CSV2009a"></a>Conn, A. R., Scheinberg, K., & Vicente, L. N. (2009). *Introduction to Derivative-Free Optimization*. SIAM. [doi:10.1137/1.9780898718768](https://doi.org/10.1137/1.9780898718768)

<a id="ref-Joh2007b"></a>Johnson, S. G. (2007). The NLopt Nonlinear-Optimisation Package.

<a id="ref-KS2009a"></a>Kok, S., & Sandrock, C. (2009). Locating and Characterizing the Stationary Points of the Extended Rosenbrock Function. *Evolutionary Computation* 17(3), 437-453. [doi:10.1162/evco.2009.17.3.437](https://doi.org/10.1162/evco.2009.17.3.437)

<a id="ref-LMW2019a"></a>Larson, J., Menickelly, M., & Wild, S. M. (2019). Derivative-Free Optimization Methods. *Acta Numerica* 28, 287-404. [doi:10.1017/S0962492919000060](https://doi.org/10.1017/S0962492919000060)

<a id="ref-MW2009a"></a>Moré, J. J., & Wild, S. M. (2009). Benchmarking Derivative-Free Optimization Algorithms. *SIAM Journal on Optimization* 20(1), 172-191. [doi:10.1137/080724083](https://doi.org/10.1137/080724083)

<a id="ref-RS2013a"></a>Rios, L. M., & Sahinidis, N. V. (2013). Derivative-Free Optimization: A Review of Algorithms and Comparison of Software Implementations. *Journal of Global Optimization* 56(3), 1247-1293. [doi:10.1007/s10898-012-9951-y](https://doi.org/10.1007/s10898-012-9951-y)

<a id="ref-Row1990a"></a>Rowan, T. H. (1990). Functional Stability Analysis of Numerical Algorithms. PhD Thesis, University of Texas at Austin.

<a id="ref-Zha2023a"></a>Zhang, Z. (2023). PRIMA: Reference Implementations for Powell's Methods with Modernization and Amelioration.

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [COBYLA](cobyla.md) · [BOBYQA](bobyqa.md) · [NEWUOA](newuoa.md) · [UOBYQA](uobyqa.md) · [LINCOA](lincoa.md) · [PRAXIS](praxis.md) · [Sbplx](sbplx.md)
