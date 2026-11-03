# Pareto-Based Multi-Objective Optimisation: Interpretation

How to read the outputs: the front and the Pareto set, the ideal and nadir points, the hypervolume and the other indicators, trade-off rates, and the compromise point.

## The front and the Pareto set

**Pareto Front Plot** shows the non-dominated objective vectors: the first two objectives, or the first three in 3D. No other point found dominates any of them. **Decision Space** shows the same solutions in decision space, the Pareto set, coloured by f₁, and prints five solutions spread along the front, each with its decision variables and objective values.

The front is an approximation: [Emmerich and Deutz (2024)](#ref-ED2024a) define an approximation set of the Pareto front as a finite set of mutually non-dominated points, and the true front may lie beyond it.

## Ideal and nadir points

[Emmerich and Deutz (2024)](#ref-ED2024a) define the ideal point as the vector of the smallest value of each objective, and the nadir point as the vector of the largest value of each objective over the Pareto front. The panel computes both on the front it found, with `ideal` and `nadir` from Metaheuristics.jl.

Together, the two points span the range of the trade-off. They also set the reference point of the hypervolume, 10% beyond the nadir, and the scaling of **Compromise Point**.

## The hypervolume

The hypervolume is the size of the region of objective space that the front dominates, up to the reference point. The Metaheuristics.jl documentation describes it as an indicator of the convergence and the diversity of the front at the same time.

[Emmerich and Deutz (2024)](#ref-ED2024a) recall properties that make the indicator meaningful for comparisons: if A is better than B in the sense of weak dominance of sets, A has the larger hypervolume, and a larger hypervolume of A rules out that B is better than A. A value depends on the reference point, so hypervolumes are compared at a common one, as **Compare Algorithms** does.

## Spacing and IGD

The spacing of **Front Statistics** and **Compare Algorithms** measures how evenly the points are spread; its documentation states that 0 means uniformly distributed. **Compare Algorithms** prints it for all four fronts, next to their hypervolumes.

**IGD Comparison** computes the inverted generational distance of each algorithm's front to a reference front, the non-dominated points of the union of all four fronts; as its description says, lower is closer and better spread. The reference front is the best found by the four algorithms together, not the true front. [Emmerich and Deutz (2024)](#ref-ED2024a) note that some indicators are useful when there is knowledge of the Pareto front, which the joint front stands in for.

## Trade-off rates

**Trade-Off Rates** sorts a two-objective front by f₁ and computes, between neighbouring points, −Δf₂/Δf₁: how much f₂ worsens per unit improvement in f₁, the marginal rate of substitution of the description. The rate is plotted on a log scale against f₁.

[Emmerich and Deutz (2024)](#ref-ED2024a) discuss the slope of the Pareto front in the bi-criterion case: properly Pareto optimal points are those where the slope, f₂ as a function of f₁, is finite and nonzero, and the bound on it is interpreted as a trade-off. A high rate marks a part of the front where a small gain in f₁ costs much in f₂.

## The compromise point

**Compromise Point** scales each objective to [0, 1] between the ideal and nadir points and returns the solution closest to the ideal point in Euclidean distance, with its decision variables, objective values and scaled distance. As its description says, the result is a natural default when no preference is given.

[Emmerich and Deutz (2024)](#ref-ED2024a) describe the related method of distance to a reference point: the ideal or utopia point is specified, and the solution as close as possible to it, in a weighted distance that can normalise the objectives, is chosen. Their figures show that the weighted Euclidean and the Manhattan distance can single out different optimal points.

## References

<a id="ref-ED2024a"></a>Emmerich, M., & Deutz, A. (2024). Multicriteria Optimization and Decision Making: Principles, Algorithms and Case Studies. [doi:10.48550/arXiv.2407.00359](https://doi.org/10.48550/arXiv.2407.00359)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [NSGA-II](nsga2.md) · [NSGA-III](nsga3.md) · [SPEA2](spea2.md) · [SMS-EMOA](sms.md)
