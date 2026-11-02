# CCMO

CCMO evolves two populations at once. One solves the constrained problem, and the other ignores the constraints, which lets it cross infeasible regions and bring useful material to the first.

## Why Constraints Make the Search Hard

Common feasibility rules, from [Deb (2000)](#ref-Deb2000a), prefer any feasible solution over any infeasible one, then compare by objectives or by violation. That rule is simple and needs no tuning. It can also trap the search: feasible regions separated by an infeasible gap are hard to cross, as any step into the gap loses. The result may be a small piece of the front. Narrow feasible regions and disconnected feasible fronts are the typical hard cases, as stated in the panel's table.

## How the Two Populations Cooperate

[Tian, Zhang, Xiao, Zhang and Jin (2021)](#ref-TZXZJ2021a) describe a framework of weak cooperation:

- The main population solves the constrained problem.
- The helper solves the same problem without its constraints.
- Each generation, each population makes offspring from its own members.
- Each population then selects from itself and from both sets of offspring.

Only offspring pass between the two, so each keeps its own goal. The helper's good solutions can land on the far side of an infeasible gap, and the main population picks up any that are feasible.

## How the Code Sets It Up

`CCMO(NSGA2(N=N); options=...)` uses NSGA-II as the base optimiser for both populations, with **Population** as N. Other base algorithms are possible in the framework, and the name of a base algorithm should be reported with any result. `f(x)` returns objectives and constraints, and the helper ignores the constraint part. `nondominated(r)` then reads the final population. Each generation evaluates offspring for two populations, so a comparison by iterations can favour the method, and comparison by evaluations is fairer.

## When a Helper Helps Most

The helper is useful when the unconstrained front lies close to, or partly overlaps, the constrained one, since material flows from one to the other. If the unconstrained optimum is far away, the helper heads off in another direction, and its offspring become mostly waste. Constraints that barely bite also leave the helper with little to add, and the extra cost goes for nothing. The default CONSTR problem has a front partly shaped by constraints, but it is easy for most methods. Harder cases show greater contrast.

## How Equality Constraints Are Handled

**Equality Constraints** are usually met only up to a tolerance, which the solver turns into a violation. Random search rarely lands on an equality surface, so that feasible solutions can be very rare. The helper does not help with that directly, as it ignores the constraint, although it can bring parents close to the surface. If an equality can be solved for one variable, substituting it into the objectives removes it from the problem, and that is usually far better. **Constraint Check** then shows if feasibility has improved.

## Where CCMO Is Strong and Weak

CCMO needs few settings beyond those of its base optimiser, and it adds little complexity. Its strength lies in fronts cut by constraints. Its costs are the doubled evaluations and a dependence on how far the two fronts are from each other. Evaluation-heavy problems feel that cost most. Newer designs let the two populations cooperate more closely, or switch stages. For a general picture of evolutionary constraint handling, see [Coello Coello, Lamont and Van Veldhuizen (2007)](#ref-CLV2007a). Test on the problem in hand, as no one design wins everywhere.

## References

<a id="ref-CLV2007a"></a>Coello Coello, C. A., Lamont, G. B. and Van Veldhuizen, D. A. (2007). *Evolutionary Algorithms for Solving Multi-Objective Problems*, 2nd ed. Springer.

<a id="ref-Deb2000a"></a>Deb, K. (2000). An efficient constraint handling method for genetic algorithms. *Computer Methods in Applied Mechanics and Engineering* 186(2–4), 311–338. [doi:10.1016/S0045-7825(99)00389-8](https://doi.org/10.1016/S0045-7825(99)00389-8)

<a id="ref-TZXZJ2021a"></a>Tian, Y., Zhang, T., Xiao, J., Zhang, X. and Jin, Y. (2021). A coevolutionary framework for constrained multiobjective optimization problems. *IEEE Transactions on Evolutionary Computation* 25(1), 102–116. [doi:10.1109/TEVC.2020.3004012](https://doi.org/10.1109/TEVC.2020.3004012)

## See Also

- [Factsheet](factsheet.md) · [MOEA/D](moead.md) · [Borg MOEA](borg.md) · [Decision Guide](decision-guide.md)
