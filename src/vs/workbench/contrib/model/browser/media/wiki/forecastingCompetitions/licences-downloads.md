# Licences and Downloads

Score Models scores a method on the data of a dataset that is on this computer: built in with PollisCompetitions.jl, downloaded by the user, or added to the Pollis Workspace. The same rule holds for every dataset.

## Where Do the Data of a Dataset Come From?

The Dataset Catalog of PollisCompetitions.jl records, for each dataset, where its data come from (`source_url`), their licence (`licence`) and how they reach this computer (`delivery`): Built-in, when the package ships them, or Download, when the user fetches them from their source. Manage Challenge Datasets shows these fields in the details of each dataset. Many of the built-in forecasting datasets come from the Monash Time Series Forecasting Archive, on Zenodo [(Godahewa, Bergmeir, Webb, Hyndman and Montero-Manso, 2021)](#ref-GBWHM2021a), which gives each series with the values the forecasters saw and the values the forecasts are scored on.

## Where Are the Data of a Dataset Kept?

PollisCompetitions.jl keeps the data of a dataset as Parquet tables, in one folder for each dataset, named by its `dataset_id`: `data/builtin/<id>` of the package for a dataset built in with it, else `~/.pollis/competitions/<id>` for one downloaded. The `info.toml` of that folder, which the dataset's reader writes, gives its name, its format and, for a forecasting dataset, its frequencies. Score Models lists a forecasting dataset once that folder has an `info.toml` of the format `monash` that gives its frequencies, and a tabular or survival dataset once it has an `info.toml` of the format `tabular` that names its target and gives its repeats and folds, with `data.parquet` and `splits.parquet`. A dataset you added is kept in `data/forecasting/<id>` of the Pollis Workspace.

## How Large Are the Data?

The field `size_mb` of the Dataset Catalog gives the size of a dataset: of its Parquet files for a built-in dataset, and of the files the user downloads, compressed or not, for a Download dataset. Manage Challenge Datasets shows it in the column Size (MB).

## References

<a id="ref-GBWHM2021a"></a>Godahewa, R., Bergmeir, C., Webb, G. I., Hyndman, R. J. and Montero-Manso, P. (2021). Monash Time Series Forecasting Archive. arXiv. [doi:10.48550/arXiv.2105.06643](https://doi.org/10.48550/arXiv.2105.06643)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [The Error Measures](error-measures.md) · [Tabular and Survival Measures](tabular-survival-measures.md) · [Scoring a Method](scoring-method.md)
