# Assumptions

AlphaZero relies on a particular kind of problem, and the panel adds simplifications of its own. Both shape what a run can achieve.

## What Kind of Game AlphaZero Assumes

The method assumes two players moving in turn, one zero-sum outcome, full information and no chance. A search needs an exact simulator, so that `play` can return the next board and any result from any position. Both panel games qualify. Hidden cards, dice or simultaneous moves break the search's reasoning, and a backed-up value with a sign flip at each ply makes sense only when one player's gain is the other's loss. Search with a learned model removes the need for a simulator, as in the work of [Schrittwieser, Antonoglou, Hubert, Simonyan, Sifre, Schmitt, Guez, Lockhart, Hassabis, Graepel, Lillicrap and Silver (2020)](#ref-SAHSS...2020a).

## Why Self-Play Data Keep Changing

Self-play makes the training distribution depend on the network, so it changes with each iteration. Standard results for supervised learning therefore do not apply, and no guarantee of steady improvement holds in the panel's setting. Two weak habits can reinforce each other, as a policy may never see the moves that would punish it. Root noise and early sampling are there to widen the positions reached. The replay window of four iterations steadies the targets at the price of keeping stale data.

## What the Search Assumes About Its Inputs

The PUCT search assumes that priors are a useful guide and that the value estimate is informative. Early in training neither holds, so the search relies on the simulations it can afford. **MCTS Simulations** must be large enough to correct a mistaken prior, as a very low budget just returns the prior, with no improvement to learn from. Visit counts are treated as a better policy, an assumption that holds only when the search has done enough work. A tree starts afresh at each move here, and past results are discarded.

## How the Panel's Network Differs from the Papers

The published systems use deep convolutional residual networks, as described by [Silver, Schrittwieser, Simonyan, Antonoglou, Huang, Guez, Hubert, Baker, Lai, Bolton, Chen, Lillicrap, Hui, Sifre, van den Driessche, Graepel and Hassabis (2017)](#ref-SSSAH...2017a). The tab uses a plain network with two hidden layers, so it has no built-in notion of a line or a neighbouring cell. That suffices for tic-tac-toe, and it limits Connect Four. Symmetry is also left to be learned, as boards are not rotated or reflected. Input is two planes of stones with no move history, which is enough since the rules depend on the board alone. A larger game or a stronger player needs a better network.

## Which Algorithm Details the Panel Simplifies

Compared with the published method, each iteration here finishes all its games before the network changes. There is no weight penalty, and the search runs in one thread. The network is always accepted with no test against its predecessor, which matches AlphaZero but not the gating in AlphaGo Zero. Self-play samples only the first few moves and then plays the most visited move, with no gradual temperature. The aim is clarity, so a poor result on a large game says little about the published method.

## What Is Assumed When Comparing Search Players

Search players with a network and no noise are deterministic, since `mcts_player` always returns the most visited move. Only the single random opening move varies a game between two such players. The number of distinct games is therefore small, at most twice the number of opening moves, so **vs Previous Checkpoint** contains repeats and its rates are not from independent games. A random or pure MCTS opponent provides real variation. **Win Rate vs Random** and **vs Pure MCTS** therefore rest on firmer ground.

## References

<a id="ref-SAHSS...2020a"></a>Schrittwieser, J., Antonoglou, I., Hubert, T., Simonyan, K., Sifre, L., Schmitt, S., Guez, A., Lockhart, E., Hassabis, D., Graepel, T., Lillicrap, T. and Silver, D. (2020). Mastering Atari, Go, chess and shogi by planning with a learned model. *Nature* 588(7839), 604–609. [doi:10.1038/s41586-020-03051-4](https://doi.org/10.1038/s41586-020-03051-4)

<a id="ref-SSSAH...2017a"></a>Silver, D., Schrittwieser, J., Simonyan, K., Antonoglou, I., Huang, A., Guez, A., Hubert, T., Baker, L., Lai, M., Bolton, A., Chen, Y., Lillicrap, T., Hui, F., Sifre, L., van den Driessche, G., Graepel, T. and Hassabis, D. (2017). Mastering the game of Go without human knowledge. *Nature* 550(7676), 354–359. [doi:10.1038/nature24270](https://doi.org/10.1038/nature24270)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
