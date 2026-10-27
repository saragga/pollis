# Diagnostics

## Convergence Check
Maps the initial state u0 and a copy moved by 1e-6, and reports whether both reach the same attractor. If not, u0 lies on or near a **basin boundary**: tiny changes in the starting point change the outcome, and any prediction from u0 is fragile.

## Recurrence vs Proximity
Finds the attractors with the recurrence mapper, then maps the same 500 initial conditions with the **proximity mapper**, which labels a trajectory by the known attractor it comes close to. Both use the same starting points, so their basin fractions should agree almost exactly; a clear difference points to a recurrence setting that is too low, or an attractor the recurrence mapper split in two.

## Basin Fractions
The share of the grid, or of the random initial conditions, that reaches each attractor. A label of -1 means trajectories that left the box: enlarge it. From n random initial conditions a fraction f has a sampling error of about sqrt(f (1 - f) / n), up to 3.5 percentage points with 200.

## Bifurcation
- `println(origin)` and `println(wings)` list the **special points** found on each branch, with their type and parameter: for Lorenz a branch point (`bp`) at rho = 1 on the origin, and a `hopf` point at 24.74 on C+ and C-.
- A point missed or misplaced usually means a step too large: lower `dsmax`. A branch that stops before `p_max` has hit `max_steps`.

## Quick Checklist

| Check | Action | Good sign | Warning sign |
|---|---|---|---|
| Grid covers the dynamics | Basin Fractions | No -1 label | A -1 label: trajectories leave the box |
| Grid fine enough | Rerun with 2N | Same attractors and fractions | Attractors appear, merge or split |
| Mapper agrees with itself | Recurrence vs Proximity | Same fractions | Fractions differ |
| Initial state robust | Convergence Check | Same basin | Different basins: near a boundary |
| Bifurcations located | Bifurcation | Pitchfork at 1, Hopf at 24.74 (Lorenz) | Points missing or shifted |

## See Also
- [Grid and Settings](settings.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
