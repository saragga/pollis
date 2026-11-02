# Interpretation

The trained system plays through a search, and its outputs need reading as a pair: what the network believes, and what the search concludes.

## How to Read the Printed Results of an AlphaZero Run

The run prints four items from the last iteration. `win_rate_vs_random` is the share of 20 games won, with draws not counted as wins. `policy_loss` and `value_loss` are computed on the replay window, and `samples` counts the positions in that window. A low loss does not by itself mean strong play, as it says only that the network predicts its own recent targets. Treat **Win Rate vs Random** and **vs Pure MCTS** as the measures of strength.

## How to Read Prior and Search Policies

**Policy Distribution** lists, for each move on the empty board, the network's prior and the visit share after search, with the value for the first player. A prior close to the visit share means that the network has learned what the search knows. A large gap shows the search correcting the network, which is the improvement that training tries to absorb. A visit share is not a win probability. Search concentrates its visits on what looks best, and the shares depend on **MCTS Simulations** and on **Exploration (c_puct)**.

## How to Read Visit Counts

**MCTS Visit Counts** shows where the search spent its effort on an empty board, as a grid for tic-tac-toe and as bars by column for Connect Four. Visits tend to the moves with high prior and high value. In tic-tac-toe, the centre and corners usually dominate, and equivalent corners should be roughly equal, while lopsided counts reveal that symmetry has only been learned in part. In Connect Four, the centre column is the expected favourite. Visits are only a summary of one search, under one budget.

## How to Read the Value Estimates

Value runs from -1 to 1, as seen by the player to move. On an empty board, a good tic-tac-toe network gives a value near 0, because perfect play draws, and a good Connect Four network gives a positive one, because the first player can force a win. **Value Over Game** converts each position to the view of X. A curve that swings late means the network failed to foresee the outcome. A curve that settles early at the result suggests accurate evaluation. Self-play with no noise follows one line of play, so the curve covers few positions.

## How to Read Match Results

Rates are from small samples, so 20 games give a standard error of up to about 0.11, and 100 games up to about 0.05. A deterministic player facing another deterministic player repeats games, which makes the sample smaller than it appears. Draws carry information as well: in tic-tac-toe, a high draw rate between strong players is what perfect play predicts, and it does not reveal weakness. The method reported by [Silver, Hubert, Schrittwieser, Antonoglou, Lai, Guez, Lanctot, Sifre, Kumaran, Graepel, Lillicrap, Simonyan and Hassabis (2018)](#ref-SHSAL...2018a) was also judged through many evaluation games against strong opponents, a standard that a short match cannot meet.

## How to Read Play in a Single Game

**Play a Game** gives one line of play from a search without noise, so it is a clear but narrow view. **Best Move** gives the chosen move after a fixed opening, with its visit share and the value for X. Moves are numbered as cells, row by row, in tic-tac-toe, and as columns in Connect Four. A high share means a clear preference, and a split share means close alternatives. Neither shows that a move is right, and for tic-tac-toe, the answer can be checked by hand.

## References

<a id="ref-SHSAL...2018a"></a>Silver, D., Hubert, T., Schrittwieser, J., Antonoglou, I., Lai, M., Guez, A., Lanctot, M., Sifre, L., Kumaran, D., Graepel, T., Lillicrap, T., Simonyan, K. and Hassabis, D. (2018). A general reinforcement learning algorithm that masters chess, shogi, and Go through self-play. *Science* 362(6419), 1140–1144. [doi:10.1126/science.aar6404](https://doi.org/10.1126/science.aar6404)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
