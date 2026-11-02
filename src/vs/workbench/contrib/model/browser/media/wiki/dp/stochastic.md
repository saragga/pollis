# Stochastic DP

With random demand, the decision comes first and the outcome second, so the Bellman equation averages over what may follow. The default problem still has a hand solution, through a classic inventory rule.

## How Randomness Enters the Equation

An action now gives a distribution over next states, and the value averages over it:

- V(s) = max over a of Σ over d of P(d) { r(s, a, d) + γ V(next state) }

The answer remains a policy for each state, and not a fixed plan of orders, because later decisions can react to what demand turns out to be. **Stochastic** uses the same solver as **Deterministic**, as only `demand` and `prob` differ. The framework of discounted problems of this kind is set out in [Puterman (2005)](#ref-Put2005a).

## How the Scenarios Are Built

**Demand Scenarios (N)** spreads N equally likely values from 0 to 10, rounded to integers. The mean stays at 5:

| N | Demand values |
|---|---|
| 1 | 5 |
| 2 | 0, 10 |
| 3 | 0, 5, 10 |
| 5 | 0, 2, 5, 8, 10 |
| 10 | 0, 1, 2, 3, 4, 6, 7, 8, 9, 10 |

With N = 10, a demand of exactly 5 never occurs. At N above 11, rounding produces repeated values, which the code adds together correctly.

## Which Order-Up-To Level Is Best

An inventory problem with no fixed order cost has an order-up-to policy, in the tradition of [Arrow, Harris and Marschak (1951)](#ref-AHM1951a). One more unit costs c now. If it sells, it brings p. If not, it costs h to hold and saves γc next period. Raising the level y pays while the chance F(y) that demand is at most y stays below:

- critical ratio = (p − c) / (p − γc + h)

With p = 8, c = 2, h = 0.5 and γ = 0.95, the ratio is 6 / 6.6, about 0.909. At N = 10, F(9) = 0.9 and F(10) = 1, so the level is 10.

## Why One Period Is Enough to Solve It

Leftover stock never passes the level y, so the next period can always restore y. The one-step comparison then holds in every period, and the policy is myopic. [Veinott (1965)](#ref-Vei1965a) gives conditions under which a myopic rule is optimal in such inventory problems. Under the rule, y = 10 at N = 10 gives V(s) = 540 + 2s for s up to 10, from the equation:

- V(s) = 8 × 5 − 0.5 × 5 − 2 (10 − s) + γ E[V(10 − D)]

With sales and leftovers both averaging 5, that reduces to A = 17.5 + γ (A + 10), for V(s) = A + 2s, so that A = 27 / 0.05 = 540.

## How Much the Uncertainty Costs

At the defaults, `value_at_empty_stock` falls from 600 on **Deterministic** to 540 on **Stochastic**, or 3 per period before discounting. That gap is not due to lost sales, as a level of 10 covers all demand, but to holding an average of 5 leftovers at 0.5 each and to paying for them one period earlier. Cover could be reduced at the price of lost sales. Note that a mean-demand plan would misjudge this problem, and the gap measures by how much.

## How to Read Scenario Resolution

**Scenario Resolution** solves N of 1, 2, 3, 5, 10, 20 and 50. The curve may not fall smoothly. For N of 2 to 10, the top value 10 has a probability above 1 − 0.909, so the level is 10, and then V(0) depends only on mean demand: all four give 540. With N of 20 or 50, the chance of the top value is small enough for y to drop to 9, and the value rises a little above 540. The flat stretch is correct, not a failure of the action.

## Which Rule the Last Periods Follow

A finite horizon gives each period its own policy. In the final period, a leftover has no later use, so the ratio becomes (p − c) / (p + h) = 6 / 8.5, about 0.706, and at N = 10 the level is 8, since F(7) = 0.7 and F(8) = 0.8. As the end recedes, the level rises to the stationary one. **Horizon Sensitivity** reports only the value, but `backward_induction` also returns the policy per period. [Bertsekas (2017)](#ref-Ber2017a) covers finite-horizon inventory rules in detail.

## References

<a id="ref-AHM1951a"></a>Arrow, K. J., Harris, T. and Marschak, J. (1951). Optimal inventory policy. *Econometrica* 19(3), 250–272. [doi:10.2307/1906813](https://doi.org/10.2307/1906813)

<a id="ref-Ber2017a"></a>Bertsekas, D. P. (2017). *Dynamic Programming and Optimal Control, Vol. 1* (4th ed.). Athena Scientific.

<a id="ref-Put2005a"></a>Puterman, M. L. (2005). *Markov Decision Processes: Discrete Stochastic Dynamic Programming* (2nd ed.). Wiley. [doi:10.1002/9780470316887](https://doi.org/10.1002/9780470316887)

<a id="ref-Vei1965a"></a>Veinott, A. F. (1965). Optimal policy for a multi-product, dynamic, nonstationary inventory problem. *Management Science* 12(3), 206–222. [doi:10.1287/mnsc.12.3.206](https://doi.org/10.1287/mnsc.12.3.206)

## See Also

- [Factsheet](factsheet.md) · [Deterministic DP](deterministic.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
