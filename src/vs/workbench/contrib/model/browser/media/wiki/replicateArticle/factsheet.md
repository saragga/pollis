# Replicate an Article — Factsheet

A **Pollis replication** reproduces a published analysis on its data: every value the article prints is set beside the value Julia gives, and the replication is full when Julia gives them all.

| | |
|---|---|
| **Purpose** | Reproduce the results an article publishes, value by value, in Julia |
| **Input** | The article, its data as links or typed-in tables, and its published tables as targets |
| **Steps** | Article and Data, Plan, Replicate, Compare, Record and Share |
| **Output** | A folder of `~/.pollis/replications` with `replication.toml`, the target tables and `results.csv` |
| **Status** | Full when every published value is reproduced, else partial |
| **Listed in** | Compose > Replication > Browse Replications, under In Progress or Done by You |

## When to Replicate an Article

- **A result matters to your own work**, and you want to know that it can be had again from the published data.
- **A course or a study builds on an analysis**, and the analysis should run in Julia exactly as the article reports it.
- **The data of an article are public**, and a replication can show which of its printed values they give.

## What a Pollis Replication Is Not

A Pollis replication is not a Julia package and not a new method: for a method that no Julia package has, Compose > Replication > Create Article Method makes one, with the article's tables as its tests. A replication is not a new study on new data either: it checks the article's own data against the article's own numbers.

## See Also
- [Overview](overview.md)
