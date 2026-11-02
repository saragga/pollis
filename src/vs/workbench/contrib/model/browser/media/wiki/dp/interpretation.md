# Interpretation

The output is a value for each state and an order for each state. Reading them means separating the policy, which is the decision rule, from the value, which depends heavily on the discount.

## How to Read the Printed Result

`value_at_empty_stock` is the discounted profit, over an infinite horizon, of starting empty and acting optimally. It is not a profit per period: multiply it by 1 − γ to get an equivalent per-period figure. `order_at_empty_stock` is the first order. `order_up_to` lists the distinct stock levels after ordering, and one number means an order-up-to rule. `iterations` counts policy-improvement rounds, which is usually a small number.

## How to Read the Value Function

**Value Function** plots V*(s) against stock. A rising section means that stock is worth having, and its slope is the value of one more unit. At low stock, that slope equals the order cost of 2, since a unit on hand saves buying one. Farther up, the slope falls, as units wait longer and cost holding charges. A negative slope shows stock so high that an extra unit is a burden. Such a value is still valid for that state, even though the policy never leads there.

## How to Read the Optimal Policy

**Optimal Policy** shows the order per stock level as bars, and the stock after ordering as a line. An order-up-to rule looks like a falling staircase of orders down to zero at the level y, with a flat line at y up to there. Above y, orders are zero and the line rises with s. The theory behind this shape is discussed in [Bertsekas (2017)](#ref-Ber2017a). A break from the pattern suggests ties, a binding cap on orders or capacity, or a change in the code.

## How to Read the Marginal Value

**State Value** reports the value, the order, and the value of one more unit, at a stock level of 20. On **Deterministic** at the defaults, one more unit at 20 gives about −0.23, for its order saving of 2 comes 4 periods later, at a cost of holding it through those periods. A unit in hand is worth little there, or even less than nothing. Marginal values are useful as prices: they say how much one should pay for one more unit at a given stock.

## How to Read Discount Sensitivity

**Discount Sensitivity** plots V*(0) and the order-up-to level across six discounts. Values rise steeply with γ, mostly as a matter of scale, since they involve 1 / (1 − γ). A more useful reading compares per-period values, after multiplying by 1 − γ. The level is unchanged on **Deterministic**. On **Stochastic** it can rise with γ, because leftovers then cost less in lost time value, through the ratio in [Stochastic DP](stochastic.md). Discrete demand makes the level move in jumps.

## How to Read the Simulation

**Policy Simulation** shows stock and orders across **Horizon (T)** periods, with profit in the title. That profit is undiscounted, so it does not compare directly with V. The simulation is one sample path under one seed on **Stochastic**. Its use is to see the rule at work: stock resets to the level each period and falls by demand. On **Deterministic**, the path is exact, and it earns 30 per period from empty stock. Do not read one stochastic path as an estimate of value.

## References

<a id="ref-Ber2017a"></a>Bertsekas, D. P. (2017). *Dynamic Programming and Optimal Control, Vol. 1* (4th ed.). Athena Scientific.

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Deterministic DP](deterministic.md) · [Stochastic DP](stochastic.md)
