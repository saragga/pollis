# Smoothing

**Smoothing** estimates the states given all the observations, p(x[t] | y[1:T]) for t < T, or the joint distribution of the whole path p(x[1:T] | y[1:T]). Later observations carry information about earlier states, so smoothed estimates are more precise than filtered ones, most of all at early steps.

## The Filter's Genealogy
Every particle at the last step has a line of ancestors back to the first step; the paths of the final particles, with their weights, are an approximation of the joint smoothing distribution. But resampling makes the paths **coalesce**: after enough steps all the final particles descend from a few early particles, often one. The approximation of early states then collapses (**path degeneracy**), which the **Resampling and Path Degeneracy** action shows by counting the distinct ancestors.

## Forward Filtering, Backward Simulation
**Forward filtering, backward simulation** (FFBS; Godsill, Doucet and West, 2004) runs the filter and stores the particles and weights at every step. Then, for each of M trajectories:

1. Draw x[T] from the final particles with their weights.
2. For t = T-1 down to 1, draw x[t] from the particles at t, with weights proportional to the filter weight times the transition density p(x[t+1] | x[t]) to the state already drawn.

Each trajectory is an approximate draw from the joint smoothing distribution, and the backward reweighting lets every stored particle contribute at every step, avoiding path degeneracy. The cost is of order M x N x T transition-density evaluations; it needs the transition density, not only a simulator. This is the panel's **Particle Smoother**, with M set by **Smoother Trajectories (M)**.

## Other Smoothers
- **Forward-backward smoothing** computes the marginal smoothing weights for all N particles at every step, at a cost of order N^2 T.
- **Fixed-lag smoothing** approximates p(x[t] | y[1:t+L]) from the genealogy over a short lag L, before the paths coalesce: cheap and online.
- **Two-filter smoothing** combines a forward filter with a backward information filter.
- For linear-Gaussian models, the **Rauch-Tung-Striebel** smoother is exact; the panel compares against it.

## See Also
- [Bootstrap Filter](bootstrap-filter.md) · [Resampling Schemes](resampling-schemes.md) · [Interpretation](interpretation.md)
