# Basins of Attraction

The **basin of attraction** of an attractor is the set of starting points whose trajectories end on it. In a multistable system the basins divide the state space between the attractors, and their shape says how predictable the outcome is.

## How the Tab Maps Them
`basins_of_attraction(mapper, grid)` starts a trajectory from **every point of the grid** and labels it with the attractor it reaches, using the recurrence mapper (see [Attractor Finding](attractors.md)). The result is an array of labels the shape of the grid, and `basins_fractions` gives each label's share. A label of -1 marks starting points whose trajectories left the box.

The cost is one trajectory per grid point: N^3 in three dimensions, 27000 for N = 30. The recurrence mapper reuses what it has learned, so trajectories that enter a labelled cell stop early.

## Grid or Random Starting Points
- **The full grid** (Basins tab, Basin Fractions, Basin Entropy) gives a map of the basins, needed for portraits and entropy.
- **Random starting points** (Attractor Finding, Predict, Compare) give the fractions only, at a cost that does not grow with the dimension. In high dimensions they are the only practical option.

## Shapes of Basins
- **Smooth boundaries**: the outcome is predictable except very near a boundary.
- **Fractal boundaries**: boundaries with structure at every scale. Near them, no finite precision of the starting point decides the outcome. Detected by the basin entropy, Sbb > log 2.
- **Riddled or intermingled basins**: every neighbourhood of a point of one basin contains points of another; the outcome is unpredictable everywhere.

## Related Actions
- **Basin Portrait**: a 2D slice of the basin map.
- **Basin Fractions**, **Basin Entropy**, **Convergence Check**.

## See Also
- [Interpretation](interpretation.md) · [Grid and Settings](settings.md) · [Attractor Finding](attractors.md)
