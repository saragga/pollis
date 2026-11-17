# Manage Competition Datasets: Licences and Delivery

Three fields of an entry of Manage Competition Datasets say how its data could reach a Pollis user: Package, the Pollis package that lists the entry; Delivery, the way the data reach the user; and Status, whether that way is ready. Two more, Licence and Access, say under which terms the data may be used and what a user needs to get them.

## What Is the Difference Between Bundled, Download Helper and Online Only?

| Delivery | How the data reach the user | When it fits |
|---|---|---|
| `bundled` | They come inside a Pollis package, ready to load | Small data whose licence allows passing them on |
| `download_helper` | A function of the package fetches them from their source, on the user's computer | Data that may not be passed on, or are too large to ship |
| `online_only` | They stay at their source, which the user visits | Data that need an account, a credential or a live service |

Delivery `bundled` is a plan until the licence of the data is confirmed, and only PollisDatasets.jl may bundle data. An entry with no Delivery has not been decided yet.

## Why Does PollisCompetitions.jl Ship No Data?

PollisCompetitions.jl, which lists the competitions and the archives of forecasts, ships none of their data. Each file is downloaded from its source and checked against the SHA-256 that the package's catalogue records for it, so that every user scores methods against the same data, and the terms of each source are kept: where the data were published, by whom, and with which licence. The entries of PollisCompetitions.jl are therefore never bundled, and the check of the catalogue reports one that is.

## Why Are Kaggle Data Never Bundled?

The data of a competition held on Kaggle are given under the rules of that competition, which generally do not allow passing them on. A user downloads them from Kaggle with their own account, after accepting the rules, and a download helper for such an entry uses the Kaggle API with that account. An entry held on Kaggle therefore has the Delivery `download_helper` and, as its Access, the rules of the competition.

## What Do Planned and Implemented Mean?

Status `planned` means that the entry is listed in a package's plans, with its Delivery chosen, but the package cannot get its data yet. Status `implemented` means that the package's catalogue has the entry, with its files, and fetches them; an implemented entry names its id in that catalogue in Package Id. The implemented competitions of PollisCompetitions.jl are those that Score Forecasting Models runs, and their details offer **Open in Score Forecasting Models**.

## What Does To Check Mean in an Entry?

To Check lists the facts of an entry that are given, or expected, but not yet checked against their primary source: most often the licence, the number of series, a DOI, a web page or the access required. A field named there is shown under its label, and other facts by their names. To Check is not a list of the fields an entry lacks: those are counted from the schema, in the column Missing Fields of the Curation view.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Fields and Vocabularies](fields-vocabularies.md)
