# Decision Guide

Choices here concern which form to write, whether complementarity is the right statement at all, and which method to trust for a given model.

## Which Form Fits the Problem

| Situation | Tab |
|---|---|
| Affine map, all variables non-negative | **Linear Complementarity** |
| Nonlinear map, all variables non-negative | **Nonlinear Complementarity** |
| Mix of equations, bounds and capacities | **Mixed Complementarity** |
| KKT system of a convex quadratic programme | **Linear Complementarity** |
| Market or traffic equilibrium | **Nonlinear Complementarity** or **Mixed Complementarity** |

When in doubt, use the mixed form: it includes the others, and PATH handles it directly.

## When to Solve an Optimisation Problem Instead

A complementarity problem is also the KKT system of an optimisation problem if the map is the gradient of a function, which makes its Jacobian symmetric. A convex problem of that kind is better solved as an optimisation, with QP or NLP solvers, since these give stronger guarantees. Complementarity is needed where no objective exists, which is the case with most non-symmetric equilibria, and with multi-agent problems with no shared objective. A bimatrix game, for example, has no single objective, and the route through complementarity is a natural one.

## Whether to Use PATH or a Merit Function

Use PATH as the default. **Merit Function Reformulation** minimises the sum of squared Fischer-Burmeister terms, from [Fischer (1992)](#ref-Fis1992a), with Ipopt. That route needs no special solver, and it is useful as a cross-check or when PATH cannot be used. Its weaknesses are real: the objective can have stationary points that are not solutions, the conditioning is often poor, and the 1e-12 smoothing limits accuracy near a degenerate pair. Times in that action are rough, since the first call in a session also pays for compilation.

## How to Choose Starting Points

Use a start with economic sense, for example with prices and quantities from a base case, in scale with the expected solution. Warm starts help a path of similar problems, as **Parametric Solve** shows. Then run **Solution Multiplicity** at least once on a new model, to look for others, with a range of starts that covers plausible values. Change its range, 3 in the code, to match the problem. Failures from all starts suggest a modelling error, more often than a solver problem.

## When to Scale, Reformulate or Add Bounds

Scale first if values differ by many orders of magnitude. Add a bound on a variable only if it really exists, since a bound changes the solution set, and new solutions may come in with it, as the default **Mixed Complementarity** problem shows. Rewrite a map to avoid a domain problem, for instance by replacing a division by a product. Non-smooth operators can be rewritten with extra variables and pairs, which restores smoothness. Test on a small version before scaling up, because PATH's free licence limits problem size.

## What to Report from a Complementarity Model

Report the map, the bounds, and the pairing of each variable with its condition. Give the residual, the status and the solver version. State how many starts were tried and how many distinct solutions were found, with each one if there are several. Name the active pattern, and identify any degenerate pair, as its regime is unsettled. Give the sensitivity of the main outcomes, with the size of the shifts. A published model is much easier to reuse when stated in the standard form of [Facchinei and Pang (2003)](#ref-FP2003a).

## References

<a id="ref-FP2003a"></a>Facchinei, F. and Pang, J.-S. (2003). *Finite-Dimensional Variational Inequalities and Complementarity Problems*, Vols I and II. Springer.

<a id="ref-Fis1992a"></a>Fischer, A. (1992). A special Newton-type optimization method. *Optimization* 24(3–4), 269–284. [doi:10.1080/02331939208843795](https://doi.org/10.1080/02331939208843795)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Mixed Complementarity (MCP)](mcp.md) · [Diagnostics](diagnostics.md)
