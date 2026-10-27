# Grid and Settings

The attractor and basin tabs work on a **grid**: a box in state space cut into N cells per dimension. Most surprises come from the grid or the mapper settings, not from the system.

## What the Methods Assume
- **A deterministic, autonomous system**: the same state always leads to the same future, and the equations do not change with time. Noise or time-varying forcing need other tools.
- **Bounded dynamics inside the box**: a trajectory that leaves the grid is labelled -1 and is not assigned to any attractor. The Lorenz box, x and y from -30 to 30 and z from 0 to 60, holds its attractors for rho up to about 35.
- **Attractors larger than a cell**: two attractors that pass through the same cell cannot be told apart. The panel's Predict actions report "attractors too close for the grid" when that happens.
- **Transients shorter than the integration**: a trajectory must reach its attractor within the time the mapper allows.

## The Settings

| Setting | Panel default | Effect |
|---|---|---|
| Grid box | x, y in [-30, 30], z in [0, 60] | Must contain every attractor; basin fractions are shares of this box |
| N, cells per dimension | 30 | Finer grids separate close attractors and resolve basin boundaries; the basin map costs N^3 trajectories in 3D |
| `consecutive_recurrences` | 1000 | Revisits to already-visited cells in a row before a trajectory is declared on an attractor; raise it for long transients |
| `attractor_locate_steps` | 1000 | Steps recorded once on the attractor, to store its cells; raise it for large chaotic attractors |
| Random initial conditions | 200 (500 in Compare) | More starting points find rare attractors and narrow the sampling error of the fractions |

## Rules of Thumb
- **Double N and compare.** If the number of attractors or the basin fractions change, the grid was too coarse.
- **Raise the recurrences** when the same attractor is found twice, as two labels for one chaotic set.
- **Start coarse**, N = 20 to 30, and refine only the region of interest: a 2D slice (as in the Basin Portrait) costs N^2, not N^3.

## See Also
- [Diagnostics](diagnostics.md) · [Attractor Finding](attractors.md) · [Basins of Attraction](basins.md)
