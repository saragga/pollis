# Single-Agent Decision Processes

Many decisions change what the next decision will face: an order today sets tomorrow's stock, and a repair sets the machine's later condition. Markov decision processes make that link precise, so the best action balances an immediate reward against the value of the state it leads to.

## What makes a problem a decision process?

Four pieces define the model: states, actions, transition probabilities P(s' | s, a) and rewards R(s, a). A discount gamma weighs later rewards against earlier ones.

The Markov property is what keeps this tractable: the next state depends only on the current state and action, not on the path that led there. The answer is a policy, a rule giving an action for each state, and the best policy is the one with the highest expected discounted sum of rewards. The idea of solving such problems through the value of each state goes back to [Bellman (1954)](#ref-Bel1954a), and the standard text is [Puterman (2005)](#ref-Put2005a).

## The three models compared

| Feature | **MDP** | **POMDP** | **Semi-MDP** |
|---|---|---|---|
| What the agent knows | The state | Only noisy observations | The state |
| Time per decision | One period | One period | Depends on the action |
| What a policy maps from | State | Belief | State |
| Default problem | Inventory | The Tiger problem | Machine maintenance |
| Default solver | Value iteration | QMDP | Value iteration with durations |

Separate wikis give the details: [MDP](mdp.md), [POMDP](pomdp.md) and [Semi-MDP](smdp.md).

## What the Bellman equation says

The value V*(s) is the best expected discounted return from state s, and it satisfies:

V*(s) = max over a of [R(s, a) + gamma · sum over s' of P(s' | s, a) V*(s')]

That equation splits a long problem into one decision and the value of what follows. The term in brackets is Q(s, a), the value of taking action a and acting optimally afterwards. Once V* is known, the best action is whichever maximises Q, so all the long-run reasoning is already contained in V*. **Value Function** shows V*, and **Alpha Vectors / Q-Values** shows Q.

## Why a hidden state changes the problem

When the state cannot be seen, the agent has to act on what it has learned so far, which is summed up in a belief: a probability distribution over the states. [Kaelbling, Littman and Cassandra (1998)](#ref-KLC1998a) show that the belief is itself a state for planning, and that the problem can be treated as an MDP on beliefs.

Beliefs form a continuous space, so an exact solution is hard for all but small problems. Actions also gain a second role, since some are worth taking for what they reveal. On **POMDP**, listening earns nothing and costs something, and its value lies entirely in the information.

## Global and online planning

| Approach | When it computes | Result | Methods in the panel |
|---|---|---|---|
| Global | Once, in advance | A policy for every state or belief | Value iteration, QMDP, SARSOP |
| Online | At each decision | One action for the current situation | MCTS, POMCP |

Online planners spend effort only on situations that actually arise, which suits problems too large for a full policy. They are described in the survey of [Browne, Powley, Whitehouse, Lucas, Cowling, Rohlfshagen, Tavener, Perez, Samothrakis and Colton (2012)](#ref-BPWLC...2012a). **Global vs Online Planning** runs the two on the same problem.

## What the panel leaves out

Every model here is a small example with known probabilities. If the probabilities are unknown and have to be learned from experience, the methods belong under **Reinforcement Learning**.

With several agents who affect one another, see **Multi-Agent Decision Processes**. For problems stated directly as a Bellman equation on a grid, without the `POMDPs.jl` interface, see **Dynamic Programming**. To use the panel on your own problem, replace the definitions of states, actions, transition and reward in the code, and the solver calls stay the same.

## References

<a id="ref-Bel1954a"></a>Bellman, R. (1954). The Theory of Dynamic Programming. *Bulletin of the American Mathematical Society* 60(6), 503-515. [doi:10.1090/S0002-9904-1954-09848-8](https://doi.org/10.1090/S0002-9904-1954-09848-8)

<a id="ref-BPWLC...2012a"></a>Browne, C. B., Powley, E., Whitehouse, D., Lucas, S. M., Cowling, P. I., Rohlfshagen, P., Tavener, S., Perez, D., Samothrakis, S., & Colton, S. (2012). A Survey of Monte Carlo Tree Search Methods. *IEEE Transactions on Computational Intelligence and AI in Games* 4(1), 1-43. [doi:10.1109/TCIAIG.2012.2186810](https://doi.org/10.1109/TCIAIG.2012.2186810)

<a id="ref-KLC1998a"></a>Kaelbling, L. P., Littman, M. L., & Cassandra, A. R. (1998). Planning and Acting in Partially Observable Stochastic Domains. *Artificial Intelligence* 101(1-2), 99-134. [doi:10.1016/S0004-3702(98)00023-X](https://doi.org/10.1016/S0004-3702(98)00023-X)

<a id="ref-Put2005a"></a>Puterman, M. L. (2005). *Markov Decision Processes: Discrete Stochastic Dynamic Programming* (2nd ed.). Wiley. [doi:10.1002/9780470316887](https://doi.org/10.1002/9780470316887)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [MDP](mdp.md) · [POMDP](pomdp.md) · [Semi-MDP](smdp.md)
