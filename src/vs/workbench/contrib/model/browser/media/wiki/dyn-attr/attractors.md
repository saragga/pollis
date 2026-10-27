# Attractor Finding

An **attractor** is a set in state space that trajectories approach and, once on it, never leave: an equilibrium (a fixed point), a periodic orbit (a limit cycle), a quasi-periodic torus, or a chaotic attractor. The Attractor Finding tab finds every attractor of the system that starting points in the grid box reach.

## The Recurrence Mapper
The tab uses `BasinMapRecurrences` of Attractors.jl (Datseris and Wagemakers, 2022), the method formerly called `AttractorsViaRecurrences`:

1. A trajectory is integrated from a starting point, and the grid cells it visits are marked.
2. When it keeps returning to cells already visited, `consecutive_recurrences` times in a row, it is on an attractor. The next `attractor_locate_steps` steps record the attractor's cells, under a new label.
3. Later trajectories stop as soon as they enter a cell already labelled, and take that label.

It needs no prior knowledge of the attractors and treats fixed points, cycles and chaos alike. It finds only the attractors that the starting points reach: the tab maps 200 random starting points first, then calls `extract_attractors`.

## Other Mappers
- **Proximity** (`BasinMapProximity`): the attractors must be known; a trajectory takes the label of the attractor it comes within a distance of. Fast and exact once the attractors are known; used in the Recurrence vs Proximity action.
- **Featurizing** (`BasinMapFeaturizeGroup`, with `GroupViaClustering`): describes each trajectory by features, such as its mean or its range, and clusters them. Useful for high-dimensional systems where a grid is too costly.

## Related Actions
- **Attractor Plot**: each attractor in the x-z plane, one colour per label.
- **Single vs Multi-Stability**: one attractor or several.
- **Attractor Dimension**: the correlation dimension of a long trajectory.

## See Also
- [Basins of Attraction](basins.md) · [Grid and Settings](settings.md) · [The Lorenz System](lorenz.md)
