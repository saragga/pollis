# Interpretation

## Solution Summary
The **Solution Summary** lists each coefficient next to its true value, with the objective split into the loss and the penalty, and the gap. With the L1 penalty, coefficients outside the true support should be exactly zero, and those inside **shrunk** towards zero by about lambda divided by the column's scale: the lasso's bias.

## Subdifferential
The **Subdifferential** reads the optimality condition, -grad loss(x) in lambda times the subdifferential of the penalty, coordinate by coordinate:
- **L1**: for a nonzero coordinate the loss gradient equals -lambda sign(x_i); for a zero coordinate its absolute value is at most lambda. A zero coordinate with |gradient| close to lambda is on the verge of entering the model.
- **L2**: for x nonzero the loss gradient is -lambda x / ||x||, perfectly aligned against x; for x = 0 its norm is at most lambda.
- **Max norm**: the loss gradient has L1 norm lambda and is supported on the coordinates at the maximum.

## Sparsity Pattern
The **Sparsity Pattern** compares the estimated support, the coefficients above 1e-6 in absolute value, with the true support, listing false positives and missed coefficients. The L1 penalty yields exact zeros; L2 shrinks all coefficients together, all zero or none; the max norm makes many coefficients equal in absolute value, not zero.

## Evaluate at Solution
**Evaluate at Solution** gives the objective, loss and penalty, the gap, the residual norm ||A x - b||, and the **relative recovery error** ||x - x_true|| / ||x_true||, which a good penalty weight keeps small.

## Warm Start and Budget Study
**Warm Start** runs the method again from the solution: a gap that keeps falling means the first run stopped early. The **Budget Study** reports the gap and seconds for 10 to the chosen number of iterations.

## Comparisons
**Compare with ProximalAlgorithms** runs ProximalAlgorithms.jl's FastForwardBackward (FISTA) and DouglasRachford at the same iteration count. **Compare with Subgradient** plots the running best gap of the chosen method against the plain subgradient method. **Algorithm Info** gives the selected method's cost per iteration, step rule and guarantee.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Overview](overview.md)
