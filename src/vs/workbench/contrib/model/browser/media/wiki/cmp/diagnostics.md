# Diagnostics

A complementarity solution can be checked directly from its definition, so a good result needs no trust in the solver. The harder questions concern other solutions, and how stable the one found is.

## How to Verify a Solution

**Complementarity Check** tests each condition separately: bounds, F ≥ 0 at the lower bound, F ≤ 0 at the upper bound, and F = 0 between them. It prints `max_violation`, the natural residual. All of them should hold at the stated tolerance. Failure on one test names the kind of failure, which a bare residual cannot. Passing is strong evidence, whatever the solver reported. Independent verification matters most when a solve comes from a warm start, or when `solved` is false.

## How to Read the Solver Status

`solved` is true when JuMP reports `LOCALLY_SOLVED`, and `status` holds PATH's own message. **Solver Status** prints both, with the residual. "Locally" refers to the Newton method's local nature, and says nothing about how many other solutions exist. A false flag with a small residual deserves another look, as the point may still be usable. A true flag with a large residual indicates a scale problem. The message names an iteration limit or a stall, and the remedy differs.

## How to Read the Residual Plot

**Residual Plot** re-solves with a limit of 0 to 15 major iterations, and plots the residual. A straight fall on a log scale, steepening at the end, shows the fast local rate expected of Newton methods. A plateau shows a phase of global search, or a poor start. Later rises are allowed, because the rule is nonmonotone, as described by [Dirkse and Ferris (1995)](#ref-DF1995a). A floor at 1e-16 is a plotting device, and the solver's own tolerance is coarser. Non-convergence by 15 calls for a look at the status message.

## How to Search for Other Solutions

**Solution Multiplicity** restarts from 50 random points in [0, 3] for each coordinate, clipped to the box, and lists solutions with counts, keeping only those with a residual under 1e-6. Finding one solution from all starts is reassuring but is no proof. The range of the starts matters, and a solution far outside [0, 3] may never be reached, so scale the range to the problem. Rounding to four digits merges nearby results, and it could also split one solution at a rounding boundary.

## How to Check Local Uniqueness

**Solver Status** gives the smallest eigenvalue of the symmetric part of a finite-difference Jacobian at the solution. A positive value means that F is locally strongly monotone there, which suffices for local uniqueness. A negative value is common even where the solution is locally unique, as the test looks at all of F, and ignores which pairs are active. Better tests use only the active block, or look at P-matrix properties, as discussed by [Cottle, Pang and Stone (1992)](#ref-CPS1992a).

## How to Test Sensitivity and Compare Methods

**Sensitivity Analysis** gives finite-difference slopes for a shift of 1e-4. Compare with a negative shift too, as a one-sided slope is misleading if a pair changes regime under that shift. Very large entries signal near-singularity. **Merit Function Reformulation** solves the same problem with Ipopt, from one start. A close match of both solutions is good cross-validation, and a mismatch may mean that a different solution has been reached, or a stationary point of the merit that is not a solution. Check each with its `residual`.

## References

<a id="ref-CPS1992a"></a>Cottle, R. W., Pang, J.-S. and Stone, R. E. (1992). *The Linear Complementarity Problem*. SIAM. [doi:10.1137/1.9780898719000](https://doi.org/10.1137/1.9780898719000)

<a id="ref-DF1995a"></a>Dirkse, S. P. and Ferris, M. C. (1995). The PATH solver: a nonmonotone stabilization scheme for mixed complementarity problems. *Optimization Methods and Software* 5(2), 123–156. [doi:10.1080/10556789508805606](https://doi.org/10.1080/10556789508805606)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
