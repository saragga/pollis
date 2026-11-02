# Competitive Multi-Agent Learning

Two players with opposite interests learn by playing each other. The **Competitive** tab uses tic-tac-toe, small enough to compare the learned table against exact perfect play.

## The self-play setup

A single table of values plays both sides of each game. X moves first, and the game ends with three in a row or a full board. A move is random with probability **Exploration (epsilon)**, and otherwise it is the move with the highest value, with ties broken at random.

Training plays **Episodes** games in a row, each updating the table. The opponent is always the table itself at that moment, so strength has no fixed reference within training. That is why the code also tests the greedy table at checkpoints, against a random player and a perfect one that it did not train with. The tests do not affect the table.

## What an afterstate is

An afterstate is the board just after a player's move, before the reply. Valuing afterstates, instead of pairs of a state and an action, is a natural fit for board games, because different moves from different boards can lead to the same position, and they then share one estimate. [Richard S. Sutton and Andrew G. Barto (2018)](#ref-SB2018a) discuss afterstates and use tic-tac-toe as their first example.

To choose a move, the player tries each empty cell, looks up the resulting afterstate and picks the highest value. A winning afterstate is worth 1 and a drawn full board 0, read directly by `value` without using the table.

## How one table serves both players

`V` stores each afterstate multiplied by the player who has just moved, so that player's marks always read +1 and the other's −1. A value therefore always means the expected result for the player who has just moved, whichever side that is.

Both sides thus learn from every game, and the data double in effect. X's and O's afterstates never collide, as they differ in how many marks each side has. The full table has at most 4519 non-terminal afterstates. Rotations and reflections of a board are stored separately, so a table that merged them would be far smaller and learn faster.

## The TD(0) update during self-play

After each move, the player's previous afterstate moves towards its new one: V(previous) ← V(previous) + alpha (V(new) − V(previous)). This is temporal-difference learning: an estimate is corrected using the next estimate, without waiting for the end of the game.

When a game ends, both players' last stored afterstates are corrected. The mover's moves towards the result of its final move, and the other's moves towards −1 after a loss, or 0 after a draw. Information about the result then flows backwards, one move per game. Temporal-difference learning from self-play gave one of the field's earliest striking results, in backgammon, described by [Gerald Tesauro (1995)](#ref-Tes1995a).

## An update worked by hand

Take a game with all table values at zero and **Learning Rate (alpha)** at 0.2. X wins on its last move, so `value` returns 1 for that board.

| Afterstate | Target | New value |
|---|---|---|
| X's previous afterstate | 1 | 0 + 0.2 (1 − 0) = 0.2 |
| O's last afterstate | −1 | 0 + 0.2 (−1 − 0) = −0.2 |

In a later game, an X afterstate that leads to the first of those moves towards 0.2, reaching 0.04. Each value moves only a fifth of the way to its target, so the signal reaches early moves slowly, and that is why even a small game takes thousands of episodes.

## Learning from exploratory moves

The tab updates after every move, including random ones. The table therefore estimates results under the exploring policy, which sometimes blunders, not under perfect play. The tic-tac-toe example of Sutton and Barto makes no update after an exploratory move, so its values head instead towards greedy play.

The consequence is that with **Exploration (epsilon)** at 0.1, values on the empty board need not approach the true 0 for all openings. Lowering epsilon brings the estimates closer to perfect play, but also makes rare lines less visited. **Exploration Sweep** shows that balance in terms of play against the two opponents, which is what matters.

## The perfect player

`negamax` computes the exact value of any position for the player to move: 1, 0 or −1. Each position's value is the best, over legal moves, of a win, a draw or the negative of the opponent's value afterwards. The memo table holds each position once, so the search is fast for this game.

`perfect_move` chooses at random among moves with the highest value. It never loses, but it also does not set traps, because all drawing moves look equal to it. A greedy table can therefore draw every game against it and still hold a weakness in a line that the perfect player rarely enters. Scale is the limit, since exact search is impossible in larger games.

## Why self-play can leave blind spots

Self-play only tests a policy against itself, and it can drift into a narrow style. A policy may learn a good answer to its own usual moves, and it never gets to see what a different opponent would do. Exploration helps in tic-tac-toe, as the game has so few positions, but this protection fades quickly as games grow.

Common remedies keep a pool of past policies, or mix in other opponents, so that a new policy must beat more than its latest self. The population-based form is by [Marc Lanctot, Vinicius Zambaldi, Audrunas Gruslys, Angeliki Lazaridou, Karl Tuyls, Julien Pérolat, David Silver and Thore Graepel (2017)](#ref-LZGLT...2017a). The tab's code has no such pool.

## How this relates to game theory

Tic-tac-toe is a special case of the Markov game of [Michael L. Littman (1994)](#ref-Lit1994a), who extended Q-learning to two-player zero-sum games using minimax values. Here the players take turns and see everything, so a pure best move always exists, and the table's greedy choice is enough.

Simultaneous-move games differ, as their equilibria can need randomisation. A greedy table would then be exploited, and methods such as minimax-Q learn mixed strategies instead. For a stochastic game with a known model, the exact solution is in **Multi-Agent Decision Processes**, on its **Stochastic Games** tab.

## From tables to deep self-play

Tables end where positions can no longer be listed. Self-play then pairs a neural network, which generalises between positions, with search to look ahead during play. A single general algorithm of that kind reached superhuman strength in chess, shogi and Go from the rules alone, as shown by [David Silver, Thomas Hubert, Julian Schrittwieser, Ioannis Antonoglou, Matthew Lai, Arthur Guez, Marc Lanctot, Laurent Sifre, Dharshan Kumaran, Thore Graepel, Timothy Lillicrap, Karen Simonyan and Demis Hassabis (2018)](#ref-SHSAL...2018a).

The training loop has the same outline as on this tab: play yourself, update values from results, and repeat. The **AlphaZero** panel takes the next step in Pollis, on tic-tac-toe and Connect Four.

## References

<a id="ref-LZGLT...2017a"></a>Lanctot, M., Zambaldi, V., Gruslys, A., Lazaridou, A., Tuyls, K., Pérolat, J., Silver, D., & Graepel, T. (2017). A Unified Game-Theoretic Approach to Multiagent Reinforcement Learning. [arXiv:1711.00832](https://arxiv.org/abs/1711.00832)

<a id="ref-Lit1994a"></a>Littman, M. L. (1994). Markov Games as a Framework for Multi-Agent Reinforcement Learning. *Machine Learning Proceedings 1994*, 157-163. [doi:10.1016/B978-1-55860-335-6.50027-1](https://doi.org/10.1016/B978-1-55860-335-6.50027-1)

<a id="ref-SHSAL...2018a"></a>Silver, D., Hubert, T., Schrittwieser, J., Antonoglou, I., Lai, M., Guez, A., Lanctot, M., Sifre, L., Kumaran, D., Graepel, T., Lillicrap, T., Simonyan, K., & Hassabis, D. (2018). A General Reinforcement Learning Algorithm that Masters Chess, Shogi, and Go through Self-Play. *Science* 362(6419), 1140-1144. [doi:10.1126/science.aar6404](https://doi.org/10.1126/science.aar6404)

<a id="ref-SB2018a"></a>Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. [Online](http://incompleteideas.net/book/the-book-2nd.html)

<a id="ref-Tes1995a"></a>Tesauro, G. (1995). Temporal Difference Learning and TD-Gammon. *Communications of the ACM* 38(3), 58-68. [doi:10.1145/203330.203343](https://doi.org/10.1145/203330.203343)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
- [Cooperative](cooperative.md)
