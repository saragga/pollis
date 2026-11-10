# Replicate an Article — Overview

## Reproducibility and Replication: What a Pollis Replication Checks

[Goodman, Fanelli and Ioannidis (2016)](#ref-GFI2016a) show that the sciences use the words reproducibility and replicability in different senses. [National Academies of Sciences, Engineering, and Medicine (2019)](#ref-NASEM2019a) call a result reproducible when it is obtained again from the same data and code, and replicable when a new study on new data finds it. In these terms, a Pollis replication is a check of reproducibility: it asks whether the data an article used give, in Julia, the numbers the article printed. [Peng (2011)](#ref-Pen2011a) treats reproducibility as the least a claim should meet when no independent replication can be done.

## What a Pollis Replication Holds on Disk

A Pollis replication is a folder of `~/.pollis/replications`, named after its title when it is made. `replication.toml` holds the article's link, the input tables, where each target is published, the plan of each target, the explanation of each difference, whether the replication is done and, when the user sets it, its status and the reason for it. `targets/` holds the published tables as CSV files, and `inputs/` any tables typed in from the article. `results.csv` holds each published value beside Julia's: the replication's notebook writes it when it runs in the folder, through `Pollis.replicate` and `Pollis.compare`. A new replication has no folder until the first thing is typed or added, and one still empty when its page closes is deleted.

## Step 1: Article and Data

**Article and Data** gathers what the analysis is computed from and what it must reproduce. **Article Link** sets the article, which opens in the integrated browser in an in-memory session; **Save a Copy...** keeps a copy outside Pollis only when asked. **Input Tables** are added as an **Empty Table** to type in, from a link, from PollisDatasets or, with **Add from Article**, by a coding agent reading the article. **Target Tables** are the published results, as an **Empty Table**, from CSV files or from the article: row labels in the first column and the values as printed.

## Licences of the Input Data

Each input table of a Pollis replication has a `licence` in `replication.toml`: the terms the data's provider states. A table added from PollisDatasets gets the licence of its catalogue entry; one added from a link or typed in starts with none. **Article and Data** and **Record and Share** warn of each input with no licence stated, including those whose provider states none. Data may be shared with a replication only if its terms allow it, so before sharing, the data's owner is asked and the terms written in the input's `licence`.

## Step 2: Plan

**Plan** says, for each target table, how it is computed, in the column **Computed By**. **Julia Packages** names the registered packages that compute it, such as GLM for a logit. **Notebook Code** is a computation short enough to write in the notebook itself. **Article Method** is for a method no Julia package has, substantial enough that others would install and reuse it. **Note** says what computes the table, with the page of the article. Each change to the plan is saved in `replication.toml` as it is made, and **Replicate with Agent** computes each table as its row says. **Plan with Agent** asks a coding agent, with the plan-replication skill, to read the article and propose one. The plan is optional, and the Replicate step works without it.

## Does a Replication Need a New Method?

A replication needs no method of its own when a Julia package, or a few lines of the notebook, compute a table: most targets are planned as **Julia Packages** or **Notebook Code**. **Make an Article Method**, on the row of a target table, plans that table as **Article Method** and opens the page of a new article method with a method made from the replication: its article, all its input tables and that target, with no call yet. The row then shows **Open Method**, and the replication's notebook includes the method's code once it is written. Until then, the notebook can hold the code itself, so a replication never waits for a method.

## Step 3: Replicate

**Replicate** makes the replication's notebook, `NAME.ipynb` in its folder. **Instructions** are notes for a coding agent, saved in `INSTRUCTIONS.md` as they are typed: where in the article each table is computed, the choices the article leaves unsaid. **Replicate with Agent** hands the replication to the agent, with the replicate-article skill of the Pollis Agents plugin, once the article and its target tables are set. The agent reads the article and the data from their links, writes one section of the notebook for each target table, and runs it, so that `Pollis.replicate` and `Pollis.compare` write every comparison to `results.csv`. It keeps `PROGRESS.md`, from which a later session goes on. **Open Notebook** opens the notebook, which can also be written or changed by hand.

## Step 4: Compare

**Compare** reads `results.csv` and lists the published values Julia does not reproduce, table by table: the value's row and column, the published value, Julia's, the standard error of a simulated value, and the comparison, such as "same to 2 decimals", "one in the last digit" or "DIFFERENT". **Show every value** lists the values reproduced too. The heading of the step, shown when it is closed, says how many values are not reproduced. A value that stays off after the usual causes are checked, such as the sample, the degrees of freedom or the variance estimator, makes the replication partial.

## Explaining the Differences of a Replication

Each value Julia does not reproduce gets a **Kind** and an **Explanation** in the Compare step, saved with **Save Explanations** as a `[[differences]]` table of `replication.toml`. **Misprint** is a value printed wrong, which other values of the table contradict. **Rounding** is a last digit off because the article rounded along the way. **Not Replicable** is a value the published data cannot give, as when the article used data or a seed it does not publish. **Unexplained** is an answer too, when none of these can be shown. **Explain with Agent** asks a coding agent, with the explain-differences skill, to look into each value and propose its kind and explanation, without changing the notebook. Record and Share counts the differences explained and those unexplained.

## Step 5: Record and Share

**Record and Share** reads `results.csv` and counts the published values Julia reproduces, in all and table by table. A value compared exactly is reproduced when Julia's agrees with it to every printed decimal; a value from a simulation, compared with `Pollis.compare`, when it is within the noise. The replication is full when every value is reproduced, else partial. **Status** can be set to Full or Partial by hand, with a **Reason** kept in `replication.toml`. **Add to My Replications** marks the replication done, and Browse Replications then lists it under Done by You instead of In Progress.

## References

<a id="ref-GFI2016a"></a>Goodman, S. N., Fanelli, D. and Ioannidis, J. P. A. (2016). What does research reproducibility mean? *Science Translational Medicine* 8(341), 341ps12. [doi:10.1126/scitranslmed.aaf5027](https://doi.org/10.1126/scitranslmed.aaf5027)

<a id="ref-NASEM2019a"></a>National Academies of Sciences, Engineering, and Medicine (2019). *Reproducibility and Replicability in Science*. National Academies Press. [doi:10.17226/25303](https://doi.org/10.17226/25303)

<a id="ref-Pen2011a"></a>Peng, R. D. (2011). Reproducible research in computational science. *Science* 334(6060), 1226–1227. [doi:10.1126/science.1213847](https://doi.org/10.1126/science.1213847)

## See Also
- [Factsheet](factsheet.md)
