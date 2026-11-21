# Where Models Are in Julia

The column In Julia of the Model Zoo names, for each model, the registered Julia package that has its estimator, and Checked says whether that package gives the model's published scores. The same rules decide the package for every model, whichever benchmark or competition scored it.

## Which Julia Package Does In Julia Name?

In Julia names a registered Julia package that has the model's estimator in one of two ways: written in Julia, or bound to the same compiled library that the original package runs, as a Julia package that calls the C, C++ or Fortran library of a gradient-boosting or penalized-regression package runs the same code as the R and Python packages that call it. The package is named by its registered name, with `.jl`. When no registered package has the estimator in either way, the column says Not Yet. The Model Catalog of PollisCompetitions.jl records the package as `julia_package` and the check as `julia_checked`, which the view `model_comparisons` of its database gives beside each published score.

## Why Is a Julia Package That Runs Python Not Named?

A Julia package that calls a Python library, through PyCall.jl or PythonCall.jl, runs the model in Python: it needs a Python environment with that library installed, and the estimator's code is the Python package's. Such a package is not named in In Julia, so that the column says where the model's estimator runs in Julia itself. A model whose only Julia route is a package of this kind shows Not Yet.

## Is the Package Named for Every Configuration of a Model?

Yes. The default, tuned, and tuned and ensembled configurations of a model share its estimator, so the package that has the estimator is named for each of them. The package gives the estimator; the search over its settings and the ensembling of the configurations a benchmark ran are not part of it, and are written with it, for example with the tuning tools of MLJ.jl.

## What Does Checked Say?

Checked is Yes when the Julia package, run on the splits of the benchmark that scored the model, with the model's settings, gives the scores the benchmark published. It is No when the package has the same estimator but has not been checked against the published scores. The same estimator can give different scores through its defaults, the handling of the data before it is fitted, or the random numbers of its fitting, so a check runs the package on the benchmark's own splits and compares its scores with the published ones, model by model.

## What Is ModelZoo.jl?

ModelZoo.jl is the Julia package of Pollis for the models of the Model Catalog that no registered package has. Each of its models is written from its paper and the documented behaviour of the benchmark that scored it, and is checked against the benchmark's published scores on the datasets and splits of PollisCompetitions.jl. In Julia names it as ModelZoo.jl. The package also holds the measures by which Score Models scores tabular and survival datasets, which PollisCompetitions.jl uses.

## When Does In Julia Name PollisCompetitions.jl?

PollisCompetitions.jl holds the statistical benchmarks of forecasting that Score Models computes beside a method of your own: Naive, sNaive, Naive2, SES, Holt, Damped, Theta and Com. A model of the Model Catalog that is one of these benchmarks names PollisCompetitions.jl in In Julia, as the package computes it on the same series.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md)
