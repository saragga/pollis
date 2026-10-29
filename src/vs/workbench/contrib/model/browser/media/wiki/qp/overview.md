# Quadratic Programming — Overview

This webview solves **quadratic programmes**: optimisation problems with a quadratic objective or quadratic constraints, and possibly discrete choices. The running example is the long-only portfolio of n assets with expected returns mu and covariance matrix Sigma: the weights w are non-negative, sum to one, and trade off the expected return mu'w against the variance w'Sigma w. The models are written in JuMP.jl, which passes them to a solver: Clarabel (interior point) by default, OSQP or Ipopt for comparison, SCIP for the mixed-integer problem.

## Quadratic Programming (QP)
Minimise the portfolio **variance** w'Sigma w subject to a required expected return mu'w >= target, the budget sum(w) = 1, and 0 <= w <= 1. The objective is quadratic and the constraints linear: the classic Markowitz problem.

## Quadratic Constraints QP (QCQP)
Turn the problem round: maximise the **expected return** subject to a volatility cap, w'Sigma w <= cap^2. The objective is now linear and one constraint quadratic. Clarabel handles it as a second-order cone; Ipopt as a general nonlinear constraint.

## Mixed-Integer QP (MIQP)
Minimise the variance for the target return while holding **at most k assets**. A binary variable z_i for each asset says whether it is held, the constraint w_i <= z_i ties the weight to it, and sum(z) <= k limits the count. SCIP solves it by branch and bound.

## Common Workflow

1. Enter the **Expected Returns**, the **Covariance Matrix**, and the **Target Return** (or the **Volatility Cap**, or **Max Assets k**); choose the solver, and solve.
2. Plot the **Efficient Frontier** and the **Portfolio Weights**.
3. Diagnose with the **Feasibility Check** and the **Convexity Check**.
4. Run the **Sensitivity Analysis** and the **Parametric Sweep**.
5. Compare with the **Solver Comparison** and the **Benchmark Portfolios**.
6. Read the **Dual Prices** and the **Variance Attribution**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [Assumptions](assumptions.md)
