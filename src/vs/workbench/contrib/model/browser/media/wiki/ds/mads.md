# MADS

**Mesh adaptive direct search** (MADS; Audet and Dennis, 2006) is a direct search method with a convergence theory for **non-smooth** objectives. Like pattern search it polls around the incumbent, but on a **mesh** whose size and poll directions are decoupled.

## Mesh and Poll Sizes
MADS keeps two parameters: the **mesh size**, the spacing of the grid on which all trial points lie, and the **poll size**, the distance of the poll points from the incumbent. After a failed poll both shrink, the mesh size faster than the poll size, so the number of possible poll directions on the mesh grows without bound.

## Dense Directions
The growing number of possible poll directions on the mesh lets MADS choose poll directions that become **dense** in the unit sphere over the iterations: every direction is eventually approached. At a kink where the descent directions lie in a narrow cone, MADS eventually polls inside it; pattern search, with its fixed directions, may never do so.

## Convergence
If f is **Lipschitz** near the limit point, MADS converges to a point that is **Clarke stationary**: no direction gives a first-order decrease in the sense of the Clarke generalised derivative. That is the natural optimality condition for non-smooth functions.

## OrthoMADS
The panel uses **OrthoMADS** (Abramson, Audet, Dennis and Le Digabel, 2009) from **DirectSearch.jl**: at each iteration its 2n poll directions form an **orthogonal basis** and its negative, generated deterministically from a Halton sequence so that they become dense while staying well spread. The run is reproducible.

## Constraints and Extensions
MADS handles constraints by an extreme barrier, or a progressive barrier that allows infeasible points with a measure of violation; DirectSearch.jl implements both. NOMAD is the reference C++ implementation.

## In This Panel
The panel builds a DSProblem with an OrthoMADS poll, sets the objective and the initial point x0, and limits the iterations to **Max Iterations**; the **Initial Step** does not apply.

## See Also
- [Pattern Search](pattern-search.md) · [Generating Set Search](generating-set-search.md) · [Decision Guide](decision-guide.md)
