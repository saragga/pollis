# Decision Guide

The first decision is whether a model of individuals is needed at all. After that come the kind of space, the length of the run and the number of replicates.

## Which Agent-Based Models Tab Fits a Question

| Question | Tab | Why |
|---|---|---|
| Who lives or sits next to whom, on a discrete map | **Grid Space** | Agents occupy cells, and neighbours are the surrounding cells |
| How moving individuals coordinate | **Continuous Space** | Positions and headings are real numbers, and neighbours lie within a radius |
| How something passes along relationships | **Graph Space** | Neighbours are links, and any network can be used |
| How the pattern of contacts changes an outcome | **Graph Space** | **Network** changes the links at the same mean degree |

## When an Agent-Based Model Is Worth Using

The approach pays when individuals differ, when who meets whom matters, or when chance events at small numbers shape the outcome. Equations for averages are simpler, faster and easier to analyse when the population mixes well and is large, and should be preferred then. [Wilensky and Rand (2015)](#ref-WR2015b) introduce the approach for such complex systems. A model of individuals also needs more assumptions than an equation for the whole, and each one needs a defence. If nothing in the question depends on individuals, the extra detail adds cost without adding insight.

## How to Choose the Length of an Agent-Based Run

**Steps (T)** should be long enough for the question. **Convergence** tells whether the main run reached a settled state or the end of the epidemic. A flock needs enough steps for particles to cross several interaction radii, and that depends on the speed and the box. An epidemic needs a few multiples of 1 / gamma beyond its peak. Sweeps and diagrams run the model many times, so they gain from a shorter **Steps (T)**, once **Convergence** has shown what is long enough.

## How Many Replicates an Agent-Based Study Needs

One run shows what can happen, and several show what usually happens. **Reproducibility** with 10 seeds gives a first sense of the spread, and **Ensemble** with 20 shows the distribution. Tail figures and rare events, such as how often an epidemic dies out, need far more runs than a mean. To detect a small difference between two settings, the number of runs must make the standard error small against that difference. The replicate counts are written in the code as `ensemble = 20` and in the `:seed` lists of `paramscan`, and can be raised there.

## When to Leave the Agent-Based Models Panel for Another

**Ensemble & Parameter Scanning** goes further into replicates and scans, and **ABM Visualisation** into plots and video of a run. **Network Dynamics** suits deterministic dynamics on a network, where individuals do not act at random. A model built to match a real system needs data, calibration and validation, which none of these panels provides directly. Before building one, [Epstein and Axtell (1996)](#ref-EA1996a) are a good example of how far simple rules can go, and of what such a study claims.

## References

<a id="ref-EA1996a"></a>Epstein, J. M. and Axtell, R. (1996). *Growing Artificial Societies: Social Science from the Bottom Up*. MIT Press.

<a id="ref-WR2015b"></a>Wilensky, U. and Rand, W. (2015). *An Introduction to Agent-Based Modeling: Modeling Natural, Social, and Engineered Complex Systems*. MIT Press.

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
