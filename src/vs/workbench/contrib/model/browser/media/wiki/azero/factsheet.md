# Factsheet

**AlphaZero** trains a policy-value network and a Monte Carlo tree search through self-play, on tic-tac-toe or Connect Four, with code written in `Flux.jl`.

## What the AlphaZero Panel Does

| Item | Detail |
|---|---|
| Purpose | Learn to play a two-player board game from its rules alone |
| Julia stack | `Flux.jl` for the network, `Distributions.jl` for Dirichlet noise, `Plots.jl` for figures; `AlphaZero.jl` is named as the fuller package and is not loaded |
| Input shape | No data: self-play generates it |
| Network | Two relu hidden layers, with one output per action and one for value |
| Results object | `res`, with `net`, `hist` and `checkpoints` |
| Printed result | `win_rate_vs_random`, `policy_loss`, `value_loss`, `samples` |

## What the Inputs of the AlphaZero Panel Default To

| Input | Default | Role |
|---|---|---|
| **Game** | Tic-Tac-Toe | Board, line length and actions |
| **Iterations** | 15 | Rounds of self-play and network update |
| **MCTS Simulations** | 50 | Tree search work per move |
| **Games per Iteration** | 50 | Self-play games before each update |
| **Exploration (c_puct)** | 1.5 | Weight of the prior-guided bonus in the search |
| **Hidden Units** | 64 | Width of both hidden layers |
| **Learning Rate** | 1e-3 | Adam step size |
| **Random Seed** | 1 | Initial weights, sampling and noise |

## Which Settings Are Fixed in the Generated AlphaZero Code

| Setting | Value | Where |
|---|---|---|
| Replay window | 4 iterations | `window` in `train` |
| Training epochs per iteration | 4 | `epochs` in `train` |
| Batch size | 64 | `batch` in `train` |
| Moves sampled from the visits | 2 or 8, by game | `tempmoves` in `self_play` |
| Root noise | Dirichlet 0.3, weight 0.25 | `search` |
| Evaluation games in training | 20, with one random opening move | `match` |

Every setting can be edited in the code. Keywords of `train` can also be passed directly in a new call.

## See Also

- [Overview](overview.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
