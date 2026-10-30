# Overview

The Attractor & Basin Analysis panel studies the **long-term behaviour of a dynamical system**: where its trajectories end up, which starting points lead where, and how that changes when a parameter changes. Every tab uses the **Lorenz system** as its example; replace `lorenz!` with your own system to study it instead (see [The Lorenz System](lorenz.md)).

## Attractor Finding
An **attractor** is a set that nearby trajectories approach and never leave: a fixed point, a cycle, or a chaotic (strange) attractor. A system can have several at once. The tab finds all of them by running trajectories from random starting points on a grid of the state space, with the recurrence mapper of Attractors.jl.

## Basins of Attraction
The **basin** of an attractor is the set of starting points that end on it. The tab labels every point of the grid by the attractor it reaches and reports each basin's share of the grid, the **basin fractions**.

## Bifurcation
A **bifurcation** is a parameter value where the attractors change in kind: an equilibrium loses stability, two new ones appear, a cycle is born. The tab traces the equilibria of the Lorenz system as rho grows, with their stability, by numerical continuation with BifurcationKit.jl.

## Common Workflow

1. Run **Attractor Finding** at your parameters, and **Single vs Multi-Stability** to see whether one attractor or several coexist.
2. If several coexist, map their **Basins of Attraction**, look at the **Basin Portrait**, and measure how intermingled the basins are with **Basin Entropy**.
3. Check the result: **Convergence Check**, **Recurrence vs Proximity**, and a run with a finer grid.
4. Run **Bifurcation** to see where, as the parameter moves, the equilibria appear and lose stability, then **Tipping Point** to count the attractors over the same range.
5. Characterise a chaotic attractor with its **Attractor Dimension**.

## See Also
- [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md) · [The Lorenz System](lorenz.md)
