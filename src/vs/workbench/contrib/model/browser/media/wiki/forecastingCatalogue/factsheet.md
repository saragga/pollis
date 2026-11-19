# Manage Competition Datasets: Factsheet

Manage Competition Datasets, in Compose > Prediction Competitions, shows the forecasting catalogue that ships with Pollis in two tabs, Datasets and Curated Collections, with a view for each group of fields, filters, sorting, the details of each entry, and the active datasets that Score Models scores.

## What Columns Does Each View of Manage Competition Datasets Show?

Every view keeps Name on the left, after Active and Workspace in the tab Datasets, with Type and Domain as tags under it, then shows these columns.

| View | Columns after Name |
|---|---|
| Identity and Provenance | Organiser, Platform, Start Year, End Year, Reference, DOI, Web Page, Derived From, Collections |
| Access and Licence | Source, Package, Package Id, Delivery, Status, Licence, Access, Platform |
| Data Structure | Series, Median Length, Frequency, Data Span, Structure, Covariates, Value Types, Data Challenges |
| Task and Evaluation | Horizon, Forecast Type, Metrics, Split Protocol, Decision-Focused |
| Reference Results | Winner, Winning Score, Baselines, Public Leaderboard, Public Forecasts |
| Practical Footprint | Size, Download Size, Disk Size, Memory, Compute |
| Pedagogy | Course Level, Compute, Size, Teaches |
| Curation | Source, Package, Delivery, Status, Licence, To Check, Missing Fields, which the view sorts by |

## Which Filters Does Manage Competition Datasets Offer?

| Filter | What it does |
|---|---|
| Filter by: | Chooses a field, Type, Domain, Era, Frequency, Forecast Type, Package, Delivery, Status, Course Level or Size, and shows its values to tick under it, each with its number of entries; None hides them |
| A value ticked | Keeps the entries with any of the values ticked of that field |
| A tag in a cell | Keeps the entries with that value of that field, for any field shown as tags |
| A chip | Removes the filter it names |
| Clear Filters | Removes every filter |

## What Can Be Done With an Entry of Manage Competition Datasets?

| Action | Where | What it does |
|---|---|---|
| Datasets, Curated Collections | The tabs above the table | Show the datasets and competitions, or the curated collections |
| Expand, Restore Size | Under the tick of a row | Expand opens the details of the entry under its row, and Restore Size closes them |
| Active | The first column of the tab Datasets | Makes any dataset active, or not, kept for the next time |
| Model Scoring | The second column of the tab Datasets | Says whether models can be scored on the dataset: Ready, with how in its hover, or Not Yet |
| Workspace | The third column of the tab Datasets | Says whether the dataset is saved in the Pollis Workspace: Not Saved, Downloading, Saved, or Saved and Changed; No Workspace, with Create Workspace..., when there is none |
| Score Competition Models | Above the table, in the tab Datasets | Opens Score Models, which lists the active datasets on which it can score models, and says which it leaves out |
| Save Active Datasets to Workspace | Above the table, in the tab Datasets | Saves the active datasets that Pollis downloads in `data/forecasting/` of the Pollis Workspace, and says what it saved |
| Add a Dataset... | Above the table, in the tab Datasets | Opens a form that converts a table of your own, a row for each observation, into `data/forecasting/<id>/` of the Pollis Workspace |
| Edit Facts | The details of a dataset added with Add a Dataset | Opens the form filled with the dataset's facts, to convert its file again |
| Save to Workspace | The details of an implemented competition of PollisCompetitions.jl | Saves the dataset in `data/forecasting/` of the Pollis Workspace, downloading it first when it is not on this computer |
| Web Page, DOI | A cell or the details | Opens the address in the browser of Pollis |
| Papers | The details | Shows the full references of the works that describe the entry |
| Open in Score Models | The details of an implemented competition of PollisCompetitions.jl | Makes the dataset active and opens that page, which lists it |
| Rows per page | Under the table | Shows 20, 40, 100 or all the rows at a time, kept for the next time |

## What Does Manage Competition Datasets Need?

The schema of the catalogue ships with Pollis, and so does a copy of the entries of PollisCompetitions.jl, so the page needs no Julia, no package and no connection to browse it; links open in the browser of Pollis. Installed toolboxes add their own entries. Running a forecasting method on a competition needs Score Models, which installs PollisCompetitions.jl and downloads the competition's data on the user's computer. Saving datasets, or adding one of your own, needs a Pollis Workspace, which Save to Workspace and Add a Dataset offer to create or open, and a dataset not yet downloaded needs Julia and PollisCompetitions.jl. Adding a dataset of your own needs no Julia: Pollis converts the file with its own DuckDB. When a contributor's file has problems, such as a value outside its field's vocabulary, the page lists them above the table, each naming the contributor, the entry and the field, and shows the entries all the same.

## See Also

- [Overview](overview.md) · [Fields and Vocabularies](fields-vocabularies.md) · [Licences and Delivery](licences-delivery.md)
