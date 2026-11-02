# ISRES

Improved stochastic ranking evolution strategy is built for problems with constraints. Its ranking rule balances objective values against constraint violations, with no penalty weight to tune.

## How Stochastic Ranking Works

[Runarsson and Yao (2000)](#ref-RY2000a) replaced penalty terms with a randomised bubble sort. Adjacent candidates are compared as follows:

| Situation | Compared by |
|---|---|
| Both feasible | Objective |
| Otherwise, with chance P | Objective |
| Otherwise, with chance 1 − P | Constraint violation |

A P below 0.5 favours feasibility, while still letting some good infeasible points survive. Their value of 0.45 serves widely. Low-value points just outside the feasible region can then help a search reach a feasible optimum on the boundary, which a strict rule might miss.

## What the Improved Version Adds

[Runarsson and Yao (2005)](#ref-RY2005a) added a differential variation step to the mutation of their earlier strategy. Mutation alone explores around each parent with step sizes that self-adapt. The extra step moves the best parents along differences between them, so that the search can exploit a direction of progress, in a manner close to differential evolution. Selection then keeps a small share of offspring: their setup uses 30 parents and 200 offspring. The method uses coordinate-wise step sizes, without a full covariance, so its cost per sample is low.

## How the Panel Uses It

The tab calls `NLopt.optimize` with `:GN_ISRES`, the box as bounds and **Budget** as `maxeval`. The objective is the only function passed, so that no nonlinear constraint is active by default. The method's main advantage therefore is unused. To add one, register it in the code with `inequality_constraint!(opt, g, tol)`, where g(x) ≤ 0 is feasible. **Bounds Check** then only checks the box, so also test each constraint at the solution.

## What the Start at the Box Centre Means

The code starts from the centre of the box, whereas **CMA-ES** starts from a random point. For the default Rastrigin function, the centre is the global minimum itself. If the start enters the first population, then the run has the answer from its first evaluation. **Convergence Check** reveals this through `best_first_reached_at`. Use an objective with a shifted optimum before judging the method, or before reading its place in **Compare Strategies**.

## Where ISRES Is Strong and Weak

The method is strong on nonlinear constraints, which most of the panel's other tabs cannot handle, and it is simple and cheap per sample. It is weak on ill-conditioned or tilted problems without constraints, since coordinate-wise step sizes cannot follow a rotated valley. Convergence to high precision is slow, and a local polish with a constrained solver is useful afterwards. Equality constraints are hard for any such method, and they need a tolerance.

## References

<a id="ref-RY2000a"></a>Runarsson, T. P. and Yao, X. (2000). Stochastic ranking for constrained evolutionary optimization. *IEEE Transactions on Evolutionary Computation* 4(3), 284–294. [doi:10.1109/4235.873238](https://doi.org/10.1109/4235.873238)

<a id="ref-RY2005a"></a>Runarsson, T. P. and Yao, X. (2005). Search biases in constrained evolutionary optimization. *IEEE Transactions on Systems, Man, and Cybernetics* 35(2), 233–243. [doi:10.1109/TSMCC.2004.841906](https://doi.org/10.1109/TSMCC.2004.841906)

## See Also

- [Factsheet](factsheet.md) · [ESCH](esch.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
