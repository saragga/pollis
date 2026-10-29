# Portfolio Optimisation

**Mean-variance optimisation** (Markowitz, 1952) chooses the weights w of n assets to balance the portfolio's **expected return** mu'w against its **variance** w'Sigma w. It is the founding application of quadratic programming in finance.

## The Efficient Frontier
A portfolio is **efficient** if no other has a higher expected return for the same variance, or a lower variance for the same return. Minimising the variance for each target return (the QP), or maximising the return for each volatility cap (the QCQP), traces the **efficient frontier** in the volatility-return plane. Its leftmost point is the **minimum-variance portfolio**; portfolios below it are dominated. Diversification is why the frontier lies to the left of the individual assets: imperfectly correlated risks partly cancel.

## Constraints
- **Budget**: the weights sum to one (fully invested).
- **Long-only**: 0 <= w <= 1, no short sales. With only the budget and a return target held as an equality, the problem has a closed-form solution; with the long-only bounds it needs a QP solver, and many weights are exactly zero.
- **Position limits**: an upper bound on each weight, to force diversification.
- **Cardinality** and **minimum holdings**: at most k assets, no tiny positions (the MIQP).
- **Turnover** and **transaction costs**: limits on the change from the current portfolio, linear or quadratic in the trades.

## Estimation Error
The optimiser treats mu and Sigma as known, but both are estimated, and it is drawn to the assets whose errors make them look best: mean-variance optimisation has been called an **error maximiser**. Expected returns are the hardest to estimate, and the optimal weights are very sensitive to them; covariances are estimated better, but with many assets the sample covariance is noisy and nearly singular. Remedies:
- **Shrinkage** of the covariance matrix towards a structured target (Ledoit and Wolf), or a factor model.
- **Shrinkage of expected returns**, or ignoring them: the minimum-variance portfolio depends only on Sigma.
- **Constraints as regularisation**: long-only and position limits act like shrinkage of the covariance matrix (Jagannathan and Ma, 2003).
- **Resampling** and **robust optimisation**, which optimise against a set of plausible inputs.
- **Benchmarks**: the equal-weight portfolio is hard to beat out of sample with estimated inputs (DeMiguel, Garlappi and Uppal, 2009), and the **Benchmark Portfolios** action compares the solution with it.

## Risk Contributions
The **Variance Attribution** splits the portfolio variance into each asset's contribution. **Risk parity** portfolios choose the weights so that the contributions are equal, a different, non-quadratic problem.

## Beyond Variance
Variance penalises gains and losses alike and suits roughly symmetric returns. Downside measures such as **conditional value at risk** lead to linear programmes over scenarios; utility-based formulations to general convex problems.

## See Also
- [QP](qp.md) · [QCQP](qcqp.md) · [MIQP](miqp.md)
