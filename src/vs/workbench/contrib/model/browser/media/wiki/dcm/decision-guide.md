# Decision Guide

Which method to choose depends on the shape of the front, the role of constraints and what the final set is for. A baseline run of NSGA-II is a sensible place to begin.

## Which Tab Fits the Problem

| Situation | Choice | Why |
|---|---|---|
| Smooth front, many objectives | **MOEA/D** | Scalar comparison, even coverage |
| Disconnected or irregular front | NSGA-II, or **Epsilon-Dominance Archive** | Weights can leave gaps |
| Constraints cut the front or block the path | **CCMO** | The helper crosses infeasible regions |
| Bounded set at a chosen resolution | **Epsilon-Dominance Archive** | Set size follows **Epsilon** |
| Two or three objectives, no hard constraints | NSGA-II | Simple and well known |

## When Many Objectives Change the Choice

With many objectives, nearly all solutions become mutually non-dominated, so dominance alone no longer drives the search. [Deb, Pratap, Agarwal and Meyarivan (2002)](#ref-DPAM2002a) developed NSGA-II for two or three objectives, and it weakens at higher counts. Decomposition and archive methods then do better. Hypervolume also gets costly as objectives increase. Consider first whether all the objectives are needed, as some may be strongly correlated, and could be dropped or merged.

## How to Choose Population and Iterations

Choose **Population** for the detail wanted on the front. Choose **Iterations** by watching **Budget Sensitivity**. The panel's typical range is 100 to 300 and 200 to 500, for small problems. More variables or objectives call for larger values. On **MOEA/D**, the count of weight vectors follows from a partition, so inspect the true number. Given a fixed number of evaluations, a smaller population with more generations favours convergence, and a larger one favours spread.

## Whether to Reformulate the Constraints

Before choosing a method, try to remove difficulty. Move simple limits into **Bounds**, as those are always respected. Solve an equality for one variable, if possible. Rescale constraints to comparable sizes, since a sum of violations mixes them. Check a suspect constraint by relaxing it, using **Constraint Relaxation**. Treat a soft limit as an objective, which gives a view of how much it costs. A cleaner formulation usually gains more than a change of method, so try this first.

## When to Use Another Kind of Method

For smooth, convex objectives, an exact method with epsilon constraints gives real optima, with duals, and it can use gradients. For expensive evaluations, a surrogate-based method, such as Bayesian optimisation, saves evaluations. With few objectives and a chosen preference, a single-objective solve is simpler. The panel's methods suit black-box objectives, moderate cost, and the need to see the whole trade-off. If a decision maker already has weights, there is no need for a whole front.

## What to Report from a Multi-Objective Study

Report the problem, with scaling of objectives, the algorithm, its base optimiser, the population, and the budget in evaluations. Use many seeds, with a mean and spread of the indicators. State the reference point for hypervolume and the reference set for IGD. Show a plot of a typical front, and the feasibility record. Say how a final solution would be chosen. A claim that one method wins needs several problems behind it, and should use the standards in [Coello Coello, Lamont and Van Veldhuizen (2007)](#ref-CLV2007a).

## References

<a id="ref-CLV2007a"></a>Coello Coello, C. A., Lamont, G. B. and Van Veldhuizen, D. A. (2007). *Evolutionary Algorithms for Solving Multi-Objective Problems*, 2nd ed. Springer.

<a id="ref-DPAM2002a"></a>Deb, K., Pratap, A., Agarwal, S. and Meyarivan, T. (2002). A fast and elitist multiobjective genetic algorithm: NSGA-II. *IEEE Transactions on Evolutionary Computation* 6(2), 182–197. [doi:10.1109/4235.996017](https://doi.org/10.1109/4235.996017)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [MOEA/D](moead.md) · [CCMO](ccmo.md)
