# KKT Conditions

The **Karush-Kuhn-Tucker** (KKT) conditions characterise local optima of a constrained problem. For min f(x) subject to g_i(x) <= 0 and h_j(x) = 0, a local minimum x* that satisfies a constraint qualification has multipliers lambda_i and mu_j with:
1. **Stationarity**: grad f(x*) + sum lambda_i grad g_i(x*) + sum mu_j grad h_j(x*) = 0;
2. **Primal feasibility**: g_i(x*) <= 0 and h_j(x*) = 0;
3. **Dual feasibility**: lambda_i >= 0;
4. **Complementary slackness**: lambda_i g_i(x*) = 0 for every i.

## Reading Them
Complementary slackness says each inequality is either **binding**, g_i = 0, with a multiplier that may be positive, or **slack**, g_i < 0, with a multiplier of zero. Stationarity says that at the optimum the objective's gradient is a combination of the gradients of the binding constraints: no feasible direction improves f to first order.

## Multipliers as Sensitivities
The multiplier of a constraint is the rate at which the optimal value changes when the constraint is relaxed: the **shadow price** reported by **Constraint Sensitivity**, up to JuMP's sign convention. The **Parametric Sweep** shows it as the slope of the optimal value against a bound.

## Necessary, Not Sufficient
The KKT conditions are **necessary** for a local optimum under a constraint qualification, such as linearly independent gradients of the active constraints (LICQ). They are **sufficient** for a global optimum when the problem is convex. In nonconvex problems a KKT point may be a local minimum, a saddle point or even a maximum; second-order conditions on the Hessian of the Lagrangian distinguish them.

## In the Panel
Interior-point solvers return the multipliers, and the **KKT Conditions** action lists each constraint's value, multiplier and the product multiplier times slack, which should be near 0. The JuMP duals follow the conic convention of MathOptInterface, which may differ in sign from the textbook lambda. MINLP and global solvers usually return no duals, and the action reports it.

## See Also
- [NLP](nlp.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
