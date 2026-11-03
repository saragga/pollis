# Stochastic Search with Local Refinement: TikTak

**TikTak**, the multistart algorithm benchmarked by [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a), evaluates a Sobol sequence over the box, keeps the best points, and starts local searches from points that move ever closer to the best minimum found so far.

## Origin

[Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) describe TikTak as an algorithm developed by one of them, Guvenen, and refined with coauthors through applications to estimation and calibration problems in economics, medium- to large-scale structural estimation and calibration in particular. It belongs to the class of multistart algorithms, which run local searches from carefully selected points in the parameter space.

The algorithm starts with a broad exploration of the space and uses the information it accumulates to focus the search increasingly on the most promising region.

## Pre-testing

TikTak first evaluates f at N points of the Sobol sequence, quasi-random points designed to cover the parameter space as uniformly as possible. [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) write that the Sobol sequence has several desirable properties and is known to perform particularly well in high dimensions.

The N* points with the lowest values become the seed points, sorted so that f(s₁) ≤ … ≤ f(s_N*); the rest are discarded, as the space near them seems less promising. N is large and grows with the dimension of the problem, while N* is much smaller, for example one to ten percent of N.

## Local searches pulled towards the best

In the second phase, local searches run in turn from the seed points, each moved towards the best minimum found so far, Z*ⱼ:

s̃ⱼ₊₁ = (1 − θⱼ) sⱼ₊₁ + θⱼ Z*ⱼ

with a mixing weight θⱼ ∈ (0, 1]. Early on, θⱼ is small, to allow a broad search; as information accumulates, it grows, concentrating the local searches around the best local minima. In their implementation, [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) use θᵢ = min(max(0.1, (i/N*)^½), 0.995).

## In the panel

The panel calls `TikTak(N; keep_ratio = 0.1)` from MultistartOptimization.jl, whose documentation states that it implements TikTak as described by [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a), with defaults from their paper. N is a quarter of **Budget**, 500 by default, and the code keeps the best 10% as starting points. The local searches use **Local Optimiser** through `NLopt_local_method`, with a relative step tolerance of 10⁻⁶, and each is limited to an equal share of the remaining budget, one share for each kept point.

`multistart_minimization` returns the best location and value; when the best point is a Sobol point, there is no return code, and the panel reports `SUCCESS`.

## Deterministic

TikTak uses no random numbers: the Sobol sequence and the rule for the starting points are deterministic, as the panel's decision table states. **Seed Robustness** therefore returns the same result for all five seeds with TikTak, while MLSL and StoGO-R vary.

[Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) also point to an appealing feature: TikTak can be run in parallel easily, across CPUs and machines, without special software, with speed gains that can be close to linear in the number of cores in large problems. The panel calls `multistart_minimization` with `use_threads = false`.

## Results of the benchmark

[Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) benchmark two versions of TikTak, with Nelder-Mead or a derivative-free nonlinear least-squares algorithm in the local stage, against five NLopt global optimisers, including MLSL and StoGO. They find that TikTak with the least-squares local stage had the strongest performance on both the test functions and the economic application, in reliability and speed, followed by TikTak with Nelder-Mead.

The panel's decision table suggests **TikTak** for economic models estimated by minimising a loss, such as matching moments, where each local search is affordable. **Algorithm Properties** describes it as a heuristic, with the benchmark of [Arnoud, Guvenen and Kleineberg (2019)](#ref-AGK2019a) as its evidence.

## References

<a id="ref-AGK2019a"></a>Arnoud, A., Guvenen, F., & Kleineberg, T. (2019). *Benchmarking Global Optimizers*. NBER Working Paper 26340. National Bureau of Economic Research. [doi:10.3386/w26340](https://doi.org/10.3386/w26340)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [MLSL](mlsl.md) · [StoGO-R](stogo-r.md)
