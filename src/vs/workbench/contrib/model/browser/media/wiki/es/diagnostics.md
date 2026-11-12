# Diagnostics

Stochastic global methods give no certificate of optimality. Evidence comes from convergence traces, repeated runs, a change of budget or box, and a local look at the solution.

## How to Read the Convergence Curve

**Convergence Curve** plots all evaluations and the running best on a log scale, against evaluations. A long steady fall on a log scale means linear convergence in a basin. Steps followed by long flat parts mean jumps between basins. A curve still falling at the end means that the budget was too small. A floor well above zero, on a function whose minimum is known to be 0, signals a local minimum, and for Rastrigin at d = 5, floors near whole numbers count local coordinates off by about one.

## How to Read the Search Radius

**Search Radius History** plots the mean standard deviation of samples, in windows of evaluations. Adapted methods should fall steadily over many orders. An early collapse means premature convergence. A radius stuck at a high level means that the search has not begun to settle, and it may need more budget. Its window mixes generations, so that a rise can be a change of phase. **Population Spread** shows the same thing in space, for x1 and x2, with colour for time.

## How to Check Repeatability

**Multi-Start Analysis** repeats the run on 10 seeds. Read `best_values`, `spread` and `share_at_best`. If only one or two seeds reach the lowest value, a single run has little chance, and more budget or restarts are needed. `max_distance_between_solutions` shows whether distant solutions tie. On Rastrigin, distances near 1 per coordinate point to neighbouring ripples. All seeds agreeing is a good sign, though not proof, as they all share the same bias in the method.

## How to Test Budget and Box

**Budget Sensitivity** covers 5% to 200% of **Budget** across 3 seeds. Values should fall and level off. A fall from 100% to 200% suggests the budget is too small. **Bounds Sensitivity** reruns on shrunk, enlarged and shifted boxes, reporting `change` and `moved`. A large change reveals dependence on the box, or just a different random path, so compare with the seed spread. The shifted box is the helpful test on a symmetric function, since the optimum then no longer lies at the centre.

## How to Check the Answer Locally

**Evaluate at Minimum** checks the value, and it estimates a gradient by central differences. On Rastrigin at the origin, curvature is 2 + 40π², about 397, per coordinate, so that f ≈ 198 δ² and the gradient ≈ 397 δ. A gradient of 0.03 thus corresponds to f near 1e-6, which is not a failure. **Neighbourhood Check** samples 2000 points at each of four radii. A share of zero at small radii shows a local minimum at that scale. A positive share at the largest radius suggests better basins nearby.

## How to Read the Status

The status varies by package. `Evolutionary.jl` gives "converged" or "iteration limit" in this code. `BlackBoxOptim.jl` and `NLopt.jl` give their own reasons, and hitting the evaluation limit is normal. `best_first_reached_at` in **Convergence Check** gives when the final best first appeared. A value of 1 means that the first evaluation already had the best value. `on_a_bound` calls for a wider box.

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [CMA-ES](cmaes.md) · [Decision Guide](decision-guide.md)
