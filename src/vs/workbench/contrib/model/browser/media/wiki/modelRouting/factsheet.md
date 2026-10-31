# Model Tasks and Routing — Factsheet

**Model Tasks and Routing** decides which coding agent and which model run each task of Pollis, through tiers placed in a table of agents and models.

| | |
|---|---|
| **Purpose** | Choose the agent and model of each tier, and the tier of each task |
| **Tiers** | Light, Standard, Strong, and names of your own |
| **Tables** | Agents by models, with Cloud and Local rows; and Task, Menu, Runs On, Skills |
| **Settings** | `pollis.agents.tierCells`, `pollis.agents.taskTiers`, `pollis.agents.cloudModels` |
| **Key choice** | How much model each task deserves |

## When to Use Model Tasks and Routing
- Running everyday tasks on a cheaper or local model, and keeping the strongest for hard ones.
- Moving a task to another tier.
- Trying a local model on an agent, before relying on it.
- Adding a cloud model to the table with Edit Cloud Models.

## What Model Tasks and Routing Does Not Do
The page does not route a question by itself at run time: each task runs on the cell of its tier, the same every time until changed. It does not set the answering model of Ask Pollis, which is in the status bar, or download local models, which is done in Models Installed.

## See Also
- [Overview](overview.md) · [Tiers and Cells](tiers.md) · [Tasks](tasks.md)
