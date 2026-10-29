# NUTS

The **No-U-Turn Sampler** (Hoffman and Gelman) is Hamiltonian Monte Carlo without its hardest setting: the number of leapfrog steps.

## The Idea
HMC follows a simulated trajectory from the current point, and the draw is a point along it. A trajectory that is too short behaves like a random walk; one that is too long loops back towards where it started and wastes computation. NUTS grows the trajectory forwards and backwards in time, doubling its length each time, until the two ends start to move towards each other, a **U-turn**. It then picks the next draw among the points of the trajectory, in a way that keeps the target distribution exact.

## Adaptation
During **warm-up** NUTS also tunes:
- the **step size**, by dual averaging, so that the average acceptance statistic reaches the **target acceptance** (0.65 in this panel, Turing's default; 0.8 in Stan);
- the **mass matrix**, the scale of each parameter, from the spread of the warm-up draws.
The warm-up draws are discarded.

## Settings
In Turing, NUTS(n_adapts, delta) takes the number of adaptation steps and the target acceptance. A higher delta gives smaller steps: slower, but fewer divergent transitions in difficult regions. The **maximum tree depth** caps the trajectory at 2^depth leapfrog steps; hitting it often means the posterior is very elongated or badly scaled.

## Strengths and Limits
NUTS produces nearly independent draws on smooth posteriors with hundreds or thousands of parameters, with no hand tuning. It needs gradients, so continuous parameters only, and each draw can cost many gradient evaluations. Funnels and strongly varying curvature still defeat it: those need reparametrisation.

## In Turing.jl

    chain = sample(model(data), NUTS(1000, 0.65), 2000)

## See Also
- [HMC](hmc.md) · [Metropolis-Hastings](metropolis-hastings.md) · [Diagnostics](diagnostics.md)
