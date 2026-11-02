# Continuous Space

The tab runs the flocking model of Vicsek and colleagues in a square box. Particles that only copy their neighbours can move as one flock, or stay a disordered gas, depending on noise and density.

## What the Vicsek Flocking Model Computes

**Particles (N)** self-propelled particles move at constant speed in a box of side **Box Side (L)** with periodic boundaries. At each turn a particle takes the mean heading of its neighbours within radius 1, itself included, adds a random angle, and moves along the result. [Vicsek, Czirok, Ben-Jacob, Cohen and Shochet (1995)](#ref-VCBCS1995a) showed that this rule alone produces a transition from disorder to collective motion. The tab records `polarisation`, and prints its value at step 0 and its mean over the second half of the run.

## What Formulas Define the Continuous Space Model

- Mean heading: the sum of the unit headings of the particle and its neighbours, turned into an angle with `atan`
- New angle: mean angle + **Noise** × pi × u, where u is uniform on [-1, 1]
- New position: old position + 0.3 × new heading, wrapped at the box edges
- Polarisation: |sum of unit headings| / N
- Density: N / L²

Polarisation is 1 when all headings agree. With independent random headings it is of order 1 / sqrt(N), and so not exactly 0 in a finite flock.

## Which Inputs the Continuous Space Tab Uses

**Particles (N)** and **Box Side (L)** together set the density, and so the mean number of neighbours within the radius. **Noise** is a share of pi between 0 and 1: at 1 the added angle covers the whole circle, and the new heading ignores the neighbours. **Steps (T)** sets the length of the run, and **Seed** the starting positions, the headings and the noise. The radius of 1 and the speed of 0.3 are keywords of `initialize`, and `spacing = radius / 1.5` tunes only the neighbour search, not the model.

## Where the Vicsek Model Is Strong

Order arises with no leader, no global signal and no attraction between particles, which makes the model a clean statement about local alignment. One number summarises the state, and two control parameters, noise and density, map out where order appears. That makes it a good model for learning to read a transition with **Parameter Sweep** and **Phase Diagram**. Periodic boundaries remove edge effects, so what is seen comes from the rule itself. The earlier flocking model of [Reynolds (1987)](#ref-Rey1987a) needs three rules, separation, alignment and cohesion, where the Vicsek model needs only one.

## Where the Vicsek Model Misleads

Particles in the tab update one after another in random order, each seeing the moves of those before it, while the original model updates all particles at once. The two schemes need not give the same transition point. The tab's noise is the share of pi described in the inputs, so its values do not map one to one on the published noise amplitude without a factor of two pi. Particles have no size and can overlap. In a small box, finite size blurs the transition, so the sharpness of a curve says little about its true character.

## What to Compare the Continuous Space Model With

**Parameter Sweep** gives polarisation against noise, and **Structure** gives it against the number of particles at the chosen noise. **Scenario** applies a burst of high noise and restores it, to see whether order returns. **Phase Diagram** joins the two control parameters on one heatmap. Adding cohesion and separation to `vicsek_step!`, as in [Reynolds (1987)](#ref-Rey1987a), turns the model into a flock that also holds together.

## References

<a id="ref-Rey1987a"></a>Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. *ACM SIGGRAPH Computer Graphics*, 25–34. [doi:10.1145/37401.37406](https://doi.org/10.1145/37401.37406)

<a id="ref-VCBCS1995a"></a>Vicsek, T., Czirok, A., Ben-Jacob, E., Cohen, I. and Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. *Physical Review Letters* 75(6), 1226–1229. [doi:10.1103/PhysRevLett.75.1226](https://doi.org/10.1103/PhysRevLett.75.1226)

## See Also

- [Factsheet](factsheet.md) · [Grid Space](grid-space.md) · [Graph Space](graph-space.md) · [Interpretation](interpretation.md)
