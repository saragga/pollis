# Interpretation

## The Solution
The solution gives the optimal **weights**, the portfolio's **expected return** mu'w and **volatility** sqrt(w'Sigma w). For the QP, the variance is the smallest possible for the required return, and the return constraint usually binds: the expected return equals the target. For the QCQP, the expected return is the largest possible within the volatility cap. For the MIQP, the selection of k assets is part of the answer.

## Dual Prices
The **Dual Prices** are the **shadow prices** of the constraints: the change in the optimal objective per unit change in a constraint's right-hand side. The price of the return constraint is the marginal variance of the last unit of required return, the slope of the frontier in variance; the price of the volatility cap is the marginal expected return per unit of extra squared volatility. A constraint that does not bind has a price of zero. Prices are local: they describe small changes, and change themselves when the set of binding constraints changes.

## Sensitivity Analysis
The **Sensitivity Analysis** gives the duals of the budget and the return (or risk) constraint in the solver's convention, and the **reduced cost** of each weight: zero for assets held strictly inside their bounds, non-zero for assets at zero (or one), where it says how much the objective would worsen per unit of that asset forced in. For the MIQP, these come from the continuous problem with the selection fixed, since a problem with integer variables has no duals.

## Parametric Sweep
The **Parametric Sweep** plots the optimal objective across the grid of targets (or caps): the minimum variance rising with the required return, or the maximum return rising with the cap. Its slope at the chosen level is the dual price. Kinks appear where an asset enters or leaves the portfolio.

## Benchmark Portfolios
The **Benchmark Portfolios** compare the optimum with the **equal-weight** portfolio and the **global minimum-variance** portfolio, which ignores expected returns and may sell short, so its variance can be lower than any long-only one. For the MIQP, the comparison adds the **continuous relaxation**, the problem without integrality: with this formulation it is the problem without the asset limit, so the difference measures the cost of holding at most k assets.

## Variance Attribution
The **Variance Attribution** gives each asset's share of the portfolio variance, w_i (Sigma w)_i / w'Sigma w; the shares sum to one. An asset's share can differ much from its weight: a volatile or highly correlated asset contributes more than its weight, and a negative share means it hedges the rest.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
