# Manage Competition Datasets: Fields and Vocabularies

Every dataset of Manage Competition Datasets is a `[[datasets]]` table of fields, each declared in the schema of the catalogue with its label on the page, its group, its type and its vocabulary. The groups are those of the views: Identity, Data, and Access and Licence. The tables below give, for each field, its name in the file, its label on the page, its type and the values it may take.

## Which Fields Are Controlled in Manage Competition Datasets?

A controlled field takes only the values of its vocabulary, so that the datasets can be filtered and compared by them: Topic, Data Structure, Geometry, Response Type and Delivery. A free field holds any text, such as the Licence, or a number. A field a dataset does not have is unknown, and loads as missing in the database of PollisCompetitions.jl; nothing is filled in by guesswork, and the Curation view counts the fields each dataset lacks. Every dataset has `dataset_id`, `dataset_name` and `topic`.

## What Are the Identity Fields of a Dataset?

The identity fields say what the dataset is, where it comes from and what it is about. A dataset made for a competition names it, with its year; a dataset published for research has neither.

| Field | Label | Type | Values | Meaning |
|---|---|---|---|---|
| `dataset_id` | Id | string | Free text | The key of the dataset |
| `dataset_name` | Name | string | Free text | The name of the dataset |
| `competition_name` | Competition | string | Free text | The competition the dataset comes from |
| `competition_year` | Year | integer | A whole number | The year of the competition |
| `topic` | Topic | string | `General`, `Socioeconomics`, `Retail`, `Marketing`, `Supply Chain`, `Finance`, `Macroeconomics`, `Real Estate`, `Energy`, `Environment and Climate`, `Hydrology`, `Transport and Mobility`, `Tourism`, `Epidemiology`, `Health`, `Biology`, `Chemistry`, `Engineering`, `Physics`, `Web and IT Operations`, `Anomaly Detection`, `Geopolitics` | The subject of the dataset |
| `collections` | Collections | string[] | Ids of curated collections | The curated collections that hold the dataset |
| `papers` | Papers | string[] | Keys of PollisReferences | The references of the dataset |

The page sets Collections and Papers; a dataset's file does not give them as fields. Collections are those of the tab Curated Collections that name the dataset among theirs. Papers are the keys of the dataset's references, its `[[datasets.references]]` tables, each with a `bibtex_key`, the key of a work of PollisReferences, and, when it is given, a `role`: `Primary`, `Competition`, `Benchmark` or `Other`. The page checks that every key is a work of PollisReferences, and the details of a dataset show each as a full reference.

## What Are the Data Fields of a Dataset?

The data fields say how the data are shaped, what spatial information they carry and what the models predict.

| Field | Label | Type | Values | Meaning |
|---|---|---|---|---|
| `data_structure` | Data Structure | string | `Cross-section`, `Time-Series`, `Panel` | Cross-section, time series, or panel, spatial panels and multi-level longitudinal data included |
| `geometry` | Geometry | string | `None`, `Spatial Weights Matrix`, `Coordinates`, `Polygons` | The spatial information the dataset has, from the poorest to the richest |
| `response_type` | Response Type | string | `Binary`, `Multiclass`, `Ordered`, `Count`, `Survival`, `Regression` | The kind of the response the models predict |
| `rows` | Rows | integer | A whole number | The rows of the data as stored; for a panel, one for each unit and time |
| `features` | Features | integer | A whole number | The columns other than the response and the identifiers |
| `size_mb` | Size (MB) | number | A number | The size of its Parquet files for a `Built-in` dataset, or of the compressed files the user downloads for a `Download` dataset, in MB |

A Response Type of `Binary` or `Multiclass` is a classification task, `Ordered` one whose classes are ranked, `Count` one whose response counts events, `Survival` one whose response is the time to an event, and `Regression` one whose response is a number, as the values of a forecast series are.

## What Are the Access and Licence Fields of a Dataset?

The access fields say under which terms the data may be used, how they reach the user, and who contributes the dataset.

| Field | Label | Type | Values | Meaning |
|---|---|---|---|---|
| `licence` | Licence | string | Free text | The licence of the data |
| `delivery` | Delivery | string | `Built-in`, `Download` | Built-in, shipped with PollisCompetitions.jl, or Download, fetched by the user |
| `source_url` | Source | string | A web address | Where the data come from |
| `source` | Contributor | string | Set by the page | Who contributes the dataset: PollisCompetitions.jl, an installed toolbox, or the Pollis Workspace for a dataset of your own |

[Licences and Delivery](licences-delivery.md) says what Built-in and Download mean.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Licences and Delivery](licences-delivery.md)
