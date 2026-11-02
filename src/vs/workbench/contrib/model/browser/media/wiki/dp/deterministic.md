# Deterministic DP

With known demand, every action leads to one next state, so the program is a search for the best path through the stock levels. The default problem can be solved by hand, which gives a firm check on the panel.

## What the Problem Reduces To

Without randomness, the expectation disappears from the Bellman equation:

- V(s) = max over a of { r(s, a) + γ V(next state) }

Any finite deterministic program of this form is a longest or shortest path problem on a graph, whose nodes are states and whose edges are actions, as [Bertsekas (2017)](#ref-Ber2017a) explains. The solver returns the best action from all 50 stock levels at once, whether or not a path ever reaches them.

## What the Answer Is by Hand

Demand is 5, with price 8, order cost 2 and holding cost 0.5. Ordering exactly what demand takes earns 8 × 5 − 2 × 5 = 30 each period. Leftovers would add cost and bring no sale. So from empty stock, the policy orders 5 units every period, and the stock returns to zero.

- V(0) = 30 / (1 − γ)

At γ = 0.95, that gives V(0) = 600, with `order_at_empty_stock` of 5 and `order_up_to` of 5. **Policy Simulation** should show 30 per period, so a total of 300 over 10 periods.

## Why the Order-Up-To Level Ignores the Discount

Consider ordering one unit more than demand takes. It costs 2 now, plus 0.5 to hold, and it saves an order of 2 next period, worth 2γ today. The net effect is 2γ − 2.5, which is negative for all γ below 1. Thus the extra unit never pays, and the level stays at 5. On this tab, **Discount Sensitivity** should therefore show a flat right-hand plot. Its left-hand plot gives 30 / (1 − γ), from 60 at γ = 0.5 to 3000 at γ = 0.99.

## What the Value Function Looks Like

Above zero, a unit of stock has a value, which comes from the order that it replaces.

| Stock s | V(s) at γ = 0.95 |
|---|---|
| 0 | 600 |
| 1 | 602 |
| 5 | 610 |
| 6 | 611.4 |
| 10 | 617 |
| 20 | 622.59 |

Up to s = 5, each unit saves an order of 2 this period. The sixth unit gives 2γ − 0.5 = 1.4, as it waits one period. Later units wait longer, so that their gain shrinks, and it eventually turns negative. Stock high above 5 is never optimal to create, but the solver values it anyway.

## How the Horizon Changes the Value

With h periods left and nothing valued after them, the same order of 5 each period gives:

- V(0) with h periods = 30 (1 − γ^h) / (1 − γ)

At γ = 0.95, that is 30 at h = 1, about 241 at h = 10 and about 596 at h = 100, with a gap to 600 of 600 γ^h. **Horizon Sensitivity** should trace those values. The policy from empty stock does not change across periods here, since no period ever wants leftovers.

## What Changes in a Real Deterministic Problem

Demand that changes over time needs time as part of the state, or a backward pass over a finite horizon. A fixed cost per order creates a trade-off between ordering often and holding stock, in which the policy batches orders, and the hand answer no longer applies. Stock limits matter if capacity sits below demand. To try any of these, edit `demand`, `build` and the prices in the code. The solver needs no change, which is a main attraction of the method.

## References

<a id="ref-Ber2017a"></a>Bertsekas, D. P. (2017). *Dynamic Programming and Optimal Control, Vol. 1* (4th ed.). Athena Scientific.

## See Also

- [Factsheet](factsheet.md) · [Stochastic DP](stochastic.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
