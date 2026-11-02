# Assumptions

Dynamic programming gives a true optimum for the model as stated. What remains to judge is whether the state, the model and the grid describe the problem well.

## What the Markov State Assumes

The next state and the reward must depend only on the current state and action. If yesterday's demand predicts today's, then stock alone is not a sufficient state, and yesterday's demand has to join it. Demand here is drawn independently every period, so stock is enough. A good state keeps everything relevant, and it stays small. Full observation of the state is also assumed: the panel's bullets point to POMDP tools for hidden states.

## What a Known Model Assumes

Rewards and transition probabilities are treated as known exactly. Prices, costs and the demand distribution all come from the code, and the optimum holds for them alone. An error in the demand distribution gives a policy that is optimal for the wrong problem. [Bertsekas (2012)](#ref-Ber2012a) treats infinite-horizon methods under this assumption. Where the model must be learned from experience, reinforcement learning is the matching approach. Sensitivity runs, with other values in `demand` or `price`, show how much the policy relies on these numbers.

## What the Grid Assumes

Stock and orders are whole units, from a finite list. Here the grid is natural. A continuous problem has to be discretised first, and then the guarantee of optimality applies to the discretised problem only. The cost grows with the state space: value and transition tables have a size of S × A and S × A × S. With several kinds of stock, the state count multiplies, which is the curse of dimensionality. **States (S)** at 50 leaves ample room, as optimal stock stays at or below the order-up-to level.

## What Discounting Assumes

A discount γ below 1 gives finite values and a contraction, and it can stand for interest or for a constant risk that the process ends. It also shapes the answer, as a higher γ raises the weight of future profit, and the order-up-to level can rise with it. Values grow as 1 / (1 − γ), so that comparing them across discounts mixes profit and scale. The effective horizon is about 1 / (1 − γ) periods, or 20 at the default.

## What the Inventory Model Assumes

Several features are built into the code. There is no fixed order cost, and that is why a simple order-up-to rule applies. Orders arrive at once, with no lead time. Unmet demand is lost, and there is no shortage penalty beyond the lost margin. Leftovers do not spoil, and the top order is 10 units. Changing one of these can change the form of the policy, and the hand answers then no longer apply. For instance, a fixed cost generally gives a rule with two levels, which reorders only when stock falls low enough.

## References

<a id="ref-Ber2012a"></a>Bertsekas, D. P. (2012). *Dynamic Programming and Optimal Control, Vol. 2* (4th ed.). Athena Scientific.

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
