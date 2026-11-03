# Stochastic Programming: Interpretation

The outputs of the panel are an optimal first decision, an expected cost, the distribution of the cost across scenarios, and measures of the value of information and of the stochastic solution.

## The first order and the expected cost

The main output is the order placed before any demand is seen, `x0` in the extensive form and the stage-1 `ordered` in SDDP, and the expected total cost. Costs are order cost minus sales revenue plus holding cost, so a negative expected cost is an expected profit; the **Two-Stage** tab prints both.

Later orders are not single numbers: in the **Multistage** tab there is one order per node of the tree, and in the **SDDP** tab the order of each stage is a function of the stock on hand and the observed demand, the decision rule of the SDDP.jl documentation. **Stage Plan** prints the mean order, sales and stock of every period.

## Wait-and-See, EVPI and VSS

**Wait-and-See** prints three costs. RP is the optimal expected cost of the recourse problem. WS, the wait-and-see cost, assumes perfect information: every period's demand is ordered exactly, so the code computes it as (c − p) · T · mean(demand). EEV is the expected cost of the first order of the deterministic problem with the mean demand, used under the real uncertainty.

The action description defines EVPI = RP − WS, the expected value of perfect information, and VSS = EEV − RP, the value of the stochastic solution. For **SDDP**, the action uses the simulated cost and the lower bound in place of RP and prints EVPI only.

## The critical fractile

**Critical Fractile** compares the order-up-to levels of the optimal policy, the stock after ordering in each period, with two quantiles of the sampled demand. The action description gives the fractile (p − c)/(p + h) when leftovers are wasted, in the last period, and (p − c)/(p − c + h) when they carry over.

With p = 5, c = 2 and h = 0.5, the fractiles are 3/5.5, about 0.55, and 3/3.5, about 0.86. In the **Two-Stage** tab, the single period is the last, so its order is compared with the first of the two quantiles; in the other tabs, the last period is compared with the first and the earlier periods with the second.

## The cost distribution

**Cost Distribution** draws the total cost of every root-to-leaf path of the tree, S for **Two-Stage** and S^T for **Multistage**, or of 500 SDDP simulations, with the mean as a vertical line. All paths of the tree have the same probability, 1/S^T, and the 500 simulations of SDDP are drawn with the in-sample probabilities of the noise.

**Decision Paths** shows the decisions behind the costs: for **Two-Stage**, the sales and leftover stock against demand with the order as a line; for the other tabs, the orders and stock along 30 paths.

## The value of initial stock

**Value of Initial Stock** re-solves the problem with initial stock from 0 to 150 in steps of 10 and plots the expected cost and its negative difference per unit, the value of one more unit on hand. For **SDDP**, it evaluates `SDDP.ValueFunction` at the first node.

The SDDP.jl documentation explains the link: the dual variable of the constraint that fixes the incoming state measures the change in the objective when the state increases by one unit, a subgradient of the value function, which is convex in the state.

## Extensive Form vs SDDP

**Extensive Form vs SDDP** solves the same problem both ways and prints the optimal cost of the extensive form, the lower bound of SDDP, the first order and the run time of each. The extensive form is solved when S^T ≤ 20 000; SDDP is trained for 100 iterations, and its lower bound is `SDDP.calculate_bound`. Each row leaves the other column at NaN.

The input tooltip of **Periods (T)** notes that the extensive form grows as S^T while SDDP grows only linearly in T. The theory tutorial of SDDP.jl adds that the random variable at which an SDDP policy is evaluated can be out-of-sample, unlike in progressive hedging or the deterministic equivalent.

## References

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Two-Stage SP](two-stage.md) · [Multistage SP](multistage.md) · [SDDP](sddp.md)
