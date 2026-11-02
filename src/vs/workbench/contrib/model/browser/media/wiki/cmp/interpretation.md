# Interpretation

The solution of a complementarity problem is a statement about regimes. Reading it means saying which pairs are at a bound, which conditions hold as equations, and what that means in the application.

## How to Read the Printed Result

The run prints `x`, `F_at_x`, `residual` and `solved`. Read `x` and `F_at_x` side by side: at each index, one should be at zero, or at a bound. `residual` should be close to zero, and `solved` should be true. The pattern of zeros across the pairs is the main finding, as it decides the linear system in force near the solution. A value of 1e-9 in place of 0 is a rounding remainder, and it has no meaning in the model.

## How to Read the Pairs

**Complementarity Pairs** draws x_i and F_i(x) as side-by-side bars. On the lower-bound case, only the F bar shows. For an interior variable, only the x bar shows. When a bar in x reaches a positive upper bound, a negative F bar can stand beside it. If neither shows, the pair is degenerate, and is on the edge between two regimes. **Dual Interpretation** gives the same reading as text, labelling each pair at its lower bound, at its upper bound, or interior.

## What the Regimes Mean in Applications

| Application | x_i at lower bound | x_i interior |
|---|---|---|
| Market | Price zero, supply exceeds demand | Price positive, market clears |
| Production | Activity zero, unit loss | Activity positive, zero profit |
| Traffic | Route unused, higher cost | Route used, minimum cost |
| Contact | Force zero, gap open | Force positive, gap closed |

Variables and conditions can be swapped in some formulations, so read them against the model at hand. [Ferris and Pang (1997)](#ref-FP1997a) give many such readings.

## How to Read Sensitivity Results

**Sensitivity Analysis** prints a matrix whose column j is the response of x to a small shift in F_j. In a market, F is excess supply, and a shift is a shift in supply or demand. A zero row means that a variable stays put at its bound, and the signs give comparative statics. The slopes hold only while the active pattern stays the same. Scale the shift to the model: `d = 1e-4` is a test step, and not a shift of any practical size.

## How to Read a Parametric Path

**Parametric Solve** shows x as every component of F shifts by t, from −1 to 1. Smooth segments lie within a regime, and kinks show where a pair switches. A jump, or a gap of NaN values, means that a solve failed or that the path moved to another branch, as can happen when solutions merge. Linear segments are expected on the linear tab. Compare shifts in only one component, by editing the code, for a more specific economic question.

## How to Read Multiple Solutions

Each row from **Solution Multiplicity** is a separate solution, and each should be read as a separate outcome. The count says how often this method found it, and does not mean that the solution is more likely or more stable. In a game, or in an economy, a multiplicity of equilibria is a substantive result, and needs a selection argument from outside the model. Without one, report them all. [Isac (1992)](#ref-Isa1992a) treats the mathematics of the problem in general.

## References

<a id="ref-FP1997a"></a>Ferris, M. C. and Pang, J.-S. (1997). Engineering and economic applications of complementarity problems. *SIAM Review* 39(4), 669–713. [doi:10.1137/S0036144595285963](https://doi.org/10.1137/S0036144595285963)

<a id="ref-Isa1992a"></a>Isac, G. (1992). *Complementarity Problems*. Springer. [doi:10.1007/BFb0084653](https://doi.org/10.1007/BFb0084653)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
