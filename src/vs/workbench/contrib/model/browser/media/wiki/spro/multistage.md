# Stochastic Programming: Multistage SP

The **Multistage** tab extends the inventory problem to **Periods (T)** periods. Orders and demands alternate, and the problem is solved exactly as one extensive-form linear program on a scenario tree with S branches per period.

## The scenario tree

Node k of period t has the parent div(k − 1, S) + 1 in period t − 1 and the demand dem[mod1(k, S)], so every node has S children, one for each sampled demand value. Period t has S^t nodes, and the tree has S^T root-to-leaf paths, each with probability 1/S^T.

With the defaults, S = 20 and T = 3, the tree has 20 + 400 + 8 000 nodes and 8 000 paths. The tooltip of **Scenarios per Stage (S)** advises keeping S^T under about 20 000.

## Decisions on the tree

At the root, the order x₀ is placed before any demand is seen. At each node of period t, the demand of that node is observed, sales y are at most that demand, the stock after sales s is the inflow minus the sales, and a new order x is placed for the next period; the inflow is the stock and the order of the parent node.

The orders of the last period are fixed at 0, since nothing is ordered after the last demand. The objective sums, over the periods, the order cost, the holding cost and minus the revenue of every node, weighted by its probability 1/S^t.

## Non-anticipativity

The decision table describes the tab as decisions and observations that alternate over several periods, where each decision may use only what has been observed. Writing one order per node enforces that condition: the paths that share a node share its history of demands and its decision.

[Rockafellar and Wets (1991)](#ref-RW1991a) describe the alternative of working with whole scenarios, bundled at various levels to reflect the availability of information, with iterative adjustments to the decision policy that remove the dependence on hindsight.

## Size of the extensive form

The model has three variables, order, sales and stock, for each of the S + S² + … + S^T nodes, and two constraints per node. The tooltip of **Periods (T)** states that the multistage extensive form grows as S^T, and **Extensive Form vs SDDP** solves it only when S^T ≤ 20 000.

**Scenario Count Study** keeps n^T ≤ 20 000 among the counts 2, 3, 5, 8, 12 and 20.

## Evaluating the first order

**Bound Gap**, **Out-of-Sample** and **Wait-and-See** fix the first order with the keyword `root` and re-solve the rest of the tree. **Out-of-Sample** uses a fresh tree with S demand values per period drawn with seed 99; the later orders are re-optimised on that tree.

**Wait-and-See** computes WS = (c − p) · T · mean(demand), the cost when every period's demand is known before ordering, and EEV, the cost of the first order of the mean-demand problem; the mean-demand problem has one scenario per period.

## Reading the plan

**Stage Plan** prints, for each period from 0 to T, the mean order, sales and stock over the nodes of that period. **Decision Paths** draws the orders and the stock along 30 randomly chosen paths, seed 3.

**Critical Fractile** compares the mean stock after ordering in each period, the order-up-to level, with the fractiles (p − c)/(p − c + h) for periods whose leftovers carry over and (p − c)/(p + h) for the last period, as the action description gives them.

## References

<a id="ref-RW1991a"></a>Rockafellar, R. T., & Wets, R. J-B. (1991). Scenarios and Policy Aggregation in Optimization Under Uncertainty. *Mathematics of Operations Research* 16(1), 119-147. [doi:10.1287/moor.16.1.119](https://doi.org/10.1287/moor.16.1.119)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Two-Stage SP](two-stage.md) · [SDDP](sddp.md)
