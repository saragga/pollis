# Semi-MDP

In a semi-Markov decision process, actions take different amounts of time, so what comes after a long action is discounted more than what comes after a short one. **Semi-MDP** applies that to machine maintenance, with the solver written out in the code.

## What changes when actions take time?

The only change to the Bellman equation is the discount, which now depends on the action through its duration tau(a):

Q(s, a) = R(s, a) + gamma^tau(a) · sum over s' of P(s' | s, a) V(s')

A long action delays all that follows. A repair of four periods therefore costs its explicit price and also pushes every later reward further into the future. Semi-Markov decision processes are treated in their general form by [Puterman (2005)](#ref-Put2005a), where the duration can be random and depend on the transition. In the panel's code each action's duration is fixed by `tau`.

## The default maintenance problem

A machine has a condition from 0, failed, to **States (S)**, new.

| Action | `tau` | Effect on the condition | `R` |
|---|---|---|---|
| `operate` | 1 period | Falls by one with chance **Degradation Probability** | The current condition, as production |
| `maintain` | 2 periods | Rises by two, capped at S | −5 |
| `replace` | 4 periods | Returns to S | −20 |

A failed machine that keeps operating stays failed and produces nothing. `outcomes` lists the possible next conditions with their probabilities, and the trade-off is between producing now and restoring the machine for later production.

## How the code is built

The model does not use the `POMDPs` interface, since each action has its own discount and the code keeps that explicit. `Q(V, s, a)` applies the equation with `gamma^tau(a)`.

`value_iteration(; tol=1e-8, maxiter=10_000)` sweeps all conditions, setting each to the best `Q`, and stops once the largest change is below `tol`. Since gamma^tau is at most gamma, each sweep still contracts by at least gamma, so convergence holds as on an ordinary MDP. `act(s)` selects the best action, and `rollout` simulates by advancing the clock `t` by each action's duration and discounting each reward by gamma^t.

## When to treat time explicitly

| Question | If yes | If no |
|---|---|---|
| Do durations differ a good deal? | **Semi-MDP** | A plain **MDP** may do |
| Does the discount matter over those durations? | **Semi-MDP** | Durations affect the policy less |
| Do rewards depend on time spent? | **Semi-MDP**, or add a time state | A plain **MDP** may do |
| Can decisions come at any moment? | Consider a continuous-time model | Periods are fine |

The same framework gives reinforcement learning its treatment of extended actions. [Sutton, Precup and Singh (1999)](#ref-SPS1999a) show how options, which are courses of action lasting several steps, fit into semi-MDP theory, so an agent can plan at more than one level of time.

## Reading the result

`action_by_condition` gives the action for each condition, usually a threshold rule: operate above some condition, and repair below it. `value_when_new` and `value_when_failed` are V(S) and V(0), and their difference is the worth of a new machine.

**Policy Map** draws the same rule. Raising **Degradation Probability** should make the machine worth less and may move the threshold. **Alpha Vectors / Q-Values** shows the Q heatmap, with conditions in rows and actions in columns, and the gap between actions says how firm each choice is. **Monte Carlo Return** starts from a new machine and runs for 400 periods, and it should match `V(S)` within the noise at usual discounts.

## What do the comparisons measure?

**Global vs Online Planning** solves the problem with a constant discount gamma per decision, ignoring `tau`, and evaluates that `naive` policy under the true durations. `policies_differ_at` lists the conditions at which the two rules differ, and the returns show what the difference costs.

**Solver vs Baseline** compares with `run_to_failure`, which operates until condition 0 and then replaces. That simple rule involves no maintenance at all, so the gap shows the value of acting before failure. **Online Planning / Reward Rate** reports `reward_per_period` over 20,000 periods, with `share_of_decisions` for each action, which counts decisions and not time spent. A policy's long-run reward rate is a different objective from discounted value, and the two can favour different rules.

## References

<a id="ref-Put2005a"></a>Puterman, M. L. (2005). *Markov Decision Processes: Discrete Stochastic Dynamic Programming* (2nd ed.). Wiley. [doi:10.1002/9780470316887](https://doi.org/10.1002/9780470316887)

<a id="ref-SPS1999a"></a>Sutton, R. S., Precup, D., & Singh, S. (1999). Between MDPs and Semi-MDPs: A Framework for Temporal Abstraction in Reinforcement Learning. *Artificial Intelligence* 112(1-2), 181-211. [doi:10.1016/S0004-3702(99)00052-1](https://doi.org/10.1016/S0004-3702(99)00052-1)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [MDP](mdp.md) · [POMDP](pomdp.md)
