# Volatility Measurement — Yang-Zhang

The Yang-Zhang estimator also counts what happens while the market is closed. [Yang and Zhang (2000)](#ref-YZ2000a) combined three variances into a daily measure that is unaffected by drift and allows for opening jumps.

## How the Yang-Zhang Estimator Is Computed

`yang_zhang_volatility` first aligns the data, pairing each day with the previous close, so the sample has one day fewer than the input. It then computes three pieces: the sample variance of overnight returns log(O_t / C_{t−1}), the sample variance of open-to-close returns log(C_t / O_t), and the mean of the Rogers-Satchell term. The result is the square root of overnight variance + k × open-to-close variance + (1 − k) × Rogers-Satchell variance.

## What the k Weight Does

**k weight** divides the intraday part between the open-to-close variance and the Rogers-Satchell term. The default, `nothing`, uses k = 0.34 / (1.34 + (n + 1) / (n − 1)), the value that Yang and Zhang derive as minimising the estimator's variance, about 0.14 for long samples. Giving a number replaces it, and k = 1 returns the plain sum of overnight and open-to-close variances. With so little default weight on open-to-close returns, the Rogers-Satchell term dominates the intraday part unless **k weight** is changed.

## Why the Yang-Zhang Estimator Handles Overnight Gaps

A market closed overnight still reprices, and the next open reflects that news. The same-day estimators ignore the jump between close and open and so measure only trading hours. Here, the overnight term adds that variance directly, which makes the result an estimate of volatility from close to close. For assets with major overnight moves, such as individual stocks around earnings announcements, the difference can be large, while for a market trading almost around the clock the term is small.

## What the Yang-Zhang Estimator Assumes

The estimator assumes that volatility is constant across the sample, since two of its pieces are sample variances over all the days. A window with a change of regime therefore mixes the levels, and **Rolling Volatility** offers a way to see this. It also treats overnight and intraday moves as independent, as they are under a Brownian motion. Subtracting sample means removes any constant drift, and within-day jumps remain outside the model, so a large news move during trading still inflates the estimate.

## When to Prefer Yang-Zhang

**Yang-Zhang** is the usual choice when full bars and meaningful overnight gaps are present and a measure of total daily risk is wanted. To measure only the variance during trading hours, for example for an intraday strategy, **Garman-Klass** or **Rogers-Satchell** match the purpose better. As the estimator is a single figure over the sample, a short window gives a noisy overnight variance, since that piece uses only one return per day and benefits nothing from the range.

## References

<a id="ref-YZ2000a"></a>Yang, D. and Zhang, Q. (2000). Drift-independent volatility estimation based on high, low, open, and close prices. *Journal of Business* 73(3), 477–492. [doi:10.1086/209650](https://doi.org/10.1086/209650)

## See Also

- [Overview](overview.md) · [Rogers-Satchell](rogers-satchell.md) · [Garman-Klass](garman-klass.md) · [Parkinson](parkinson.md)
