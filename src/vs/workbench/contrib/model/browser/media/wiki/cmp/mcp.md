# Mixed Complementarity (MCP)

The mixed form adds lower and upper bounds, one pair per component. Equations, sign conditions and capacities all fit it, so it serves as the common input for solvers.

## What the Problem Asks

Given bounds lb ≤ ub, x lies in the box, and for each i one of three cases holds:

| Position of x_i | Condition on F_i(x) |
|---|---|
| At lb_i | F_i ≥ 0 |
| At ub_i | F_i ≤ 0 |
| Strictly between | F_i = 0 |

In the code, `complements(F(x), x)` states the pairs, and `set_lower_bound` and `set_upper_bound` give the box. **Lower Bounds lb** and **Upper Bounds ub** set the values.

## How Other Problems Fit the Form

| Bounds | Result |
|---|---|
| lb = 0, ub = Inf | Nonlinear complementarity |
| lb = −Inf, ub = Inf | F_i = 0, an equation in a free variable |
| lb = ub | Fixed variable, with F_i free |
| lb, ub finite | Box-constrained variational inequality |

Components can differ, so that one model mixes equations, prices with x ≥ 0 and capacities. [Rutherford (1995)](#ref-Rut1995a) showed how to write such economic equilibrium models, and the form became standard in GAMS.

## What the Default Bound Does

The default uses the Kojima-Shindo map, with x1 ≤ 1. An upper bound changes the solution set, and does not just trim it:

- The solution with x1 = sqrt(6)/2 goes, as it breaks the bound.
- (1, 0, 0, 2/3) appears, with x1 at its bound and F1 = −1.
- (1, 0, 3, 0) stays, with x1 at its bound and F1 = 0.

The new point exists because the sign condition at the upper bound differs. Each can be checked by hand. Run **Solution Multiplicity** to see which ones PATH reaches.

## Why the Mixed Form Suits Economic Models

Consider a market in which a price is fixed by a ceiling. Inside the ceiling, the price clears the market, with excess demand zero. At the ceiling, excess demand can stay positive, which is rationing. The pair captures both regimes with no extra logic. Taxes, quotas and limits fit in the same manner. [Ferris and Pang (1997)](#ref-FP1997a) give many such examples, including traffic and general equilibrium models. A multiplier then has a clear economic reading, usually a price.

## How PATH Uses the Form

PATH, by [Dirkse and Ferris (1995)](#ref-DF1995a), builds a linear model of the problem at the current point, and solves it with a pivotal method, tracing a path toward the model's solution. It then follows that path as far as a merit function allows, with a nonmonotone rule that lets the merit rise for a time. The bounds are handled by the pivoting itself, so no slack variables are needed. Free variables need no special treatment by the user. Its free version has size limits, so large models need a licence.

## What to Watch When Writing Bounds

A variable fixed by lb = ub needs its F_i free, and an equation needs lb = −Inf and ub = Inf. Pairing the wrong F with an x is a common modelling error, and the result can still solve with the wrong meaning. A count of equations and of variables helps: each variable pairs with exactly one F_i. A start outside the box gets clipped, as with `mid` in **Solution Multiplicity**. Very large finite bounds are risky, as a bound that was meant to be inactive can distort scaling.

## References

<a id="ref-DF1995a"></a>Dirkse, S. P. and Ferris, M. C. (1995). The PATH solver: a nonmonotone stabilization scheme for mixed complementarity problems. *Optimization Methods and Software* 5(2), 123–156. [doi:10.1080/10556789508805606](https://doi.org/10.1080/10556789508805606)

<a id="ref-FP1997a"></a>Ferris, M. C. and Pang, J.-S. (1997). Engineering and economic applications of complementarity problems. *SIAM Review* 39(4), 669–713. [doi:10.1137/S0036144595285963](https://doi.org/10.1137/S0036144595285963)

<a id="ref-Rut1995a"></a>Rutherford, T. F. (1995). Extension of GAMS for complementarity problems arising in applied economic analysis. *Journal of Economic Dynamics and Control* 19(8), 1299–1324. [doi:10.1016/0165-1889(94)00831-2](https://doi.org/10.1016/0165-1889(94)00831-2)

## See Also

- [Factsheet](factsheet.md) · [Linear Complementarity (LCP)](lcp.md) · [Nonlinear Complementarity (NCP)](ncp.md) · [Decision Guide](decision-guide.md)
