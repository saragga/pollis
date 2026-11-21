# Model Zoo: Factsheet

The columns, the filters and the details of the Model Zoo, the families of its models, and the files it reads, at a glance.

## What Columns Does the Model Zoo Show?

| Column | What it gives |
|---|---|
| Model | The model's name, with its configuration when a benchmark scored several |
| Family | The family of its estimator |
| Method | The method it estimates with, one of those of its family |
| Scored In | The benchmarks and competitions that scored it |
| Datasets | The number of datasets of PollisCompetitions.jl it has published scores on |
| Original | The package the benchmark ran it with, else the code its paper published, and that code's language |
| In Julia | The registered Julia package that has its estimator, or Not Yet |
| Checked | Yes or No: whether that Julia package gives the published scores; empty when no package has the model |

## Which Families Does the Model Catalog Use?

The family of a model's estimator is one of the model types of TabArena [(Erickson and 6 coauthors, 2025)](#ref-EPTHD...2025a), or one of the families the Model Catalog adds for models of other kinds:

| Family | Its models |
|---|---|
| Foundation Model, Tree-based, Neural Network, Baseline, Other | The model types of TabArena |
| Statistical | The classical methods of forecasting and of survival analysis |
| Kernel Methods | Support vector machines, kernel adaptive filtering and feature-learning kernel machines |
| Fuzzy System | Fuzzy rule-based systems, neuro-fuzzy systems, fuzzy time series, fuzzy transforms and association rules |
| Hybrid | Models that combine methods of different kinds; the method names the methods combined |

## What Can Filter By Choose?

| Filter | Its values |
|---|---|
| Family | The families above |
| Method | The methods of the families |
| Scored In | The benchmarks and competitions of PollisCompetitions.jl |
| In Julia | The Julia packages named, and Not Yet |
| Checked | Yes and No |
| Language | The languages of the original packages |

## What Does the Model Zoo Read?

| File of PollisCompetitions.jl | What the page takes from it |
|---|---|
| `metadata/models.toml` | Each model: `model_id`, `model_name`, `estimator_family`, `estimator_method`, `package`, `language`, `julia_package`, `julia_checked`, and its references, each a `bibtex_key` of PollisReferences and a `role` |
| `metadata/benchmarks.toml` | Each published run: `model_id`, `dataset_id`, and `split_protocol`, whose words before the colon name the benchmark or competition that gives Scored In |
| `metadata/datasets.toml` | Each dataset's `dataset_id` and `dataset_name`, for the datasets of Expand |

The papers come from the PollisReferences library of Pollis.

## What Does the Model Zoo Need?

| Need | What |
|---|---|
| Packages | PollisCompetitions.jl on this computer, which Score Models installs when it runs a method |
| Julia | Not needed: the page reads the package's files and runs no code |

## References

<a id="ref-EPTHD...2025a"></a>Erickson, N., Purucker, L., Tschalzev, A., Holzmüller, D., Desai, P., Salinas, D. and Hutter, F. (2025). TabArena: A Living Benchmark for Machine Learning on Tabular Data. In *Advances in Neural Information Processing Systems 38*, 17285–17350. [doi:10.52202/085713-0519](https://doi.org/10.52202/085713-0519)

## See Also

- [Overview](overview.md) · [Where Models Are in Julia](julia-packages.md)
