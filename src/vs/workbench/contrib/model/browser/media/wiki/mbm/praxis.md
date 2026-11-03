# PRAXIS

The PRincipal AXIS method of [Brent (1973)](#ref-Bre1973a) searches along lines, not within a trust region, and learns the shape of the function from the results. It is the older tradition of derivative-free minimisation, and a useful contrast with the interpolation methods in the panel.

## What problem does PRAXIS solve?

**PRAXIS** minimises a smooth f(x) with no limits on x. The panel runs `NLopt.Opt(:LN_PRAXIS, n)` from the package of [Johnson (2007)](#ref-Joh2007a), with `maxeval` from **Max Evaluations**, `xtol_rel = 1e-10` and `initial_step = fill(rhobeg, n)`.

The code sets no bounds on it, so the box applies only to **Multi-Start** and the charts. As for **NEWUOA** and **UOBYQA**, the printed `violation` is 0.0 by definition, and **Bounds Feasibility** shows whether the answer lies in the box. **Initial Radius** here means a first step size, with no trust region attached.

## Where the idea of conjugate directions comes from

Minimising along each coordinate in turn is slow on a tilted valley, since each search undoes part of the last. [Powell (1964)](#ref-Pow1964a) showed how to choose directions that do not interfere: on a quadratic, successive line searches along conjugate directions reach the minimum in a finite number of steps.

Powell's scheme replaces one direction in each cycle with the overall displacement of that cycle. Over time, though, the set of directions can become nearly dependent, so that the search collapses into a subspace and misses part of the problem. Brent's method is designed around that weakness.

## What Brent adds with principal axes

Brent's algorithm periodically replaces the working directions with the principal axes of a quadratic form built from the search so far, using a singular value decomposition. Those axes are mutually orthogonal, so the set cannot collapse, and the singular values estimate the curvature along each one.

Line searches use a parabola through three values, and the curvature estimates supply a sensible step for each. If the problem looks ill-conditioned, the method adds random steps in order to escape the narrow resolution of a valley. That makes the sequence of evaluations depend on random numbers, so repeated runs may differ slightly in `evaluations` and in the last digits of `minimum`.

## How it differs from the trust-region methods

| Feature | **PRAXIS** | Powell's quadratic methods |
|---|---|---|
| Unit of work | A line search of several evaluations | Usually one evaluation |
| Stored information | Directions and their curvatures | Interpolation points and a model |
| Linear algebra | A periodic singular value decomposition | An update of order n² or more |
| Stops on | `xtol_rel` or `maxeval` | `rhoend` or `maxfun` |
| Constraints | None | Bounds or more on some |

Each line search usually spends evaluations on points that serve only that line, so the budget can be used less efficiently on an expensive f. On a cheap smooth function, the method is simple and often competitive, and **Method Comparison** shows both counts side by side. A textbook account of conjugate directions and line searches is in [Nocedal and Wright (2006)](#ref-NW2006a).

## When to use PRAXIS

The panel's decision table gives the case: an unconstrained smooth problem when an interpolation model is not wanted. In practice, the method is a useful second opinion. If **PRAXIS** and **NEWUOA** agree on the minimiser, the answer does not depend on one particular model construction.

Avoid it where f has kinks or noise, since parabolic line searches rely on smooth values along each line. Avoid it too where limits matter. A penalty could be written into **Objective f(x)**, but a kink at the boundary then works against the method, and **BOBYQA** is a direct way of keeping to a box.

## Reading a PRAXIS run

`status` comes from `NLopt` and normally reads `XTOL_REACHED` or `SUCCESS`, or `MAXEVAL_REACHED` when the budget ran out. A very tight `xtol_rel` may produce `ROUNDOFF_LIMITED`, which is usually harmless.

**Query Scatter** shows the character of the method better than any other chart: chains of points along lines whose directions turn as the run goes on. Those lines are not aligned with the axes for long. **Warm Start** divides the first step by 10, and `moved` shows how much the restarted search still finds to do.

## References

<a id="ref-Bre1973a"></a>Brent, R. P. (1973). *Algorithms for Minimization without Derivatives*. Prentice-Hall.

<a id="ref-Joh2007a"></a>Johnson, S. G. (2007). The NLopt Nonlinear-Optimization Package. [github.com/stevengj/nlopt](https://github.com/stevengj/nlopt)

<a id="ref-NW2006a"></a>Nocedal, J., & Wright, S. J. (2006). *Numerical Optimization* (2nd ed.). Springer. [doi:10.1007/978-0-387-40065-5](https://doi.org/10.1007/978-0-387-40065-5)

<a id="ref-Pow1964a"></a>Powell, M. J. D. (1964). An Efficient Method for Finding the Minimum of a Function of Several Variables without Calculating Derivatives. *The Computer Journal* 7(2), 155-162. [doi:10.1093/comjnl/7.2.155](https://doi.org/10.1093/comjnl/7.2.155)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [COBYLA](cobyla.md) · [BOBYQA](bobyqa.md) · [NEWUOA](newuoa.md) · [UOBYQA](uobyqa.md) · [LINCOA](lincoa.md) · [Sbplx](sbplx.md)
