# Decision Guide

| Question | Method | Why |
|---|---|---|
| What attractors does the system have at these parameters? | **Attractor Finding** ([Attractor Finding](attractors.md)) | Finds every attractor random starting points reach, with no prior knowledge |
| Which starting points lead to which attractor? | **Basins of Attraction** ([Basins](basins.md)) | Labels every grid point |
| How robust is each attractor to disturbances? | **Basin Fractions** | The size of the basin |
| How unpredictable is the outcome from a starting point? | **Basin Entropy** | Measures how intermingled the basins are, and detects fractal boundaries |
| Where do equilibria appear or lose stability as a parameter changes? | **Bifurcation** ([Bifurcation Diagrams](bifurcation.md)) | Deterministic continuation, unstable branches included |
| How does the set of attractors, chaos included, change with a parameter? | **Tipping Point**, or `global_continuation` of Attractors.jl | Counts or follows every attractor across parameter values |
| Is the attractor chaotic? | **Attractor Dimension** | A non-integer dimension means a strange attractor |

## Decision Flow

1. **Do you know the attractors already?** If yes, map basins with the proximity mapper, which is faster. If not, use the recurrence mapper, which finds them.
2. **Is there more than one attractor?** If yes, map the basins and compute the basin entropy. If no, the basin is the whole box and there is nothing to map.
3. **Does a parameter matter?** Run the Bifurcation tab for the equilibria and their stability, then sweep the parameter with Tipping Point to see the attractors that are not equilibria.
4. **Is the result reliable?** Run the checks in [Diagnostics](diagnostics.md).

## Rules of Thumb
- **Continuation and attractor finding complement each other**: continuation sees unstable equilibria and locates bifurcations exactly, but not chaos; attractor finding sees chaos, but only what is stable.
- **Check every result with a finer grid** before reporting it.
- **Report the box** with every basin fraction.

## See Also
- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md)
