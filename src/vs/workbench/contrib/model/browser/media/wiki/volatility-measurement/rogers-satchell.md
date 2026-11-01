# Volatility Measurement — Rogers-Satchell

The Rogers-Satchell estimator reads the same four daily prices as Garman-Klass, in a form whose expectation does not depend on the drift. [Rogers and Satchell (1991)](#ref-RS1991a) built it for prices that trend within the bar.

## How the Rogers-Satchell Estimator Is Computed

For each day, `rogers_satchell_volatility` computes log(H/C) log(H/O) + log(L/C) log(L/O). The daily volatility is the square root of the mean of these values over the n days. Each logarithm is measured from the high or the low, so both products have factors of the same sign, and no day can give a negative term. Note that the formula holds no constant such as 4 log 2, since the two products already have the scale of a variance.

## Why Drift Does Not Affect Rogers-Satchell

The drift moves the high, low and close together, and the products are arranged so that its contribution cancels in expectation. A simple extreme case shows the idea. On a day when the open is the low and the close is the high, a straight rise with no reversal, both products are zero, so the day counts as no variance, however large the rise was. The **Garman-Klass** formula gives that same day a positive value, which is its drift bias.

## What the Rogers-Satchell Estimator Assumes

The estimator assumes a Brownian motion with constant drift and volatility within each bar, sampled continuously enough for high and low to be accurate. Drift need not be zero, and need not be known. Jumps within the bar are not allowed for. Like the other same-day formulas, it leaves out the overnight gap, so close-to-open variance is excluded. The downward bias from discrete observation of the high and low applies here too.

## When to Prefer Rogers-Satchell

**Rogers-Satchell** suits daily bars of an asset that trends strongly within the day, or any sample where drift cannot be dismissed. Over a daily bar, the drift of most assets is small next to their volatility, so the gain over **Garman-Klass** may be modest and each can check the other. The gain is greater with long bars such as weekly or monthly ones, over which drift accumulates. Remember that the input bars need not be daily, but **Annualise** scales as if they were.

## How to Read a Rogers-Satchell Result

The figure is a daily volatility as a decimal, and **Compare Estimators** puts it beside close-to-close volatility. If **Garman-Klass** comes out clearly higher than **Rogers-Satchell** on the same data, drift is a likely reason, and **Rogers-Satchell** is the one to trust. This estimator also forms the intraday component of **Yang-Zhang**, so the two differ by the overnight and open-to-close terms that the latter adds.

## References

<a id="ref-RS1991a"></a>Rogers, L. C. G. and Satchell, S. E. (1991). Estimating variance from high, low and closing prices. *Annals of Applied Probability* 1(4), 504–512. [doi:10.1214/aoap/1177005835](https://doi.org/10.1214/aoap/1177005835)

## See Also

- [Overview](overview.md) · [Parkinson](parkinson.md) · [Garman-Klass](garman-klass.md) · [Yang-Zhang](yang-zhang.md)
