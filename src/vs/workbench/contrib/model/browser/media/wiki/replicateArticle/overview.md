# Replicate an Article — Overview

## Reproducibility and Replication: What a Pollis Replication Checks

[Goodman, Fanelli and Ioannidis (2016)](#ref-GFI2016a) show that the sciences use the words reproducibility and replicability in different senses. [National Academies of Sciences, Engineering, and Medicine (2019)](#ref-NASEM2019a) call a result reproducible when it is obtained again from the same data and code, and replicable when a new study on new data finds it. In these terms, a Pollis replication is a check of reproducibility: it asks whether the data an article used give, in Julia, the numbers the article printed. [Peng (2011)](#ref-Pen2011a) treats reproducibility as the least a claim should meet when no independent replication can be done.

## What a Pollis Replication Holds on Disk

A Pollis replication is a folder of `~/.pollis/replications`, named after its title when it is made. `replication.toml` holds the article's link, the input tables, where each target is published, the plan of each target, the precision each target requires, the explanation of each difference, and whether the replication is done. `targets/` holds the published tables as CSV files, and `inputs/` any tables typed in from the article. `results.csv` holds each published value beside Julia's: the replication's notebook writes it when it runs in the folder, through `Pollis.replicate` and `Pollis.compare`. A new replication has no folder until the first thing is typed or added, and one still empty when its page closes is deleted.

## Step 1: Article and Data

**Article and Data** gathers what the analysis is computed from and what it must reproduce. **Article Link** sets the article, which opens in the integrated browser in an in-memory session; **Save a Copy...** keeps a copy outside Pollis only when asked. **Input Tables** are added as an **Empty Table** to type in, from a link, from PollisDatasets or, with **Add from Article**, by a coding agent reading the article. **Target Tables** are the published results, as an **Empty Table**, from CSV files or from the article: row labels in the first column and the values as printed.

## Licences of the Input Data

Each input table of a Pollis replication has a `licence` in `replication.toml`: the terms the data's provider states. A table added from PollisDatasets gets the licence of its catalogue entry; one added from a link or typed in starts with none. **Article and Data** and **Record and Share** warn of each input with no licence stated, including those whose provider states none. Data may be shared with a replication only if its terms allow it, so before sharing, the data's owner is asked and the terms written in the input's `licence`.

## Step 2: Plan

**Plan** says, for each target table, how it is computed, in the column **Computed By**. **Julia Packages** names the registered packages that compute it, such as GLM for a logit. **Notebook Code** is a computation short enough to write in the notebook itself. **Article Method** is for a method no Julia package has, substantial enough that others would install and reuse it. **Note** says what computes the table, with the page of the article. Each choice made in a row is saved in `replication.toml` as it is made, and **Replicate with Agent** computes each table as its row says. **Ask Agent** has a coding agent, with the plan-replication skill, read the article and propose the plan instead. The plan is optional, and the Replicate step works without it.

## Exact and Random Values in a Replication

The column **Values** of the Plan step says how a target table is compared. **Exact** values are the same on every run, such as estimates, test statistics or a model solved, and are compared to the digits printed with `Pollis.replicate`. **Random** values change with the random numbers: those of a model simulated from its calibration, with no data, of the bootstrap, of a random forest or of a neural network such as LSTNet. No run gives the digits printed, so the notebook runs the analysis once for each of several seeds, takes the mean of the runs and its Monte Carlo standard error, and compares it with `Pollis.compare`, which counts a value as reproduced when it is within the noise of Julia's value and the published one. **New Notebook** writes that comparison for each target planned as **Random**.

## How Many Runs Does a Random Target Need?

A random target of the Plan step has two numbers. **Runs in Julia** is how many runs, each with its own seed, Julia averages, 10 when left empty: more runs make Julia's mean less noisy, at the cost of the time each run takes, which for a neural network is a whole training. **Runs in the Article** is how many runs the article's values average, as the article says, 1 when left empty, for a single run. The published value is noisy too, and the more so the fewer runs it averages, so the difference Compare allows grows as **Runs in the Article** falls. An article that reports a single run of a random forest allows a wider difference than one that reports the mean of a hundred.

## Does a Replication Need a New Method?

A replication needs no method of its own when a Julia package, or a few lines of the notebook, compute a table: most targets are planned as **Julia Packages** or **Notebook Code**. **Make an Article Method**, on the row of a target table, plans that table as **Article Method** and opens the page of a new article method with a method made from the replication: its article, all its input tables and that target, with no call yet. The row then shows **Open Method**, and the replication's notebook includes the method's code once it is written. Until then, the notebook can hold the code itself, so a replication never waits for a method.

## Step 3: Replicate

**Replicate** makes the replication's notebook, `NAME.ipynb` in its folder. **Instructions** are notes for a coding agent, saved in `INSTRUCTIONS.md` as they are typed: where in the article each table is computed, the choices the article leaves unsaid. **Replicate with Agent** hands the replication to the agent, with the replicate-article skill of the Pollis Agents plugin, once the article and its target tables are set. The agent reads the article and the data from their links, writes one section of the notebook for each target table, and runs it, so that `Pollis.replicate` and `Pollis.compare` write every comparison to `results.csv`. It keeps `PROGRESS.md`, from which a later session goes on. **Open Notebook** opens the notebook, which can also be written or changed by hand.

## Step 4: Compare

**Compare** reads `results.csv` as the notebook writes it. Its first table has a row for each target table, with the precision it requires, saved as it is changed: **Decimals Required**, how many decimals Julia's values must share with the published ones, all those printed when left empty, or, for random values, **Standard Errors Allowed**, 2 when left empty. Beside it, **Achieved** is the precision the table reaches, and **At the Required Precision** how many of its values reach it. Below, **Values Short of the Required Precision** lists the others, table by table: the value's row and column, the published value, Julia's, the standard error of a random value, and the comparison, such as "same to 2 decimals", "one in the last digit" or "DIFFERENT". **Show every value** lists all of them. The heading of the step, shown when it is closed, says how many values are at the required precision.

## The Precision a Target Table Requires

A published value is at the precision its table requires when Julia's value shares with it the decimals the table requires, all those printed by default. A table can require fewer, as when an article prints six decimals of a value its method gives to four. A random value, compared with `Pollis.compare`, is at the precision its table requires when it is fewer standard errors of the difference off than the table allows, 2 by default, counting only the gap beyond half a unit of the last digit printed, as the published value is known only to its digits. The precision is saved in the `[targets.NAME]` table of `replication.toml`, as `decimals` or `standard_errors`. A value that stays short of it after the usual causes are checked, such as the sample, the degrees of freedom or the variance estimator, gets a kind and an explanation.

## Explaining the Differences of a Replication

Each value Julia does not reproduce gets a **Kind** and an **Explanation** in the Compare step, saved as they are typed, as a `[[differences]]` table of `replication.toml`. **Misprint** is a value printed wrong, which other values of the table contradict. **Rounding** is a last digit off because the article rounded along the way. **Not Replicable** is a value the published data cannot give, as when the article used data or a seed it does not publish. **Unexplained** is an answer too, when none of these can be shown. **Explain with Agent** asks a coding agent, with the explain-differences skill, to look into each value and propose its kind and explanation, without changing the notebook. Record and Share counts the differences explained and those unexplained.

## Step 5: Record and Share

**Record and Share** sums up the replication from `results.csv`: how many target tables have every value at the precision they require, how many published values are at it, and how many of the values short of it have an explanation, with a kind other than **Unexplained**. A table gives each target table with the precision it requires, the precision it achieves and how many of its values reach it. The step warns of each input with no licence stated, whose data cannot be shared with the replication before its owner agrees. **Add to My Replications** marks the replication done, and Browse Replications then lists it under Done by You instead of In Progress; **Move Back to In Progress** undoes it.

## References

<a id="ref-GFI2016a"></a>Goodman, S. N., Fanelli, D. and Ioannidis, J. P. A. (2016). What does research reproducibility mean? *Science Translational Medicine* 8(341), 341ps12. [doi:10.1126/scitranslmed.aaf5027](https://doi.org/10.1126/scitranslmed.aaf5027)

<a id="ref-NASEM2019a"></a>National Academies of Sciences, Engineering, and Medicine (2019). *Reproducibility and Replicability in Science*. National Academies Press. [doi:10.17226/25303](https://doi.org/10.17226/25303)

<a id="ref-Pen2011a"></a>Peng, R. D. (2011). Reproducible research in computational science. *Science* 334(6060), 1226–1227. [doi:10.1126/science.1213847](https://doi.org/10.1126/science.1213847)

## See Also
- [Factsheet](factsheet.md)
