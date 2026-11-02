# Reading Loss Risk Measures

Each measure answers a narrow question, and misreading the question is the commonest error. Here is what each number says and what it leaves out.

## What VaR says and does not say

A 95% one-day VaR of 2% means that about 5% of days are expected to lose more than 2%. It is the boundary of the tail, reported as a positive loss, and it says nothing about what happens past that boundary. It is not the worst case, and losing 2% is not a typical bad day.

Two portfolios can share a VaR while one loses 2.1% in the tail and the other 20%. A time scale goes with the number, too: one day and 10 days are very different figures. Also the 5% of days are expected, not exceptional, so about 12 or 13 of them occur per year of 252 trading days. A VaR exceeded on 13 days a year is doing exactly what it should.

## ES and the tail beyond VaR

ES is the mean loss given that the VaR level has been passed, so for the same alpha it is never below VaR. It responds to how far the tail runs, and that makes it the more informative of the two.

**VaR vs Expected Shortfall** prints the ratio. Normal returns give about 1.25 at 5%, so a much higher value says the tail is heavier than the normal. Keep the sample size in mind: at alpha 0.05 with 1,000 returns, ES averages about 50 points, but at 0.01 only about 10. An ES figure can be driven by one extreme day, so look at that day before quoting the number.

## Why coherence matters

A coherent risk measure satisfies four properties, including subadditivity: the risk of a combined position should not exceed the sum of the separate risks ([Philippe Artzner, Freddy Delbaen, Jean-Marc Eber and David Heath (1999)](#ref-ADEH1999a)). VaR can fail this.

Take two independent bonds, each losing 100 with probability 4%. Alone, each has a 95% VaR of 0, as 4% is below 5%. Together, at least one defaults with probability 1 − 0.96² ≈ 7.84%, so the VaR of the pair is 100, more than 0 + 0. Under ES at the same level, each bond has 0.04 × 100 / 0.05 = 80, and the pair (0.0016 × 200 + 0.0484 × 100) / 0.05 = 103.2, below 160. ES is coherent, as [Carlo Acerbi and Dirk Tasche (2002)](#ref-AT2002a) show, including for discrete losses.

## Reading Sortino, Calmar and Omega

**Risk-Adjusted Performance** prints four ratios. Sharpe divides excess return by total volatility, while Sortino uses only downside deviation ([Frank A. Sortino and Lee N. Price (1994)](#ref-SP1994a)). For the default, Sharpe is about 0.0004 / 0.01 × √252 ≈ 0.63 and Sortino about 0.93, as roughly symmetric returns give a Sortino near √2 times the Sharpe.

Omega is a sum of gains over a sum of losses, equal to 1 when the mean return equals **MAR**, and about 1.1 for the default. Calmar relates annualised return to maximum drawdown over the whole sample, so it falls as the history grows. Sterling here adds 10% to the average drawdown, a convention that dampens it. Compare ratios only across series of similar length and frequency.

## Contributions to portfolio ES

**CVaR Decomposition** splits portfolio ES across assets. Each contribution is the asset's weight times its negative mean return in the portfolio's own tail periods, and these add exactly to the total, since the portfolio return in any period is the weighted sum of asset returns.

A large share means the asset tends to lose when the portfolio does. A negative share means it tends to gain then, acting as a hedge. A contribution far above an asset's weight points to a concentration that the capital split hides. The default `R` and `wts` are synthetic stand-ins, so replace both, and remember that a few tail days drive the split: with 1,000 periods at 5%, about 50 days decide it.

## References

<a id="ref-ADEH1999a"></a>Artzner, P., Delbaen, F., Eber, J.-M., & Heath, D. (1999). Coherent Measures of Risk. *Mathematical Finance* 9(3), 203-228. [doi:10.1111/1467-9965.00068](https://doi.org/10.1111/1467-9965.00068)

<a id="ref-AT2002a"></a>Acerbi, C., & Tasche, D. (2002). Expected Shortfall: A Natural Coherent Alternative to Value at Risk. *Economic Notes* 31(2), 379-388. [doi:10.1111/1468-0300.00091](https://doi.org/10.1111/1468-0300.00091)

<a id="ref-SP1994a"></a>Sortino, F. A., & Price, L. N. (1994). Performance Measurement in a Downside Risk Framework. *Journal of Investing* 3(3), 59-64. [doi:10.3905/joi.3.3.59](https://doi.org/10.3905/joi.3.3.59)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
