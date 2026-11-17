# Factsheet

The facts of writing a case on the Create a Simulation Game page of Compose > Simulation Games: the files of a case, the parts of `case.toml`, the two functions of `model.jl`, and what Test the Case checks.

## The Files of a Simulation Game Case

| File | What It Holds |
|---|---|
| `case.toml` | The title, description, rounds, teams, decisions, results, briefings, ways of organising the teams, news and parameters |
| `model.jl` | The Julia functions `initial` and `play`, which compute the game |
| `briefing.md` | What every player reads |
| `briefings/` | What each role or side reads, when the case has them |
| `debrief-questions.md` | Questions for the class, shown in the debrief |

The names of the briefings and of the debrief questions are those that `case.toml` gives under `briefing` and `debrief`.

## The Parts of case.toml

| Part | What It Says |
|---|---|
| `title`, `description`, `rounds`, `round`, `teams` | The case, its number of rounds, what a round is called, and the fewest and most teams |
| `[[decisions]]` | Each decision of a team: a number with `min`, `max` and `step`, or a choice with `options`; its `default` |
| `[results]`, `[[results.public]]`, `[[results.private]]` | The column that wins, and the columns every player sees and each team alone sees |
| `[[structures]]` with `[[structures.roles]]` | The ways of organising the teams, each role with its briefing and the decisions it sets |
| `[[sides]]` | Kinds of team that differ, such as a buyer and sellers |
| `[[news]]` | News the facilitator can release, with its round or window of rounds, its chance and the parameters it changes |
| `[parameters]` | The numbers `model.jl` reads; a range `[low, high]` can be drawn for each game |
| `[market]` | A market by the clock, in place of decisions |

## The Two Functions of model.jl

`initial(rng, parameters, teams)` returns the state of the game before the first round, and can return results too, such as what the teams see before they decide, with a `debrief` text for what the game drew. `play(rng, state, decisions, parameters)` returns the next state and the results of the round: `public`, the rows every player sees; `private`, each team's rows; and, when needed, `text`, `private_text`, `out`, `over` and `debrief`. The state holds only what TOML can hold. Pollis runs each round in a fresh Julia process, with a random number generator seeded for the game and the round, so that a round played again gives the same results. The header of `game.jl`, in the Pollis application, says what each argument and result holds.

## What Test the Case Checks

| Check | Reported When |
|---|---|
| `case.toml` is valid and `model.jl` exists | Pollis cannot read the case, with the reason |
| Every round runs | The model stops with an error, with the round and the error |
| Each round has public rows | A round played gives no rows every player sees |
| Rows have every column of `case.toml` | A row lacks a column, which would show empty |
| Rows have no keys beyond the columns | A key in a row is not a column, so no player sees it |
| The debrief can be written | The debrief of the test game cannot be written |

The test plays the first way of organising the teams, with each team's default decisions, and keeps the test game with the games of the case, in `games` of the Pollis Workspace, else in `~/.pollis/games`.

## See Also
- [Overview](overview.md)
