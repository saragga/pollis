# Factsheet

The facts of hosting a game from Compose > Simulation Games > Host a Game...: the cases that come in toolboxes, what a case folder holds, the invitation, and the folder where a game is kept.

## The Cases in the Toolboxes of Pollis

| Case | What Each Team Plays | Rounds | Ways of Organising the Teams |
|---|---|---|---|
| Grow a Chocolate Chain | A chocolate brand with its own shops | 5 | Two |
| Merge or Be Bought | The board of a listed bicycle maker | 6 | Two |
| A Vineyard for the Portfolio | The buyer of a winery, or the owners of one of three | 6 | Two |
| Save the Company | The shareholders, the banks or the bondholders of a chain that cannot pay its debts | 4 or 6 | Two |
| Trading Floor | A trading desk on the market for one share, trading by the clock | 4 or 6 | One |

Each case comes in a toolbox of its own, installed from the Toolboxes section of the Extensions view. A toolbox of cases has no panels: its cases appear in Host a Game once it is installed.

## What a Case Folder Holds

A case is a folder with two files. `case.toml` describes the game: its title and description, its rounds and what a round is called, the bounds on the number of teams, the decisions and their bounds, the columns of the results, the briefings, the ways of organising the teams, the news, and, for a market, its rules. `model.jl` defines two Julia functions, `initial`, which sets up the game, and `play`, which plays a round from the teams' decisions. **Choose a Case Folder...** on the Host a Game page reads such a folder, and says what is wrong when `case.toml` is not valid or `model.jl` is missing.

## The Invitation of a Game

The invitation of a game is the invitation of a Collaboration session in Class mode, whose code ends in `@game`. Host the Game copies it to the clipboard; the Host step shows it, with Copy Invitation, for as long as the game lasts. A game has up to 30 players. Messages between teams go to the facilitator too, and the players are told so.

## Where a Game Is Kept

Every round of a game is written to the game's folder: `games` of the Pollis Workspace, else `~/.pollis/games`. The folder holds the case's settings for the game, the decisions, state and results of each round, and the news released. Compose > Simulation Games > Open the Debrief writes the debrief into the same folder, with the tables of the game as CSV files and a copy of the case.

## See Also
- [Overview](overview.md)
