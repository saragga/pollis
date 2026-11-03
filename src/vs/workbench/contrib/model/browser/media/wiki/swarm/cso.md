# Swarm Intelligence: CSO

The **CSO** tab runs the competitive swarm optimiser of Cheng and Jin, written in plain Julia in the panel's code: random pairs of particles compete, and the loser of each pair learns from the winner and from the mean of the swarm.

## Origin

[Cheng and Jin (2015)](#ref-CJ2015a) propose CSO for large scale optimisation. The algorithm is inspired by particle swarm optimisation but conceptually very different: neither the personal best position of each particle nor the global best position, or neighbourhood best positions, is involved in updating the particles. Instead, a pairwise competition mechanism is introduced, in which the particle that loses the competition updates its position by learning from the winner.

They provide a theoretical proof of convergence and an empirical analysis of exploration and exploitation, and report solving problems of dimensionality up to 5 000.

## The update in the code

In each iteration, the code computes the swarm mean x̄, shuffles the particles with `randperm(N)` and pairs them. In each pair, the particle with the lower value is the winner w and the other the loser l, whose velocity and position are updated:

V_l ← r₁ ∘ V_l + r₂ ∘ (X_w − X_l) + φ r₃ ∘ (x̄ − X_l),
X_l ← clamp(X_l + V_l, lb, ub),

with r₁, r₂ and r₃ vectors of uniform random numbers, ∘ the elementwise product and φ the input **Mean Attraction (phi)**. Only the loser is evaluated again; the winner passes to the next iteration unchanged.

## Evaluations

The code evaluates all N particles once at the start and then one loser per pair, N/2 evaluations per iteration. The tooltip of **Iterations** counts one evaluation per pair for CSO, against about one per particle for PSO, WOA and GSA; with the defaults, N = 40 and 500 iterations, the run evaluates f 40 + 20 · 500 = 10 040 times.

The **Hyperparameter Guide** of the tab notes that half the swarm is updated each iteration. **Population Sensitivity** keeps N times the iterations about constant, so for CSO it also keeps the number of evaluations about constant.

## Mean attraction

**Mean Attraction (phi)** weights the pull of each loser towards the swarm mean; the tooltip states that 0 disables it and suggests around 0.1 in moderate dimensions. The **Hyperparameter Guide** describes it as the pull of losers towards the swarm mean, giving more diversity when larger.

The Metaheuristics.jl documentation lists a `CSO` type for a competitive swarm optimiser for large scale optimisation, with defaults N = 400 and φ = 0.1. The panel's tab runs its own implementation, with N from **Swarm Size**.

## Randomness and bounds

The code calls `Random.seed!(seed)` and draws the initial positions uniformly in the box, `lb .+ rand(d) .* (ub .- lb)`, with zero velocities. After each move, `clamp` keeps the loser inside the box.

The final swarm `X` is returned as `pop`, so **Population Snapshot** and **Swarm Diversity** read the same particles as for the other tabs. The best point is the particle with the lowest value at the end.

## When the tab applies

The decision table gives the context of CSO as higher-dimensional problems where PSO converges prematurely, and its purpose as random pairs that compete, with the loser learning from the winner and the swarm mean and no personal or global bests kept. The algorithm table of the Metaheuristics.jl documentation marks CSO as supporting large scale problems.

**Dimension Scaling** re-runs the tab for n = 2, 5, 10, 20 and 40, and **Algorithm Shootout** compares PSO, ABC, WOA and CGSA at the evaluations of the CSO run.

## References

<a id="ref-CJ2015a"></a>Cheng, R., & Jin, Y. (2015). A Competitive Swarm Optimizer for Large Scale Optimization. *IEEE Transactions on Cybernetics* 45(2), 191-204. [doi:10.1109/TCYB.2014.2322602](https://doi.org/10.1109/TCYB.2014.2322602)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [PSO](pso.md) · [ABC](abc.md) · [WOA](woa.md) · [GSA](gsa.md)
