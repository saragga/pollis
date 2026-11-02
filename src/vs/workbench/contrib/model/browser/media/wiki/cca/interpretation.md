# Interpretation

Reading the output means answering three questions: how strong each link is, how much of each block it covers, and what it represents.

## How to Read Canonical Correlations

**Canonical Correlations** plots one bar per dimension. Values fall from left to right by construction under **CCA**, and the size of the first is the maximum linear correlation available between the blocks in this sample. In-sample values overstate the population values, more so with many variables. A value alone does not show importance, as the pair may cover little of each block. Squaring a correlation gives the shared variance between the two variates, which **Compare Dimensions** reports along with a running share.

## How to Read Compare Dimensions

**Compare Dimensions** tabulates each dimension's correlation, its square as `shared`, and `cumulative`, the running sum of squares divided by the total over the **k** dimensions kept. The last entry is therefore always 1, and it does not mean that everything is explained. A sharp fall between two dimensions marks a natural place to stop. The figure speaks of the variates only, and it does not describe the variance of X or Y. Raise **k** to the full min(p, q) for a complete account.

## How to Read Weights and Structure Correlations

**Canonical Coefficients** shows the weights in each variate, and **Structure Correlations** shows the correlation of each variable with the variates. Weights say what a variable adds given the rest of its block. They are sensitive to collinearity, and they depend on scale unless the data are standardised. Structure correlations show what a variate resembles, and they are easier to name. The usual practice is to name a dimension from structure correlations, and to use weights for scoring new rows. Signs can flip together across a pair, without changing the meaning.

## How to Read the Redundancy Index

`Y_given_X` is how much of Y's variance each X variate explains on average, and `X_given_Y` is the reverse. Unlike correlations, they are not symmetric. A low value means that a pair is real but narrow. Redundancy answers the applied question of how far one block predicts the other, and that makes it more honest than `rho` for that purpose. [Stewart and Love (1968)](#ref-SL1968a) proposed it for this reason. A high redundancy in one direction only may show that one block has a dominant factor shared with the other.

## How to Read the PLS and Regularised Results

**PLS** prints `rho` too, but it did not maximise that number, so low values do not signal failure. Its values may not fall in order, and the covariance is what falls, as the singular values of Sxy. Compare methods on held-out correlations and not on training values, since **CCA** has the highest in-sample correlation by construction. **Regularised CCA** gives lower in-sample correlations, often with better out-of-sample ones. Weights from the three tabs have different scales, so only the patterns can be compared.

## What a Strong Link Does Not Mean

Correlated variates do not imply that one block causes the other, and shared drivers or groups may explain the link. In the default data, for instance, wines come from three cultivars, so a pair may mostly separate the cultivars. Analysing within groups, or removing group means, is a way of telling such things apart. A result also describes one population and one set of variables. [Anderson (2003)](#ref-And2003a) treats the sampling theory, and that theory assumes a single population, an assumption that a mixture of groups does not meet.

## References

<a id="ref-And2003a"></a>Anderson, T. W. (2003). *An Introduction to Multivariate Statistical Analysis*, 3rd ed. Wiley.

<a id="ref-SL1968a"></a>Stewart, D. and Love, W. (1968). A general canonical correlation index. *Psychological Bulletin* 70(3), 160–163. [doi:10.1037/h0026143](https://doi.org/10.1037/h0026143)

## See Also

- [Factsheet](factsheet.md) · [CCA](cca.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
