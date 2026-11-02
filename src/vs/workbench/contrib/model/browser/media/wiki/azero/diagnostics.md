# Diagnostics

Loss curves alone cannot show that a self-play system has improved, as the data change along with the network. Strength has to be measured directly, in games.

## How to Read AlphaZero Training Curves

**Training Curves** plots the win rate of the search against a random player and the total loss, by iteration. The win rate should climb quickly and stay high. Each point rests on 20 games, so one game moves it by 0.05, and small dips are noise. A draw counts as not winning, so the rate need not reach 1. An early high rate is not proof of strength, as beating a random player is easy, and a search alone manages much of it before the network has learned.

## How to Read the Policy and Value Losses

**Loss Components** plots the two losses separately. Policy loss is the cross-entropy to the visit distribution, so its floor is the entropy of the targets, and it does not fall to zero. Value loss is the squared error to results of -1, 0 and 1. Each is computed over the current window, whose data change, so a rise can mean that better play has produced harder targets. A loss stuck near its starting level does suggest a problem, such as too few simulations or too low a **Learning Rate**.

## How to Measure Strength Against a Random Player

**Win Rate vs Random** reports win, draw and loss rates over 100 games, for the search and for the raw network without search. The first player alternates, and one random opening move varies the games. A strong player should almost never lose. Compare the two lines: if the search does far better than the raw network, then the network still leans on search. If the two are close, then the network has absorbed what the search teaches. A standard error for a rate is sqrt(p(1 − p) / n).

## How to Compare with Pure MCTS

**vs Pure MCTS** plays the trained search against plain MCTS, which uses uniform priors and random playouts with the same simulation budget. A trained player should beat it, or draw in tic-tac-toe, where perfect play is a draw. Failure to beat it means that the network adds little over a uniform prior and random rollouts. The same action tests the raw network against the search, a far harder test. [Browne, Powley, Whitehouse, Lucas, Cowling, Rohlfshagen, Tavener, Perez, Samothrakis and Colton (2012)](#ref-BPWLC2012a) survey plain MCTS and its variants.

## How to Check Progress Between Checkpoints

**vs Previous Checkpoint** plays the final network against the halfway network and the untrained one, each with search, over 40 games. The trained network should beat the untrained one clearly. A close result with the halfway network may mean that learning has flattened, or, in tic-tac-toe, that both already play perfectly and draw. Deterministic players repeat games, as only the opening move varies, so treat these rates as a rough signal and not as a precise estimate.

## How to Check That the Code Behaves

**Play a Game** shows a whole game and its final board, which should obey the rules and show sensible play. **Best Move** tests a position with a known answer: in tic-tac-toe, after X in the centre and O in a corner, a good move exists and a blunder is visible. **MCTS Visit Counts** should be roughly symmetric on an empty board for tic-tac-toe. Changing **Game** changes the constants `ROWS`, `COLS`, `K` and `NA`, so a fresh Julia session is the safe way to switch.

## References

<a id="ref-BPWLC2012a"></a>Browne, C. B., Powley, E., Whitehouse, D., Lucas, S. M., Cowling, P. I., Rohlfshagen, P., Tavener, S., Perez, D., Samothrakis, S. and Colton, S. (2012). A survey of Monte Carlo tree search methods. *IEEE Transactions on Computational Intelligence and AI in Games* 4(1), 1–43. [doi:10.1109/TCIAIG.2012.2186810](https://doi.org/10.1109/TCIAIG.2012.2186810)

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
