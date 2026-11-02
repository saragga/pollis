# Decision Guide

AlphaZero is expensive, so the first decision is whether a problem needs it. The remaining decisions balance search effort, game count and network size.

## When to Use AlphaZero

| Situation | Better choice | Why |
|---|---|---|
| Two players, full information, simulator, and a large game | AlphaZero | Learns evaluation and search guidance from the rules |
| Small game that can be searched fully | Exact search or minimax | Gives a proven answer at no training cost |
| Simulator exists, but training time is short | Pure MCTS | Needs no network |
| Rules are unknown to the agent | Search with a learned model | No exact simulator needed |
| One decision-maker with continuous actions | Actor-critic methods | No opponent or tree over discrete moves |

## How Tree Search Compares with Plain Learning

Search corrects a network's errors at decision time, at the cost of time per move. A model-free method answers immediately, as its policy has absorbed all it knows. [Sutton and Barto (2018)](#ref-SB2018a) discuss this split between planning and learning. With a simulator available and time per move affordable, search gives strength that a raw network seldom reaches, a difference that **Win Rate vs Random** and **vs Pure MCTS** both reveal, since each also tests the raw network.

## How to Set the Search Budget

**MCTS Simulations** should grow with the number of moves available and with the depth of tactics. A budget near the number of legal moves barely looks beyond the prior. More simulations improve both play and training targets, while cost grows in proportion, since every move of every game pays for them. Start with the default for **Tic-Tac-Toe**, and raise it for **Connect Four**. Run time is roughly **Iterations** × **Games per Iteration** × moves per game × **MCTS Simulations**.

## How to Set the Exploration Constant

The search scores a move by Q + c_puct × P × sqrt(N + 1) / (1 + n), where Q is the mean value of the move, P its prior, N the visits to the position and n the visits to the move. The rule is a variant of the form studied by [Rosin (2011)](#ref-Ros2011a). A larger **Exploration (c_puct)** leans on the prior and spreads visits, and a smaller one follows the current values and narrows the search. With a poor prior, a large value wastes simulations on moves the prior happens to favour. Values within a factor of two of the default are a sensible range to try first.

## How to Balance Games, Iterations and the Network

**Games per Iteration** sets how many fresh positions each update sees, with few games giving noisy updates. **Iterations** sets how many rounds of improvement take place. For a fixed budget, many small iterations often beat a few large ones, as a better network generates better data sooner. **Hidden Units** should grow with the game, as a plain network needs width to represent Connect Four, and it can overfit the small window when oversized. Lower **Learning Rate** if the losses jump between iterations.

## When to Move Beyond the Panel's Code

The tab is meant for reading and experiments on small boards. Stronger play on a real game calls for a convolutional network, a search running in parallel, and many more games, which `AlphaZero.jl` by [Laurent (2021)](#ref-Lau2021a) provides. A new game means changing `play`, `legal`, `wins` and `encode`, so the search and training loop can stay. Check the rules with a game of **Play a Game** before any long run, as a mistake in the rules still trains happily.

## References

<a id="ref-Lau2021a"></a>Laurent, J. (2021). AlphaZero.jl: a Julia implementation of the AlphaZero algorithm. [github.com/jonathan-laurent/AlphaZero.jl](https://github.com/jonathan-laurent/AlphaZero.jl)

<a id="ref-Ros2011a"></a>Rosin, C. D. (2011). Multi-armed bandits with episode context. *Annals of Mathematics and Artificial Intelligence* 61(3), 203–230. [doi:10.1007/s10472-011-9258-6](https://doi.org/10.1007/s10472-011-9258-6)

<a id="ref-SB2018a"></a>Sutton, R. S. and Barto, A. G. (2018). *Reinforcement Learning: An Introduction*, 2nd ed. MIT Press. [incompleteideas.net/book](http://incompleteideas.net/book/the-book-2nd.html)

## See Also

- [Factsheet](factsheet.md) · [Overview](overview.md) · [Assumptions](assumptions.md)
