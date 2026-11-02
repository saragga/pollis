# Multi-Agent Decision Processes

Several decision makers act over time in a shared world, and what each one receives depends on what all of them do. The panel covers two opposite cases: a cooperative team with private observations, and two opponents with opposite interests.

## Why one agent's best action depends on the others

A single-agent Markov decision process has one controller, so the best action depends on the state alone. With several agents, the value of an action also depends on what the others choose at the same moment. Two questions then decide which model applies: what can each agent know when choosing, and do the agents want the same thing?

The two tabs give opposite answers. **Dec-POMDP** agents want the same thing but know different things. **Stochastic Games** players know the same thing but want opposite outcomes. [Shoham and Leyton-Brown (2009)](#ref-SL2009b) place both within the wider field of multi-agent systems.

## Dec-POMDP and stochastic game compared

| Feature | **Dec-POMDP** | **Stochastic Games** |
|---|---|---|
| Interests | One reward shared by the team | Player 1 gains what player 2 loses |
| What each one sees | Its own noisy observations | The current state |
| Horizon | Finite, set by **Horizon (T)** | Infinite, discounted by **Discount (gamma)** |
| Form of the answer | One policy tree per agent | One mixed strategy per player and state |
| Solution method | JESP with random restarts | Shapley value iteration |
| Guarantee | A local optimum | The equilibrium value, within tolerance |
| Example problem | Dec-Tiger | A randomly generated game |

Separate wikis give the details: [Dec-POMDPs](decpomdp.md) and [Stochastic Games](stochastic-games.md).

## The Dec-Tiger problem in brief

Two agents stand before two doors, with a tiger behind one and a treasure behind the other. Each stage, each agent listens or opens a door. Listening gives a noisy hint about the tiger's side, heard privately, and the agents cannot compare notes. The rewards punish a lack of coordination harshly, since opening different doors costs more than meeting the tiger together.

An agent therefore has to reason about what its partner has probably heard, which is the difficulty that defines decentralised control. Dec-Tiger and JESP were introduced together by [Nair, Tambe, Yokoo, Pynadath and Marsella (2003)](#ref-NTYPM2003a).

## Why decentralised planning is so much harder

Sharing a reward sounds as if it should make planning easy. Yet the finite-horizon Dec-POMDP with two or more agents is NEXP-complete, while the single-agent finite-horizon POMDP is PSPACE-complete, as shown by [Bernstein, Givan, Immerman and Zilberstein (2002)](#ref-BGIZ2002a).

The practical sign is the number of candidate policies. Each agent has 3^(2^T − 1) policy trees in Dec-Tiger: 3 at T = 1, 2187 at T = 3, and about 6 × 10^14 at T = 5. Joint policies are the square of those counts, so exact search ends very soon, and JESP gives up the guarantee of a global optimum to go further.

## What the actions show on each tab

Each action has one meaning per tab, which is why several labels carry a slash.

| Action | On **Dec-POMDP** | On **Stochastic Games** |
|---|---|---|
| **Joint Value** | Best value for each horizon | Value of each state |
| **JESP / Shapley Convergence** | Value per JESP iteration | Largest change in V per iteration |
| **Value of Communication / Discount Sensitivity** | Gain from shared observations | Value as the discount changes |
| **Local vs Global / Pure vs Mixed** | JESP against exhaustive search | Pure security levels against the mixed value |
| **Against Baselines** | Simple fixed policies | A myopic player 1 |

The [Factsheet](factsheet.md) lists all ten, and the [Diagnostics](diagnostics.md) wiki says which results to trust.

## What the panel leaves out

The tabs' code covers exactly two agents, with Dec-Tiger on one side and two-player zero-sum games on the other. Point-based and other approximate Dec-POMDP solvers are not implemented, and general-sum games, where interests partly overlap, have no tab.

A full account of models and solvers is in [Oliehoek and Amato (2016)](#ref-OA2016a), and the [Decision Guide](decision-guide.md) wiki says where to go next.

## References

<a id="ref-BGIZ2002a"></a>Bernstein, D. S., Givan, R., Immerman, N., & Zilberstein, S. (2002). The Complexity of Decentralized Control of Markov Decision Processes. *Mathematics of Operations Research* 27(4), 819-840. [doi:10.1287/moor.27.4.819.297](https://doi.org/10.1287/moor.27.4.819.297)

<a id="ref-NTYPM2003a"></a>Nair, R., Tambe, M., Yokoo, M., Pynadath, D., & Marsella, S. (2003). Taming Decentralized POMDPs: Towards Efficient Policy Computation for Multiagent Settings. *IJCAI*. [Online](https://www.ijcai.org/Proceedings/03/Papers/103.pdf)

<a id="ref-OA2016a"></a>Oliehoek, F. A., & Amato, C. (2016). *A Concise Introduction to Decentralized POMDPs*. Springer. [doi:10.1007/978-3-319-28929-8](https://doi.org/10.1007/978-3-319-28929-8)

<a id="ref-SL2009b"></a>Shoham, Y., & Leyton-Brown, K. (2009). *Multiagent Systems: Algorithmic, Game-Theoretic, and Logical Foundations*. Cambridge University Press. [Online](https://www.masfoundations.org)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Dec-POMDPs](decpomdp.md) · [Stochastic Games](stochastic-games.md)
