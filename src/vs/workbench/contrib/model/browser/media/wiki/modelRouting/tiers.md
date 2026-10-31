# Model Tasks and Routing — Tiers and Cells

## How to Read the Table of Agents and Models
Each column of the table is a coding agent, under the heading Code Agents, and each row a model, Cloud rows first and then Local. A cell holds the tier that runs on that agent with that model. A dash in a cell means the agent cannot run the model. Cloud models and the arguments that choose them come from the setting `pollis.agents.cloudModels`, opened by **Edit Cloud Models**.

## How to Move a Tier to Another Cell
A tier lives in one cell only. Typing its name in another cell moves it there, and clearing it from a cell takes it out of the table. A task whose tier is in no cell cannot run, and the page says so in the task's row: "In no cell of the table: the task cannot run". The setting `pollis.agents.tierCells` holds the placement.

## Tiers of Your Own and What Happens When One Is Removed
Typing a new name in a cell creates a tier, which then can be chosen in the **Runs On** column of the tasks. When a tier of your own is taken out of the table, the tasks set to it go back to their defaults, so none is left pointing at a name that no longer exists.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Tasks](tasks.md)
