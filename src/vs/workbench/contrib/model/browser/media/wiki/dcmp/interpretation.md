# Interpretation

## ECDF
Read it as "the fraction of observations at or below this value." Where the empirical curve sits **left** of the reference, the sample has smaller values there; the **largest vertical gap** is the headline goodness-of-fit discrepancy (and the KS statistic).

## QQ Plot
The 45° reference line is "perfect match." Departures have standard signatures:
- **Both ends above/below the line bending the same way** → skew.
- **Ends peeling away symmetrically (S)** → heavier tails than the reference.
- **Ends pulling inward** → lighter tails.
A QQ plot is the single most informative normality check.

## Marginal Plot
The centre tells the **relationship**; the margins tell each variable's **own distribution**. A linear centre cloud with two normal margins is the textbook well-behaved case; skewed margins or a curved centre flag transformation candidates.

## Correlogram
Scan **off-diagonal** panels for tilted (correlated) clouds and the **diagonal** for marginal shape. It is a survey, not a final answer — follow up suspicious pairs with a dedicated scatter or correlation test.

## Caveat
Visual fit is necessary, not sufficient. Confirm with a goodness-of-fit test, and remember small samples make even a good fit look ragged.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
