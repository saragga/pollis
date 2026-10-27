# Assumptions

## The Model
- **Linear and additive**: the measurement is the sum of the patterns, each times its amount, plus noise. In spectroscopy this is the Beer-Lambert law; where it fails (saturation, interactions between components) the amounts are biased.
- **The patterns are complete**: every component present in b has a column in A. A missing component is fitted by whatever columns resemble it, and shows up in the residuals.
- **The sign constraint is real**: the true amounts cannot be negative. If they can, NNLS forces some to zero and biases the others.

## The Noise
- **Least squares weights every observation equally.** If some observations are noisier than others, divide each row of A and each element of b by that observation's standard deviation first.
- **No outliers**: one large error pulls the whole fit.

## The Matrix A
- **Full column rank for a unique answer.** When columns are linearly dependent (more patterns than observations, or a pattern that is a combination of others), many x give the same fit, and the solver returns one of them.
- **Overlap makes amounts uncertain.** Columns that are nearly alike are hard to tell apart; NNLS then often gives all the weight to one of them and zero to the others, and which one can change with a little noise.
- **No free intercept.** A column of ones is constrained to be non-negative like any other. To fit an unconstrained baseline, subtract it from b first, or use a solver that leaves some coefficients free.

## Scaling
Multiplying a column of A by a positive number divides its amount by the same number and leaves the fit unchanged, so the units of the columns do not change which components are zero. Flipping a column's sign does: the constraint is on the sign.

## See Also
- [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Factsheet](factsheet.md)
