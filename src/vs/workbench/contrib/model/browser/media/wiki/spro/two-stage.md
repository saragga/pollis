# Stochastic Programming: Two-Stage SP

The **Two-Stage** tab solves the newsvendor problem: one order before demand is known, then sales once it is revealed, written as one linear program over S equally likely demand scenarios.

## The model

With order x₀ in the first stage, and sales y_k and leftover stock s_k in scenario k with demand d_k, the extensive form is

minimise c x₀ + (1/S) Σₖ (h s_k − p y_k)
subject to y_k ≤ d_k, s_k = x₀ − y_k, x₀, y_k, s_k ≥ 0,

with p = 5, c = 2 and h = 0.5. The constraint s_k = x₀ − y_k with s_k ≥ 0 limits sales to the units ordered. In the code, T = 1, and the order variable of the last period is fixed at 0, so nothing is reordered after the demand.

## First stage and recourse

[Dantzig (1955)](#ref-Dan1955a) divides activities into stages: the first-stage quantities are the only ones to be determined, and the later ones depend on the earlier stages and on the random demands. In the tab, x₀ is the first-stage decision and y_k, s_k are the recourse in scenario k.

The JuMP documentation formulates a similar two-stage newsvendor, with pies made in the morning before demand is known and unsold pies discarded at a cost, and builds the second-stage variables indexed over all scenarios into a single linear program.

## Sample average approximation

`sample_demand(S)` draws S values from Uniform(50, 150) with seed 1, each with probability 1/S. The JuMP documentation explains that with a continuous distribution the problem has infinitely many variables and constraints, and that using a finite set of samples instead is called sample average approximation.

**Scenario Count Study** re-solves with 5 to 500 values, **Bound Gap** compares ten independent sampled optima with the cost of the chosen order on 2 000 fresh demands, and **Out-of-Sample** draws the cost distribution of the order on 5 000 fresh demands.

## The critical fractile

The description of **Critical Fractile** gives the newsvendor fractile (p − c)/(p + h) when leftovers are wasted, as in the single period of the tab. The action prints the corresponding quantile of the sampled demand beside the optimal order.

With the panel's prices, the fractile is 3/5.5, about 0.545, and `quantile(demand, 0.545)` is the matching demand value of the sample. **Decision Paths** draws the sales and the leftover stock against demand, with the order as a horizontal line: in every scenario, sales are limited by both the demand and the order.

## Value of information and of the solution

**Wait-and-See** computes:

| Quantity | Meaning in the action | Code |
|---|---|---|
| WS | Perfect information: the demand is ordered exactly | (c − p) · mean(demand) |
| RP | Expected cost of the recourse problem | `sol.obj` |
| EEV | Expected cost of the mean-demand order under uncertainty | `solve_ef(; root = ev.x0).obj` |
| EVPI | RP − WS | |
| VSS | EEV − RP | |

The decision table names EVPI and VSS as outputs of the tab.

## The tab in Julia

```
m = Model(HiGHS.Optimizer)
@variable(m, x0 >= 0)
@constraint(m, y[t][k] <= dem[mod1(k, S)])
@constraint(m, s[t][k] == inflow - y[t][k])
```

The model is built with JuMP, presented by [Dunning, Huchette and Lubin (2017)](#ref-DHL2017a), and solved with HiGHS. The same function `solve_ef` serves the **Multistage** tab, with T > 1; its keyword `root` fixes the first order, which **Bound Gap**, **Out-of-Sample** and **Wait-and-See** use to evaluate a given order.

## References

<a id="ref-Dan1955a"></a>Dantzig, G. B. (1955). Linear Programming under Uncertainty. *Management Science* 1(3-4), 197-206. [doi:10.1287/mnsc.1.3-4.197](https://doi.org/10.1287/mnsc.1.3-4.197)

<a id="ref-DHL2017a"></a>Dunning, I., Huchette, J., & Lubin, M. (2017). JuMP: A Modeling Language for Mathematical Optimization. *SIAM Review* 59(2), 295-320. [doi:10.1137/15M1020575](https://doi.org/10.1137/15M1020575)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Multistage SP](multistage.md) · [SDDP](sddp.md)
