# MDP

A Markov decision process has a visible state and one decision per period. **MDP** states an inventory problem through `POMDPs.jl` and solves it by value iteration, so every value and every decision can be read from a table.

## The default inventory problem

Each period starts with s units in stock. The manager orders a units, up to **Largest Order (A)**, stock becomes y = min(s + a, S), and Poisson demand d with **Mean Demand** takes place.

| Element | In the code |
|---|---|
| State | Stock, 0 to **States (S)** |
| Action | Order, 0 to **Largest Order (A)** |
| Next state | max(y − d, 0), with demand from S upwards lumped together |
| Reward | `price` × expected sales − `order_cost` × a − `holding_cost` × y |
| Start | An empty warehouse |

The reward is the expected value over demand, so it is a function of s and a. Single-product stochastic inventory of this form is a standard example in [Puterman (2005)](#ref-Put2005a).

## How the code states the problem

`InventoryMDP <: MDP{Int, Int}` declares the types of state and action, and each piece of the model is one function in the `POMDPs` interface.

`states`, `actions`, `discount`, `stateindex`, `actionindex`, `initialstate`, `transition` and `reward` make a complete specification. `transition` returns `SparseCat(0:S, probs)`, a discrete distribution over next states. That separation of problem from solver is the design of [Egorov, Sunberg, Balaban, Wheeler, Gupta and Kochenderfer (2017)](#ref-ESBWG...2017a): the same `m` is passed to value iteration, to `MCTSSolver` and to the simulators without any change.

## How value iteration works

Start with any V, and repeatedly apply the Bellman update to every state:

V_new(s) = max over a of [R(s, a) + gamma · sum over s' of P(s' | s, a) V(s')]

Each sweep moves V closer to V* by at least the factor gamma, so the values converge from any start, and the error shrinks geometrically. `ValueIterationSolver(max_iterations=1000, belres=1e-6)` stops when the largest change falls below `belres`. The best action at each state is then the one that attains the maximum. Each sweep costs roughly states × actions × successors, and that is the limit on the size of the problem. The convergence theory is in [Puterman (2005)](#ref-Put2005a).

## What does the output show?

`order_by_stock` is the policy, as stock level and order. `value_when_empty` and `value_when_full` are V(0) and V(S), in the units of `price`.

**Value Function** should rise with stock, as stock already held need not be bought. **Policy Map** shows the order by stock. `V` and `act` are functions of the state, and they can be used directly in the code: `act(3)` is the order at a stock of 3. **State Value Lookup** tabulates both, and **Alpha Vectors / Q-Values** shows the heatmap of `policy.qmat`, with one row per stock level and one column per order size.

## How does a global method compare with tree search?

Value iteration solves every state in advance. Monte Carlo tree search, `MCTSSolver(n_iterations=1000, depth=30, exploration_constant=10.0)`, works only from the state at hand, by simulating ahead and building a tree of promising actions.

**Online Planning / Reward Rate** lists both choices for each stock level, and **Global vs Online Planning** compares their average returns. Tree search rests on the bandit rule of [Kocsis and Szepesvári (2006)](#ref-KS2006a). On a problem this small value iteration is exact and quick, so the comparison shows what tree search can recover from simulation alone. A sensible `exploration_constant` has the scale of the returns, and `depth` should reflect the effective horizon of the discount.

## What does long-run planning add?

**Solver vs Baseline** compares the optimal policy with a myopic one, `FunctionPolicy(s -> argmax(a -> reward(m, s, a), actions(m)))`, which takes the best immediate reward only.

The myopic rule sees the cost of an order and the expected extra sales of this period, but it gives no value to units carried into the next period. The gap between `optimal` and `myopic` is therefore the value of planning ahead. It grows as **Discount (gamma)** rises, and it depends on `holding_cost`, since cheap holding makes stock for later more useful. Both averages come from 500 runs of up to 200 steps, from an empty warehouse.

## References

<a id="ref-ESBWG...2017a"></a>Egorov, M., Sunberg, Z. N., Balaban, E., Wheeler, T. A., Gupta, J. K., & Kochenderfer, M. J. (2017). POMDPs.jl: A Framework for Sequential Decision Making under Uncertainty. *Journal of Machine Learning Research*. [Online](https://jmlr.org/papers/v18/16-300.html)

<a id="ref-KS2006a"></a>Kocsis, L., & Szepesvári, C. (2006). Bandit Based Monte-Carlo Planning. In *Machine Learning: ECML 2006*, 282-293. Springer. [doi:10.1007/11871842_29](https://doi.org/10.1007/11871842_29)

<a id="ref-Put2005a"></a>Puterman, M. L. (2005). *Markov Decision Processes: Discrete Stochastic Dynamic Programming* (2nd ed.). Wiley. [doi:10.1002/9780470316887](https://doi.org/10.1002/9780470316887)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [POMDP](pomdp.md) · [Semi-MDP](smdp.md)
