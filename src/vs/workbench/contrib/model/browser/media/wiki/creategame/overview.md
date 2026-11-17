# Overview

**Create a Simulation Game**, in Compose > Simulation Games, helps a teacher or a colleague write a case of their own for Simulation Games: start from a minimal case or from one of the installed cases, write it alone or with a coding agent, test it with Julia, and host it with a class.

## The Four Steps of Create a Simulation Game

The Create a Simulation Game page has four steps. **Start From** copies a case to start from under the title you give it, or chooses one of your cases to go on with. **Write** opens the files of the case and the drill-down on Simulation Games, makes the case's icon, and offers **Write with Agent**, which hands the case to a coding agent. **Test** plays every round of the case with Julia and opens the debrief of the test game. **Share** opens Host a Game with the case chosen, shows the case's folder to give to colleagues, and offers **Package with Agent**, which makes the case a toolbox of cases.

## Which Case to Start a Simulation Game From

Start From lists **Sell One Product**, the minimal case of Pollis, in which rival teams set a price and their marketing for three rounds while the buyers' demand varies from round to round, and the cases of the installed toolboxes, each as a pattern. Grow a Chocolate Chain shows rivals in one market, with roles that set different decisions. Merge or Be Bought shows bids among equals, each team bidding for the others. A Vineyard for the Portfolio shows a buyer and sellers, each side with its own decisions and secrets. Save the Company shows a negotiation over a plan between sides that differ. Trading Floor shows a market by the clock, with an order book in place of decisions. **Create the Case** copies the chosen case under the new title into the cases folder, or under the title of the chosen case when the Title is left empty, and goes on to the Write step, and **Get More Cases** opens the Toolboxes section of the Extensions view.

## Your Cases on the Create a Simulation Game Page

Under **Your Cases**, Start From lists the cases created on the page, kept in `games/cases` of the Pollis Workspace, else in `~/.pollis/games/cases`, and any case folder opened with **Open a Case Folder...**. Choosing one makes it the case that Write, Test and Share work on. A case that cannot be read, because `case.toml` has a mistake or `model.jl` is missing, is still listed, with the reason, so that it can be fixed in Write.

## The Icon of a Simulation Game Case

The icon of a case is the picture that a toolbox of the case shows in the Toolboxes section of the Extensions view, beside its name. A case created on the Create a Simulation Game page gets the initials of its title, in white on a colour of its own; **Use the Title's Initials**, in the Write step, makes that icon again. **Choose an Image...** makes the icon from a photo or a drawing the author may use, in PNG, JPEG, WebP or GIF, cropped to its middle square. **Pollis Badge**, unticked at first, adds the Pollis logo in the upper left corner, as the five cases of Pollis have it. Pollis saves the icon, 128 by 128 pixels, as `icon.png` in the case's folder, and `case.toml` names it with `icon = "icon.png"`; **Package with Agent** makes it the icon of the toolbox.

## Writing a Case with a Coding Agent

**Write with Agent**, in the Write step, starts the coding agent of Compose > Coding Agents in a terminal, in the case's folder, with the skill Write a Simulation Game of the Pollis Agents plugin. Describe the game to write, such as the teams, the decisions, what happens in a round and who wins, or what to change in the case; with nothing written, the agent asks first. The agent proposes the design before writing, writes `case.toml`, `model.jl` and the briefings, and plays every round with Julia, as the Test step does, until none fails. The agent runs on the Strong tier of Model Tasks and Routing by default, under the task Write a Simulation Game.

## Testing a Simulation Game Case

**Test the Case** reads `case.toml` as Host a Game reads it, starts a test game with the fewest teams the case allows, at least two, and plays every round with Julia, each team keeping its default decisions. The step lists each round played, with what the rows of the results lack, of the columns of `case.toml`, and what they have that no player would see. When a round fails, the step shows the round and the model's error, and **Fix with Agent** hands both to the coding agent. When every round is played, the debrief of the test game opens beside the page.

## Sharing a Simulation Game Case

The Share step gives three ways to share a case. **Host This Case** opens Host a Game with the case chosen, to play it with a class. **Show the Folder** shows the case's folder in the file manager: colleagues who receive it choose it with Choose a Case Folder... in Host a Game. **Package with Agent** makes the case a toolbox of cases with the coding agent: a `.vsix` file, with a README and an icon, which others install with Extensions: Install from VSIX..., after which the case is listed in Host a Game, as the five cases of Pollis are.

## See Also
- [Factsheet](factsheet.md)
