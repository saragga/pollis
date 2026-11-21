# Model Zoo: Overview

The Model Zoo lists the models that the benchmarks and competitions of PollisCompetitions.jl scored, from the package's Model Catalog, and says where each model is in Julia. The page is in Compose > Prediction Challenges > Model Zoo. Its rows come from the files of the PollisCompetitions.jl installed on this computer, read each time the page opens, so a newer version of the package brings its models with it.

## What Does the Model Zoo List?

The Model Zoo has a row for each model of the Model Catalog of PollisCompetitions.jl. A model is an estimator in one configuration: when a benchmark scored a model with its default settings, tuned, and tuned and ensembled, each configuration is a model of its own, with its own row and its own published scores. For each model, the row gives its family and method, the benchmarks and competitions that scored it, the number of datasets it was scored on, the package and language the benchmark ran it with, and where it is in Julia. The count above the table gives the models shown and the models in all, how many of them a Julia package has, and how many of those were checked against the published scores; its hover gives the version of PollisCompetitions.jl read.

## How Do I Find a Model in the Model Zoo?

**Search** keeps the models whose name holds every word typed. **Filter by** chooses a column, Family, Method, Scored In, In Julia, Checked or Language, and shows its values, each with the number of models that have it, to tick those to keep; a value shown as a tag in a cell filters by it when clicked. Each value ticked shows as a chip under the controls, which removes it when clicked, and **Clear Filters** removes them all. Values of the same column keep the models that have any of them; values of different columns keep the models that have one of each. A column heading sorts the rows, and a second click reverses the order; the models without a value come last. The rows are shown a page at a time, as many as chosen under the table.

## What Do the Columns In Julia and Checked Say?

**In Julia** names the registered Julia package that has the model's estimator, in yellow, or says Not Yet when no registered package has it. **Checked** says Yes when that package, run on the splits of the benchmark that scored the model, gives the scores the benchmark published, and No when the package has the same estimator but has not been checked against them; it is empty for a model that no package has. The rules that decide which package In Julia names are in [Where Models Are in Julia](julia-packages.md).

## What Does Expand Show for a Model?

**Expand**, in the first column of a row, opens the model's details under it, and **Restore Size** closes them again. **Papers** lists the works of the model from PollisReferences, each with its role, Methodology for the paper that describes the method and Software for the package or code that runs it, with its authors, year, title, venue and a link to its DOI. **Datasets It Was Scored On** gives the names of the datasets of PollisCompetitions.jl on which the model has published scores, sorted by name.

## How Does the Model Zoo Relate to Score Models and Manage Challenge Datasets?

The three pages of Compose > Prediction Challenges read the same package. Manage Challenge Datasets lists the datasets of PollisCompetitions.jl and the curated collections that hold them. Score Models runs a method of your own on those datasets and ranks it among the published runs of the models scored on them. The Model Zoo lists those models, so that a model your method is ranked beside can be looked up: its family and method, its papers, the other datasets it was scored on, and the Julia package to run it with.

## See Also

- [Factsheet](factsheet.md) · [Where Models Are in Julia](julia-packages.md)
