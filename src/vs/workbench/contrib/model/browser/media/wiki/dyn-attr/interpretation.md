# Interpretation

## How Many Attractors
**Single vs Multi-Stability** reports one attractor (monostable) or several (multistable). In a multistable system the long-run outcome depends on history: two identical systems that start in different places stay different forever, and a large enough disturbance can move the system from one attractor to another.

## Basin Fractions
The fraction of the box whose starting points reach each attractor. Read it as a **probability** only for starting points spread evenly over the box: it changes with the box. It is a measure of **resilience**: an attractor with a small basin is easily lost to a disturbance.

## Basin Portrait
A colour map of a 2D slice of state space (z = 25 for Lorenz), each colour an attractor. Smooth regions with simple boundaries mean predictable outcomes; finely interleaved colours mean that small errors in the starting point change the outcome.

## Basin Entropy
Two numbers that summarise how mixed the basins are (Daza et al., 2016). The grid is cut into boxes, and the entropy of the attractor labels inside each box is averaged:

- **Sb**, over all boxes: 0 means a single basin; higher means more uncertainty about the outcome of a random starting point.
- **Sbb**, over the boxes on a boundary only. **Sbb > log 2** proves the boundaries are fractal; below it, the test is inconclusive.

## Attractor Dimension
The **correlation dimension** of a long trajectory, from the Grassberger-Procaccia method. A fixed point has dimension 0, a cycle 1, a torus 2. A **non-integer** value means a strange, usually chaotic, attractor: about 2.05 for Lorenz at rho = 28.

## Bifurcation Diagram
Equilibria against the parameter: **solid** where stable, **dashed** where unstable. At a **pitchfork** one equilibrium loses stability and two new ones branch off; at a **Hopf** point an equilibrium loses stability to oscillations. Past the last stable branch, the attractor is not an equilibrium: a cycle or chaos, which the diagram of equilibria does not show.

## See Also
- [Basins of Attraction](basins.md) · [Bifurcation Diagrams](bifurcation.md) · [Diagnostics](diagnostics.md)
