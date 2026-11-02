# Stochastic Games

A stochastic game extends a Markov decision process to several players, with payoffs and transitions that depend on all their actions. The **Stochastic Games** tab solves the two-player zero-sum case exactly, up to a tolerance, by Shapley value iteration.

## Definition of a zero-sum stochastic game

The model has a finite set of states and, for each of two players, a finite set of actions. In state s, the players choose actions a1 and a2 at the same time. Player 1 receives r(s, a1, a2) and player 2 receives the negative. The next state is drawn from P(s' | s, a1, a2), and future payoffs are weighted by the discount gamma.

Player 1 maximises the expected discounted total, while player 2 minimises it. In the code, `Rw[s]` holds r and `P[s][a1, a2, s2]` holds P. [Shapley (1953)](#ref-Sha1953a) introduced these games, with a positive chance of stopping at each stage, which plays the same role as discounting.

## The matrix game solved in each state

At the heart of the method is a one-shot game with payoff matrix G, where the row player maximises and the column player minimises. Allowing mixed strategies, the minimax theorem of [von Neumann (1928)](#ref-Neu1928a) says that max over x of min over y of x'Gy equals min over y of max over x of x'Gy. That common number is the value of G.

`matrix_game` finds it by linear programming: maximise v, subject to x being a probability vector and every column of G giving at least v against x. The solver's dual variables on those column constraints give player 2's strategy, so one linear programme returns both strategies at once.

## A two-action matrix game worked by hand

Take G with rows (2, 0) and (0, 1). No pure saddle point exists: the row player's best guarantee with a pure action is 0, and the column player's is 1. For a 2 × 2 game with no saddle point, the value is (ad − bc) / (a + d − b − c), for rows (a, b) and (c, d).

Here that gives (2 · 1 − 0) / 3 = 2/3. The row player mixes (1/3, 2/3), and the column player also mixes (1/3, 2/3). Against that column strategy, the first row earns 2 · 1/3 = 2/3 and the second row earns 1 · 2/3 = 2/3. The two rows tie, so the row player has no reason to change, and that is what equilibrium means.

## Shapley value iteration

Value iteration repeats one update over all states. Given a current guess V, build for each state the matrix G(s) = r(s) + gamma · sum over s' of P(s') V(s'), which combines the payoff now with the discounted future. Then set the new V(s) to the value of the matrix game G(s). In the code, `stage` builds the matrix and `shapley` runs the loop from V = 0.

The update is a contraction: it brings any two guesses closer by a factor of gamma. So a unique fixed point V* exists, and iteration reaches it from any start. Each sweep needs one linear programme per state.

## How fast Shapley iteration converges

A one-state game shows the rate exactly. If the stage game has value v, then the updates give V_n = v (1 − gamma^n) / (1 − gamma), and the change at step n is v gamma^(n−1). With the 2 × 2 game worked by hand, v = 2/3, so the limit is (2/3) / (1 − gamma), which is about 6.67 at gamma = 0.9.

Reaching a change under 1e-6 takes about 130 iterations at gamma = 0.9. In general, the distance to V* is at most gamma / (1 − gamma) times the last change, so high discounts need a smaller **Tolerance** for the same accuracy. **JESP / Shapley Convergence** plots this decline on a log scale.

## Stationary equilibrium strategies

Solving G(s) once more at the converged V gives each player's mixed strategy in state s, and the code stores them in `eqs`. These strategies are stationary: they depend on the state, never on the past or on the stage. Shapley's result is that such strategies are optimal, even though either player could in principle use the whole history.

The pair is an equilibrium of the full game: with player 2 fixed, player 1 faces a Markov decision process whose optimal value is V*, and likewise for player 2. Testing one-stage changes in each state is enough, and **Equilibrium Check** does exactly that.

## What the generated game is for

The tab's default draws one payoff matrix per state from a standard normal and one transition row per state and action pair from normalised uniforms, all controlled by **Random Seed**. **States (S)** and **Actions per Player (A)** set the size.

Generated games are useful for seeing how the method scales and for checking the code, but their values have no meaning of their own. Two seeds give different numbers, and neither is a benchmark. Because rows are dense and states all connect, the tab cannot show absorbing states or long-range planning. Those features appear when `Rw` and `P` are replaced with a designed game.

## General-sum stochastic games

When the two payoffs do not sum to zero, each player has its own reward and the matrix-game value no longer describes both. [Nash (1951)](#ref-Nas1951a) showed that finite games always have an equilibrium in mixed strategies, and discounted stochastic games with finite states and actions also have stationary equilibria.

Computing one is harder, as no single-value linear programme applies, equilibria can be many, and a stage-by-stage update need not converge. Linear programming stays available for correlated equilibria of a stage game. The tab does not implement any of this. A full treatment is in [Filar and Vrieze (1997)](#ref-FV1997a).

## Learning a stochastic game from play

Shapley iteration assumes the payoffs and transitions are known. When they are not, a player can learn from experience with the same structure: keep a table of values for state and joint action, and use the matrix-game value of that table as the target of each update.

That idea is the minimax-Q algorithm of [Littman (1994)](#ref-Lit1994a), which framed Markov games as a setting for multi-agent reinforcement learning. The panel **Multi-Agent Reinforcement Learning** continues in that direction. A learning method needs many visits to each joint action, so a known model is much cheaper when it is available.

## References

<a id="ref-FV1997a"></a>Filar, J., & Vrieze, K. (1997). *Competitive Markov Decision Processes*. Springer. [doi:10.1007/978-1-4612-4054-9](https://doi.org/10.1007/978-1-4612-4054-9)

<a id="ref-Lit1994a"></a>Littman, M. L. (1994). Markov Games as a Framework for Multi-Agent Reinforcement Learning. *Machine Learning Proceedings 1994*, 157-163. [doi:10.1016/B978-1-55860-335-6.50027-1](https://doi.org/10.1016/B978-1-55860-335-6.50027-1)

<a id="ref-Nas1951a"></a>Nash, J. (1951). Non-Cooperative Games. *Annals of Mathematics* 54(2), 286-295. [doi:10.2307/1969529](https://doi.org/10.2307/1969529)

<a id="ref-Sha1953a"></a>Shapley, L. S. (1953). Stochastic Games. *Proceedings of the National Academy of Sciences* 39(10), 1095-1100. [doi:10.1073/pnas.39.10.1095](https://doi.org/10.1073/pnas.39.10.1095)

<a id="ref-Neu1928a"></a>von Neumann, J. (1928). Zur Theorie der Gesellschaftsspiele. *Mathematische Annalen* 100(1), 295-320. [doi:10.1007/BF01448847](https://doi.org/10.1007/BF01448847)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Dec-POMDPs](decpomdp.md)
