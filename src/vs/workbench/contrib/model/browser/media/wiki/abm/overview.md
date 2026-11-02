# Overview

An agent-based model states rules for individuals and lets the behaviour of the whole system come out of running them. The panel shows that idea through three classic models, one for each kind of space an agent can live in.

## What an Agent-Based Model Is

An agent-based model represents a system as many separate agents, each with its own state and a rule for acting on what it finds around it. Nothing in the model states what the population as a whole should do. The aggregate result is computed by running the rules, step by step, from a starting state. [Epstein and Axtell (1996)](#ref-EA1996a) made this bottom-up approach a way of doing social science, by asking which local rules are enough to generate a pattern seen in society. The model is usually stochastic, so one run is one draw from a distribution of possible histories.

## What Emergence Means in an Agent-Based Model

Emergence is a pattern at the level of the population that no single agent's rule mentions. Segregated neighbourhoods appear although no resident asks for them, and a flock travels in one direction although no particle leads. [Bedau (2003)](#ref-Bed2003a) reviews artificial life, the field that builds such organisation from the bottom up. The rules of a system can be simple while its aggregate behaviour is hard to predict without running it, which is the main reason to simulate at all. An emergent pattern shows that a mechanism is sufficient to produce the outcome. It does not show that the same mechanism produced it in the real world.

## Which Models the Agent-Based Models Panel Runs

**Grid Space** runs the segregation model of [Schelling (1971)](#ref-Sch1971a), in which residents with a mild preference for like neighbours sort themselves into blocks. **Continuous Space** runs the flocking model of [Vicsek, Czirok, Ben-Jacob, Cohen and Shochet (1995)](#ref-VCBCS1995a), in which particles align with their neighbours under noise and pass from disorder to order. **Graph Space** runs an SIR epidemic on a contact network, read through the percolation analysis of [Newman (2002)](#ref-New2002a). All three are written with `Agents.jl`, the package of [Datseris, Vahdati and DuBois (2022)](#ref-DVD2022a).

## How One Step of an Agent-Based Model Runs in the Panel

Every tab builds a space, adds agents, and calls `run!(model, T; mdata)`, where **Steps (T)** sets the length of the run and `mdata` lists the quantities recorded at each step. `StandardABM` with `Schedulers.Randomly()` activates every agent once per step, in a fresh random order. An agent acts on the state as the agents before it left it, so updates are sequential and not simultaneous. The recorded columns are read with `Tables.columntable`, and **Seed** fixes the random number generator, so a run can be repeated exactly.

## A Common Workflow for an Agent-Based Model

1. Pick a tab and read the printed start and end values.
2. Look at the run with **Snapshots** or **Video**.
3. Check **Convergence**, and raise **Steps (T)** if the run has not settled.
4. Use **Reproducibility** and **Ensemble** to see how much of the outcome is chance.
5. Use **Parameter Sweep**, **Structure** and **Phase Diagram** to see what the outcome depends on.
6. Finish with **Summary** and **Scenario**, and read any result as a statement about the mechanism and not about a real population.

## References

<a id="ref-Bed2003a"></a>Bedau, M. A. (2003). Artificial life: organization, adaptation and complexity from the bottom up. *Trends in Cognitive Sciences* 7(11), 505–512. [doi:10.1016/j.tics.2003.09.012](https://doi.org/10.1016/j.tics.2003.09.012)

<a id="ref-DVD2022a"></a>Datseris, G., Vahdati, A. R. and DuBois, T. C. (2022). Agents.jl: a performant and feature-full agent based modelling software of minimal code complexity. *SIMULATION* 100(10), 1019–1031. [doi:10.1177/00375497211068820](https://doi.org/10.1177/00375497211068820)

<a id="ref-EA1996a"></a>Epstein, J. M. and Axtell, R. (1996). *Growing Artificial Societies: Social Science from the Bottom Up*. MIT Press.

<a id="ref-New2002a"></a>Newman, M. E. J. (2002). Spread of epidemic disease on networks. *Physical Review E* 66(1). [doi:10.1103/PhysRevE.66.016128](https://doi.org/10.1103/PhysRevE.66.016128)

<a id="ref-Sch1971a"></a>Schelling, T. C. (1971). Dynamic models of segregation. *Journal of Mathematical Sociology* 1(2), 143–186. [doi:10.1080/0022250X.1971.9989794](https://doi.org/10.1080/0022250X.1971.9989794)

<a id="ref-VCBCS1995a"></a>Vicsek, T., Czirok, A., Ben-Jacob, E., Cohen, I. and Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. *Physical Review Letters* 75(6), 1226–1229. [doi:10.1103/PhysRevLett.75.1226](https://doi.org/10.1103/PhysRevLett.75.1226)

## See Also

- [Factsheet](factsheet.md) · [Grid Space](grid-space.md) · [Continuous Space](continuous-space.md) · [Graph Space](graph-space.md) · [Decision Guide](decision-guide.md)
