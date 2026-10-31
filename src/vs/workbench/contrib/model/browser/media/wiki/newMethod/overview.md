# New Method — Overview

## Reproducibility and Replication: What a Pollis Method Tests

Reproducibility and replicability mean different things across the sciences ([Goodman, Fanelli and Ioannidis (2016)](#ref-GFI2016a)). In the terms of [National Academies of Sciences, Engineering, and Medicine (2019)](#ref-NASEM2019a), a result is reproducible when the same data, code and steps give consistent results, and replicable when a new study with new data does. A Pollis method tests the first: the article's own data must give the article's printed values. [Peng (2011)](#ref-Pen2011a) argues for reproducibility as a minimum standard for judging a claim when full independent replication is not possible. [Buckheit and Donoho (1995)](#ref-BD1995a) argue, after Jon Claerbout, that an article on computational work only advertises the scholarship, the scholarship itself being the software and instructions behind its results. A Pollis method publishes those as a package.

## What a Pollis Method Holds on Disk

A Pollis method is a folder of `~/.pollis/methods`, named after its Package Name. `method.toml` holds the article's link, the input tables and, for each target, where it is published and the Julia call that computes it. The code is `src/NAME.jl`, with module NAME. `targets/` holds the published tables as CSV files, and `inputs/` any tables typed in from the article. `INSTRUCTIONS.md` and `VIGNETTE.md` are notes for a coding agent, and the vignette is a LaTeX file in `vignette/`, with its PDF beside it. A new method has no folder until the first thing is typed or added.

## Why the Article and Its Data Are Only Links

The article and the input data of a Pollis method stay where they are published. The article opens in the integrated browser in an in-memory session, and each linked table is read into memory to be shown, with nothing written to disk, not even a cache. The package's tests download the same links when they run. **Save a Copy...** keeps a copy only when the user asks, outside Pollis, and the copy is then read instead of the link while it exists. Tables typed in from the article are the exception: they are files of the method.

## Step 1: Article and Data

**Article and Data** gathers what a method is computed from and what it must reproduce. **Article Link** sets the article. **Input Tables** are added as an **Empty Table** to type in, from a link, from PollisDatasets or, with **Add from Article**, by a coding agent reading the article. **Target Tables** are the published results, as an **Empty Table**, from CSV files or from the article: row labels in the first column and the values as printed. In the calls, each input table is a variable named after it.

## Step 2: Write a Method

**Write a Method** gives the method its title and the code that reproduces the targets. **Instructions** are notes for a coding agent, such as where in the article the estimator is defined and what to watch for, saved in `INSTRUCTIONS.md` as they are typed. **Write Method** hands the method to the agent, which reads those notes with the links and tables. **Edit method.toml** and **Open Code** open the files for editing by hand.

## Step 3: Write a Vignette

**Write a Vignette** produces the method's documentation, a LaTeX file with its PDF: the problem, the method, the values tested and what is still open. Its **Instructions** are saved in `VIGNETTE.md`: the look, the sections, and the other vignettes to refer to. **Write Vignette** asks the coding agent for it once the method's tests pass, and PollisTeX compiles it. **Edit Vignette** and **Open PDF** appear when it exists, and once the package is registered or installed the vignette shows in Help > Documentation > Package Vignettes.

## Step 4: Prepare for Registration

**Prepare for Registration** is where a method gets its **Package Name**, which names its folder, its Julia package and its module. The name starts with a capital letter and has only letters and digits. The Pollis registry asks for three things: a name of at least 5 characters, a usage example, and a docstring for every exported name. The **Prepare for Registration** button asks the coding agent to check the method against these rules and fix what it can.

## Step 5: Package and Publish

**Package and Publish** runs in a terminal, in three degrees. **Package and Test** makes the package in `~/.pollis/packages`, runs its tests and checks the registry rules. **Package, Test and Push to GitHub** then pushes it, if its tests all pass, to its own public repository under the **GitHub Owner**, with the GitHub CLI signed in. **Package, Test, Push and Register** then registers the pushed package with LocalRegistry.jl, if it meets the registry rules.

## References

<a id="ref-BD1995a"></a>Buckheit, J. B. and Donoho, D. L. (1995). WaveLab and reproducible research. In *Wavelets and Statistics*, ed. A. Antoniadis and G. Oppenheim, 55–81. Springer. [doi:10.1007/978-1-4612-2544-7_5](https://doi.org/10.1007/978-1-4612-2544-7_5)

<a id="ref-GFI2016a"></a>Goodman, S. N., Fanelli, D. and Ioannidis, J. P. A. (2016). What does research reproducibility mean? *Science Translational Medicine* 8(341), 341ps12. [doi:10.1126/scitranslmed.aaf5027](https://doi.org/10.1126/scitranslmed.aaf5027)

<a id="ref-NASEM2019a"></a>National Academies of Sciences, Engineering, and Medicine (2019). *Reproducibility and Replicability in Science*. National Academies Press. [doi:10.17226/25303](https://doi.org/10.17226/25303)

<a id="ref-Pen2011a"></a>Peng, R. D. (2011). Reproducible research in computational science. *Science* 334(6060), 1226–1227. [doi:10.1126/science.1213847](https://doi.org/10.1126/science.1213847)

## See Also
- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md)
