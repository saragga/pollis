# Manage Competition Datasets: Fields and Vocabularies

Every entry of Manage Competition Datasets is a record of fields, each declared in the schema of the catalogue with its label on the page, its group, its type and its vocabulary. The groups are those of the views: Identity and Provenance, Access and Licence, Data Structure, Task and Evaluation, Reference Results, Practical Footprint, Pedagogy and Curation. The tables below give, for each field, its name in the catalogue file, its label on the page, its type and the values it may take.

## Which Fields Are Controlled in Manage Competition Datasets?

A controlled field takes only the values of its vocabulary, so that the entries can be filtered and compared by them: Type, Domain, Era, Frequency, Structure, Forecast Type, Data Challenges, Value Types, Covariates, Split Protocol, Size, Compute, Course Level, Package, Delivery and Status. The page shows their values with spaces in place of underscores, as `download_helper` shows as download helper. A free field holds any text, such as the Organiser or the Metrics, or a number or Yes and No. Finer detail of a controlled field goes in its companion detail field: Frequency Detail, Forecast Detail and Challenge Detail. A field an entry does not have is unknown or does not apply to it; nothing is filled in by guesswork, and the Curation view counts the fields each entry still lacks.

## What Are the Identity Fields of an Entry?

The identity fields say what the entry is, where it belongs and when it ran. A competition has a start and an end year; a live competition or an archive still running has no end year.

| Field | Label | Type | Values | Meaning |
|---|---|---|---|---|
| `id` | Id | string | Free text | Unique key |
| `name` | Name | string | Free text | Display name |
| `type` | Type | string | `competition`, `live_competition`, `dataset`, `benchmark_suite`, `forecast_archive` | Kind of entry |
| `domain` | Domain | string | `general`, `retail`, `supply_chain`, `finance`, `macroeconomics`, `real_estate`, `energy`, `environment_climate`, `hydrology`, `transport_mobility`, `tourism`, `epidemiology`, `health_clinical`, `engineering_prognostics`, `physics_nonlinear`, `web_it_operations`, `anomaly_detection`, `judgmental_geopolitical` | Application domain |
| `subdomain` | Subdomain | string | Free text | Finer domain |
| `era` | Era | string | `pre-2000`, `2000-2014`, `2015-2022`, `2023+` | Period of the start year, to filter the entries by: before 2000, 2000 to 2014, 2015 to 2022, or 2023 on |
| `start_year` | Start Year | integer | A whole number | Year the competition or data release started |
| `end_year` | End Year | integer | A whole number | Year it ended (absent if ongoing) |

## What Are the Provenance Fields of an Entry?

The provenance fields say who made the entry and where it is described. Papers are keys of PollisReferences, which the details of an entry show as full references; Derived From and Related name other entries of the catalogue, and Collections names the curated collections, entries of type `benchmark_suite`, that hold the entry.

| Field | Label | Type | Values | Meaning |
|---|---|---|---|---|
| `organiser` | Organiser | string | Free text | Organiser or publisher |
| `platform` | Platform | string | Free text | Hosting platform (Kaggle, DrivenData, ...) |
| `reference` | Reference | string | Free text | Canonical reference |
| `doi` | DOI | string | Free text | DOI of the canonical reference |
| `url` | Web Page | string | Free text | Main web page |
| `papers` | Papers | string[] | PollisReferences keys | References as keys of PollisReferences |
| `parent` | Derived From | string | entry id | Entry this one is derived from |
| `related` | Related | string[] | entry ids | Related entries |
| `collections` | Collections | string[] | ids of curated collections | Curated collections that hold the entry |

## What Are the Access and Licence Fields of an Entry?

The access fields say who contributes the entry, which Pollis package downloads it, how its data reach the user, whether that is done yet, and under which terms the data may be used. The Licences and Delivery wiki explains the three values of Delivery and the two of Status.

| Field | Label | Type | Values | Meaning |
|---|---|---|---|---|
| `package` | Package | string | `PollisDatasets`, `PollisCompetitions` | Pollis package that downloads the entry; none for a dataset added from a file of your own |
| `package_id` | Package Id | string | id in the package's own catalogue | Key linking to the package catalogue (files, URLs, SHA-256) |
| `delivery` | Delivery | string | `bundled`, `download_helper`, `online_only` | How the data reaches the user |
| `status` | Status | string | `planned`, `implemented` | Whether package and delivery are already implemented |
| `source` | Source | string | set by the page | Who contributes the entry: PollisCompetitions.jl, an installed toolbox, or the Pollis Workspace for a dataset of your own |
| `licence` | Licence | string | SPDX id where possible | Data licence |
| `access` | Access | string | Open, registration, credentialed or the rules of a Kaggle competition, with any detail | Access requirements |

## What Are the Series and Frequency Fields of an Entry?

These fields of the Data Structure group describe the series themselves: how many there are, how long they are, how often they are observed, the period they cover and how they are organised. The length fields are meant to be filled from the data once a download helper reads them.

| Field | Label | Type | Values | Meaning |
|---|---|---|---|---|
| `n_series` | Series | integer | A whole number | Number of series |
| `length_min` | Shortest Series | integer | A whole number | Shortest series length (observations) |
| `length_median` | Median Length | integer | A whole number | Median series length |
| `length_max` | Longest Series | integer | A whole number | Longest series length |
| `frequency` | Frequency | string[] | `sub-hourly`, `hourly`, `daily`, `weekly`, `monthly`, `quarterly`, `yearly`, `irregular`, `other` | Sampling frequency |
| `frequency_detail` | Frequency Detail | string | Free text | Exact frequency where finer than the vocabulary |
| `data_span` | Data Span | string | Free text | Calendar period covered by the data |
| `structure` | Structure | string[] | `univariate`, `univariate_collection`, `panel`, `hierarchical`, `multivariate`, `spatiotemporal`, `graph`, `gridded`, `cross_sectional`, `multimodal_text` | Structure of the data |
| `hierarchy_levels` | Hierarchy Levels | integer | A whole number | Number of aggregation levels, if hierarchical |

## What Are the Covariate and Data Challenge Fields of an Entry?

These fields of the Data Structure group describe what comes with the series and what makes them hard to forecast. Static covariates do not change over time; known-future covariates, such as calendars, prices set in advance or weather forecasts, are known over the horizon; observed covariates are known only up to the forecast origin.

| Field | Label | Type | Values | Meaning |
|---|---|---|---|---|
| `covariates_static` | Static Covariates | string[] | Free text | Static attributes (store, item, location metadata) |
| `covariates_known_future` | Known-Future Covariates | string[] | Free text | Covariates known over the horizon (calendar, prices, promotions, weather forecasts) |
| `covariates_observed` | Observed Covariates | string[] | Free text | Covariates observed only up to the forecast origin |
| `covariate_richness` | Covariates | string | `none`, `calendar`, `some`, `rich` | Summary of covariates |
| `value_types` | Value Types | string[] | `continuous`, `count`, `intermittent`, `bounded`, `proportion`, `binary` | Type of target values |
| `data_challenges` | Data Challenges | string[] | `intermittency`, `censoring`, `missing_values`, `irregular_sampling`, `structural_breaks`, `anonymised_features`, `heavy_tails`, `outliers`, `leakage`, `multiple_seasonality`, `nonstationarity`, `aggregation_choice`, `negative_values` | Data-quality challenges |
| `data_challenges_detail` | Challenge Detail | string | Free text | Specific events or details |

## What Are the Task and Evaluation Fields of an Entry?

The task fields say what is forecast and how the forecasts are judged. A point forecast is one value for each step of the horizon; an interval, quantiles or a whole distribution describe its uncertainty; an event probability is the chance that an event happens; a ranking orders assets or items; a decision, such as an order or a portfolio, is judged by what it costs or earns. Decision-Focused marks the entries judged by costs or returns rather than by accuracy.

| Field | Label | Type | Values | Meaning |
|---|---|---|---|---|
| `horizon` | Horizon | string | Free text | Forecast horizon |
| `forecast_type` | Forecast Type | string[] | `point`, `interval`, `quantile`, `distributional`, `event_probability`, `ranking`, `decision`, `classification` | What is forecast |
| `forecast_type_detail` | Forecast Detail | string | Free text | Exact target where task-specific |
| `metrics` | Metrics | string[] | Free text | Official metric(s) |
| `split_protocol` | Split Protocol | string | `single_holdout`, `public_private_holdout`, `rolling_origin`, `live`, `simulation`, `none` | Evaluation protocol |
| `decision_focused` | Decision-Focused | boolean | Yes or No | Evaluated on decisions or costs rather than accuracy |

## What Are the Reference Results Fields of an Entry?

The results fields record what is known of how the entry ended: the winning method and its score, the simple baselines with published results, and whether the final leaderboard and the submitted forecasts are public.

| Field | Label | Type | Values | Meaning |
|---|---|---|---|---|
| `winner` | Winner | string | Free text | Winning method |
| `winner_score` | Winning Score | string | Free text | Winning score in the official metric |
| `baselines` | Baselines | string[] | Free text | Simple baselines with published results |
| `leaderboard_public` | Public Leaderboard | boolean | Yes or No | Final leaderboard publicly available |
| `forecasts_public` | Public Forecasts | boolean | Yes or No | Submitted forecasts publicly available |

## What Are the Practical Footprint Fields of an Entry?

The footprint fields say how large the data are and what computer they need. Download Size, Disk Size and Memory are meant to be filled by the download helpers; Size and Compute are classes for comparing entries at a glance.

| Field | Label | Type | Values | Meaning |
|---|---|---|---|---|
| `size_class` | Size | string | `small`, `medium`, `large`, `very_large` | Size class |
| `download_size` | Download Size | string | A size, such as "350 MB" | Compressed download size |
| `disk_size` | Disk Size | string | A size, such as "1.2 GB" | Size on disk after extraction |
| `memory` | Memory | string | A size, such as "8 GB" | Approximate memory needed to load and model |
| `compute` | Compute | string | `laptop`, `workstation`, `cluster` | Compute class |

## What Are the Pedagogy and Curation Fields of an Entry?

The pedagogy fields suggest where an entry fits in teaching: a course level, the one point it teaches best and its known pitfalls. The curation fields hold notes and the facts To Check, those still to be checked against their primary source.

| Field | Label | Type | Values | Meaning |
|---|---|---|---|---|
| `course_level` | Course Level | string | `intro`, `intermediate`, `advanced`, `research` | Suggested course level |
| `teaches` | Teaches | string | Free text | One-line teaching point |
| `pitfalls` | Pitfalls | string | Free text | Known pitfalls |
| `notes` | Notes | string | Free text | Notes |
| `verify` | To Check | string[] | field names or facts | Facts to check against the primary source |

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Licences and Delivery](licences-delivery.md)
