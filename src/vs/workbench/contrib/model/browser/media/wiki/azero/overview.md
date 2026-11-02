# Overview

AlphaZero learns a board game from its rules alone, by playing against itself. The panel writes the whole method out in a short program, and trains it on tic-tac-toe or Connect Four.

## What AlphaZero Does

Two parts work in a loop. A network reads a position and gives a prior over moves and an estimate of who is winning. A tree search uses those outputs to look ahead, and returns a move distribution stronger than the prior. Games of self-play generate positions, and the network then learns to predict both the search's distribution and the final result. A better network makes for a better search, whose targets then improve the network. No human games or hand-made evaluation enter at any stage.

## How One AlphaZero Training Iteration Runs

1. Play **Games per Iteration** games of self-play, running **MCTS Simulations** searches at every move.
2. Store each position with its visit distribution and the final result, seen by the player to move.
3. Keep the data of the latest four iterations.
4. Train the network for four epochs over that window, in batches of 64.
5. Test the search against a random player over 20 games, and save a checkpoint.

**Iterations** sets how many times the loop runs. A trained result consists of the network and the search together, and strength depends on both.

## Which Games the AlphaZero Panel Plays

| Item | Tic-Tac-Toe | Connect Four |
|---|---|---|
| Board | 3 × 3 | 6 × 7 |
| Line to win | 3 | 4 |
| Actions | 9 cells | 7 columns |
| Moves with sampling in self-play | 2 | 8 |
| Result under perfect play | Draw | First player wins |
| Default run | Seconds | Several minutes |

## Where AlphaZero Comes From

The line begins with AlphaGo, which trained on human games and combined networks with search, as reported by [Silver, Huang, Maddison, Guez, Sifre, van den Driessche, Schrittwieser, Antonoglou, Panneershelvam, Lanctot, Dieleman, Grewe, Nham, Kalchbrenner, Sutskever, Lillicrap, Leach, Kavukcuoglu, Graepel and Hassabis (2016)](#ref-SHMGS...2016a). AlphaGo Zero dropped human data in the work of [Silver, Schrittwieser, Simonyan, Antonoglou, Huang, Guez, Hubert, Baker, Lai, Bolton, Chen, Lillicrap, Hui, Sifre, van den Driessche, Graepel and Hassabis (2017)](#ref-SSSAH...2017a). AlphaZero generalised the method to chess and shogi, with the same algorithm across games, in [Silver, Hubert, Schrittwieser, Antonoglou, Lai, Guez, Lanctot, Sifre, Kumaran, Graepel, Lillicrap, Simonyan and Hassabis (2018)](#ref-SHSAL...2018a).

## What Code the AlphaZero Panel Generates

The tab writes the game, search, network and training loop directly in `Flux.jl`, in about 200 lines, so that every step can be read and changed. It does not load the package named in the panel's header, `AlphaZero.jl` by [Laurent (2021)](#ref-Lau2021a), which offers a full implementation for larger games and for parallel self-play. Boards are stored from the view of the player to move, with +1 for own stones and -1 for the opponent's.

## A Common Workflow for an AlphaZero Run

1. Train on **Tic-Tac-Toe** with the defaults, and read **Training Curves**.
2. Check strength with **Win Rate vs Random** and **vs Pure MCTS**.
3. Check progress with **vs Previous Checkpoint**.
4. Inspect decisions with **Policy Distribution**, **Best Move** and **Play a Game**.
5. Move to **Connect Four**, raising **MCTS Simulations** and **Iterations**, with a longer run time in mind.

## References

<a id="ref-Lau2021a"></a>Laurent, J. (2021). AlphaZero.jl: a Julia implementation of the AlphaZero algorithm. [github.com/jonathan-laurent/AlphaZero.jl](https://github.com/jonathan-laurent/AlphaZero.jl)

<a id="ref-SHMGS...2016a"></a>Silver, D., Huang, A., Maddison, C. J., Guez, A., Sifre, L., van den Driessche, G., Schrittwieser, J., Antonoglou, I., Panneershelvam, V., Lanctot, M., Dieleman, S., Grewe, D., Nham, J., Kalchbrenner, N., Sutskever, I., Lillicrap, T., Leach, M., Kavukcuoglu, K., Graepel, T. and Hassabis, D. (2016). Mastering the game of Go with deep neural networks and tree search. *Nature* 529(7587), 484–489. [doi:10.1038/nature16961](https://doi.org/10.1038/nature16961)

<a id="ref-SHSAL...2018a"></a>Silver, D., Hubert, T., Schrittwieser, J., Antonoglou, I., Lai, M., Guez, A., Lanctot, M., Sifre, L., Kumaran, D., Graepel, T., Lillicrap, T., Simonyan, K. and Hassabis, D. (2018). A general reinforcement learning algorithm that masters chess, shogi, and Go through self-play. *Science* 362(6419), 1140–1144. [doi:10.1126/science.aar6404](https://doi.org/10.1126/science.aar6404)

<a id="ref-SSSAH...2017a"></a>Silver, D., Schrittwieser, J., Simonyan, K., Antonoglou, I., Huang, A., Guez, A., Hubert, T., Baker, L., Lai, M., Bolton, A., Chen, Y., Lillicrap, T., Hui, F., Sifre, L., van den Driessche, G., Graepel, T. and Hassabis, D. (2017). Mastering the game of Go without human knowledge. *Nature* 550(7676), 354–359. [doi:10.1038/nature24270](https://doi.org/10.1038/nature24270)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
