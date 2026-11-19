# Manage Competition Datasets: Factsheet

Manage Competition Datasets, in Compose > Prediction Competitions, shows the Dataset Catalog in two tabs, Datasets and Curated Collections, with a view for each group of fields, filters, sorting, the details of each dataset, and the active datasets that Score Models scores.

## What Columns Does Each View of Manage Competition Datasets Show?

Every view keeps Name on the left, after Active, Model Scoring and Workspace, with Topic as a tag under it, then shows these columns.

| View | Columns after Name |
|---|---|
| Identity | Competition, Year, Collections, Source |
| Data | Data Structure, Geometry, Response Type, Rows, Features, Size (MB) |
| Access and Licence | Delivery, Licence, Source, Contributor |
| Curation | Contributor, Delivery, Licence, Missing Fields, which the view sorts by |

## What Columns Does the Tab Curated Collections Show?

| Column | What it shows |
|---|---|
| Name | The name of the collection |
| Year | The year it was first published |
| Description | What it holds |
| Datasets | The number of datasets of the catalogue it holds |
| Link | Its web page, which opens in the browser of Pollis |

## Which Filters Does Manage Competition Datasets Offer?

| Filter | What it does |
|---|---|
| Filter by: | Chooses a field, Topic, Data Structure, Geometry, Response Type or Delivery, and shows its values to tick under it, each with its number of datasets; None hides them |
| A value ticked | Keeps the datasets with any of the values ticked of that field |
| A tag in a cell | Keeps the datasets with that value of that field |
| A chip | Removes the filter it names |
| Clear Filters | Removes every filter |

## What Can Be Done With a Dataset of Manage Competition Datasets?

| Action | Where | What it does |
|---|---|---|
| Datasets, Curated Collections | The tabs above the table | Show the datasets, or the curated collections |
| Expand, Restore Size | Under the tick of a row | Expand opens the details of the dataset or collection under its row, and Restore Size closes them |
| Active | The first column of the tab Datasets | Makes any dataset active, or not, kept for the next time |
| Model Scoring | The second column of the tab Datasets | Says whether models can be scored on the dataset: Ready, with how in its hover, or Not Yet |
| Workspace | The third column of the tab Datasets | Says whether the dataset is saved in the Pollis Workspace: Not Saved, Saved, or Saved and Changed; No Workspace, with Create Workspace..., when there is none |
| Score Competition Models | Above the table, in the tab Datasets | Opens Score Models, which lists the active datasets on which it can score models, and says which it leaves out |
| Save Active Datasets to Workspace | Above the table, in the tab Datasets | Saves the active datasets whose data are on this computer in `data/forecasting/` of the Pollis Workspace, and says what it saved |
| Add a Dataset... | Above the table, in the tab Datasets | Opens a form that converts a table of your own, a row for each observation, into `data/forecasting/<id>/` of the Pollis Workspace |
| Edit Facts | The details of a dataset added with Add a Dataset | Opens the form filled with the dataset's facts, to convert its file again |
| Save to Workspace | The details of a dataset of PollisCompetitions.jl whose data are on this computer | Saves the dataset in `data/forecasting/` of the Pollis Workspace |
| Open in Score Models | The details of a competition that Score Models runs, or of a dataset you added | Makes the dataset active and opens that page, which lists it |
| Source | A cell or the details | Opens the page the data come from in the browser of Pollis |
| Papers | The details of a dataset or a collection | Shows the full references of the works that describe it |
| A dataset of a collection | The details of a collection | Shows the dataset in the tab Datasets, with its details open |
| Rows per page | Under the table | Shows 20, 40, 100 or all the rows at a time, kept for the next time |

## What Does Manage Competition Datasets Need?

The schema of the catalogue ships with Pollis; the datasets of PollisCompetitions.jl are read from the package on this computer, so listing them needs the package installed, and no Julia session. Installed toolboxes add their own datasets. Running a method on a competition needs Score Models. Saving datasets, or adding one of your own, needs a Pollis Workspace, which Save to Workspace and Add a Dataset offer to create or open, and a dataset of PollisCompetitions.jl is saved when its data are on this computer, built in with the package or downloaded. Adding a dataset of your own needs no Julia: Pollis converts the file with its own DuckDB. When a contributor's file has problems, such as a value outside its field's vocabulary or a reference that is not a work of PollisReferences, the page lists them above the table, each naming the contributor, the dataset and the field, and shows the datasets all the same.

## See Also

- [Overview](overview.md) · [Fields and Vocabularies](fields-vocabularies.md) · [Licences and Delivery](licences-delivery.md)
