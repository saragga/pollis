# Single-Agent Decision Processes: Interpretation

The results are values and actions, and each has a precise meaning: a value is a discounted total, an action is the best choice given everything that may follow. Reading them correctly means keeping the discount, the start and the units of reward in mind.

## What a value means

V(s) is the expected sum of discounted rewards from state s under the policy, in the units of the reward. It is not a reward per period, nor is it a profit in any single episode.

Multiplying V by (1 − gamma) gives a rough equivalent per period, which is easier to compare across discounts. Differences between states are often more useful than the levels. `value_when_full` less `value_when_empty` on **MDP** is the worth of a full warehouse, the most you should pay to start with one. The same reading gives the worth of a new machine on **Semi-MDP**, from `value_when_new` and `value_when_failed`.

## Reading the Q-values

**Alpha Vectors / Q-Values** on **MDP** and **Semi-MDP** shows Q(s, a), the value of taking action a in state s and then acting optimally.

| Pattern | Reading |
|---|---|
| A clear best action in a row | The decision matters in that state |
| Several near-equal entries in a row | Those actions are interchangeable |
| A column low in every row | That action is never attractive |
| The best action shifts down the rows | A threshold in the policy |

The gap between the best and the second-best action is the cost of a mistake in that state. A large gap warrants care in execution, and a small gap means that a planner's disagreement has little practical weight. On **MDP** the matrix is `policy.qmat`.

## What the inventory policy says

`order_by_stock` lists the best order at each stock level, and **Policy Map** shows the same thing as bars.

A common pattern is to order up to some target level, so the order falls one for one as stock rises, until it reaches zero. **Largest Order (A)** can cap the order at low stock, which you can see as a flat stretch. That target reflects the balance between the margin on a sale and the cost of holding a unit, and raising **Mean Demand** or the price moves it upwards. Single-product inventory is a standard example in [Puterman (2005)](#ref-Put2005a), and it is a useful comparison for the shape you see.

## How to read alpha vectors

On **POMDP** the value at a belief is the highest of a set of lines: V(b) = max over alpha of alpha · b. [Smallwood and Sondik (1973)](#ref-SS1973a) established this piecewise-linear convex form, which is what makes point-based methods possible.

Each line in **Alpha Vectors / Q-Values** belongs to one action. At each belief, the top line gives both the value and the action, so where two lines cross is where the policy changes. With `QMDP` there is one line per action, so at most three pieces appear. An exact solution has more lines, each representing a plan of several steps. The curve in **Value Function** is QMDP's own value, which lies at or above the true optimum.

## What the belief thresholds mean

**Policy Map** on **POMDP** shows a middle band of listening between two bands of opening a door, and `action_when_90pct_left` tests one point in it.

The band's edges are the beliefs at which opening a door becomes worth the risk. A cost of −100 against a gain of +10 makes the agent demand high confidence, and the discount makes waiting less attractive. Raising **Listening Accuracy** does not simply widen or narrow the band in terms of beliefs, but each report moves the belief further, so fewer reports are needed. In **Solver vs Baseline**, `actions` shows whether QMDP and SARSOP place these edges at the same beliefs.

## What the comparison with a baseline shows

**Solver vs Baseline** on **MDP** compares with a myopic rule, the best immediate reward only. On **Semi-MDP** it compares with running until failure and then replacing.

| Output | Reading |
|---|---|
| `optimal` | Mean discounted return of the solved policy |
| `myopic`, `run_to_failure` | The same for the simple rule |
| Their difference | What long-run planning is worth on this problem |

A small difference is a useful finding too, since a simple rule that is nearly optimal may be preferable in practice. On **POMDP**, `value_at_uniform` holds the solvers' own value estimates at the uniform belief, and `simulated_return` their measured performance. Read the second as the comparison of what each one achieves.

## What the semi-Markov comparison shows

**Global vs Online Planning** on **Semi-MDP** solves the problem again with gamma for every action, ignoring how long actions last, and simulates both policies under the true durations.

`semi_markov_policy` should be at or above `constant_discount_policy`, up to noise. `policies_differ_at` lists the conditions where the decisions change. With a constant discount, long actions look cheap in time, so the naive policy may favour `replace` or `maintain` differently. The size of the gap measures the cost of treating all actions as taking one period, which is the question that the semi-Markov model exists to answer.

## Reading the reward rate

**Online Planning / Reward Rate** on **Semi-MDP** simulates 20,000 periods and gives `reward_per_period` and `share_of_decisions`.

`reward_per_period` is undiscounted, so it can favour a different ranking from the discounted values when gamma is small. `share_of_decisions` counts decisions and not time. A `replace` takes four periods, so its share of time is larger than its share of decisions. To get the fraction of time in each action, weight each share by its `tau`. This comparison of long-run rate and discounted value is treated at length by [Puterman (2005)](#ref-Put2005a).

## References

<a id="ref-Put2005a"></a>Puterman, M. L. (2005). *Markov Decision Processes: Discrete Stochastic Dynamic Programming* (2nd ed.). Wiley. [doi:10.1002/9780470316887](https://doi.org/10.1002/9780470316887)

<a id="ref-SS1973a"></a>Smallwood, R. D., & Sondik, E. J. (1973). The Optimal Control of Partially Observable Markov Processes over a Finite Horizon. *Operations Research* 21(5), 1071-1088. [doi:10.1287/opre.21.5.1071](https://doi.org/10.1287/opre.21.5.1071)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [MDP](mdp.md) · [POMDP](pomdp.md) · [Semi-MDP](smdp.md)
