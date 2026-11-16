# Filters, Funnels and Merit Functions

A Newton-type step is reliable near a solution and can be poor far from one. A **globalization strategy** decides whether a trial point is good enough to accept, so that the method converges from a distant start; a **globalization mechanism**, a trust region or a line search, shortens the step when it is not. Every strategy weighs two goals, a lower objective and a smaller constraint violation, and the strategies of the Mathematical Programming Lab differ in how they weigh them.

## Merit Function: One Number for Two Goals
A **merit function** adds the constraint violation, multiplied by a penalty parameter, to the objective, and accepts a trial point when it lowers that sum enough ([Nocedal and Wright (2006)](#ref-NW2006a)). It turns two goals into one, at the price of a parameter: too small, and the method can wander away from feasibility; too large, and it creeps along the constraints with short steps. In the Lab, the strategy is **Merit Function**.

## Fletcher's Filter: Two Goals Kept Apart
**Fletcher's filter** ([Fletcher and Leyffer (2002)](#ref-FL2002a)) does without the penalty parameter. It keeps a list of pairs, the objective and the constraint violation at earlier iterates, and accepts a trial point that no pair in the list beats in both goals at once, with a small margin. A step can thus be accepted for what it does to the objective or for what it does to feasibility. In the Lab, the strategy is **Fletcher's Filter**, used with a trust region by the Filter SQP and Filter SLP tabs.

## Wächter's Filter: The Filter of a Line Search
**Wächter's filter** ([Wächter and Biegler (2006)](#ref-WB2006a)) adapts the filter to a line search: along the step direction, a trial point must improve the objective or the constraint violation enough compared with the filter, and close to feasibility it must reduce the objective by a sufficient amount, as in an Armijo condition. It is the strategy of Ipopt, and of the Interior Point tab, Uno's ipopt preset, as **Wächter's Filter**.

## Funnel: One Shrinking Bound on the Infeasibility
A **funnel** ([Kiessling, Leyffer and Vanaret (2025)](#ref-KLV2025a)) replaces the list of pairs by one number: an upper bound on the constraint violation, which is decreased monotonically and controls the feasibility of the iterates. A trial point must stay inside the funnel, and the funnel narrows as the iterates progress. When a quadratic subproblem has no feasible point, a feasibility restoration phase looks for a less infeasible point first. The funnel works with a trust region or a line search; in the Lab, the strategy is **Funnel**, used by the Funnel SQP tab.

## Trust Region and Line Search
A **trust region** bounds the length of the step before it is computed: the subproblem is solved within a radius, which grows after a good step and shrinks after a rejected one. A **line search** computes the step first and then backtracks along it until the strategy accepts a point ([Nocedal and Wright (2006)](#ref-NW2006a)). In the Lab, the **Globalization Mechanism** chooses between them; Uno has no trust-region interior-point method, so the Interior Point tab works with a line search only.

## References

<a id="ref-FL2002a"></a>Fletcher, R. and Leyffer, S. (2002). Nonlinear Programming without a Penalty Function. *Mathematical Programming* 91(2), 239–269. [doi:10.1007/s101070100244](https://doi.org/10.1007/s101070100244)

<a id="ref-KLV2025a"></a>Kiessling, D., Leyffer, S. and Vanaret, C. (2025). A Unified Funnel Restoration SQP Algorithm. *Mathematical Programming* 217(1-2), 323–367. [doi:10.1007/s10107-025-02284-3](https://doi.org/10.1007/s10107-025-02284-3)

<a id="ref-NW2006a"></a>Nocedal, J. and Wright, S. J. (2006). *Numerical Optimization*. Springer (2nd ed.). [doi:10.1007/978-0-387-40065-5](https://doi.org/10.1007/978-0-387-40065-5)

<a id="ref-WB2006a"></a>Wächter, A. and Biegler, L. T. (2006). On the Implementation of an Interior-Point Filter Line-Search Algorithm for Large-Scale Nonlinear Programming. *Mathematical Programming* 106(1), 25–57. [doi:10.1007/s10107-004-0559-y](https://doi.org/10.1007/s10107-004-0559-y)

## See Also
- [The Ingredients of a Solver](ingredients.md) · [Reading the Comparison](comparison.md) · [Overview](overview.md)
