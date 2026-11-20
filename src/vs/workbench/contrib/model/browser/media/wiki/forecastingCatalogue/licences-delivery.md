# Manage Challenge Datasets: Licences and Delivery

Two fields of a dataset of Manage Challenge Datasets say how its data may reach a Pollis user: Licence, the terms under which the data may be used, and Delivery, the way they reach the user. Source gives the page the data come from.

## What Is the Difference Between Built-in and Download?

| Delivery | How the data reach the user | When it fits |
|---|---|---|
| `Built-in` | They come with PollisCompetitions.jl, as Parquet files in `data/builtin/<id>` of the package, ready to load | Data whose licence allows passing them on, whose files take under 10 MB, and that can be scored as they stand |
| `Download` | The user fetches them from their source, on their own computer, into `~/.pollis/competitions/<id>` | Data whose licence does not allow passing them on, whose files are larger, or that cannot be scored as they stand |

Either way, the folder of a dataset holds `info.toml` once its data are on this computer, and that is how Manage Challenge Datasets knows that Save to Workspace can copy them.

## When Are Kaggle Data Built In?

The data of a competition held on Kaggle are given under the rules of that competition, which generally do not allow passing them on. A user downloads them from Kaggle with their own account, after accepting the rules, and the dataset has the Delivery `Download`. Data that are also published elsewhere under a licence that allows passing them on are built in as any other: those of the Amazon.com Employee Access Challenge and of Predicting a Biological Response, which OpenML publishes in the public domain, among them.

## What Does the Licence of a Dataset Say?

The Licence is the licence under which the data are published, as their source states it, such as CC BY 4.0, with the place it was taken from when the data reach Pollis through another archive, as "CC BY 4.0 (via the Monash archive on Zenodo)". A dataset with no Licence has none recorded in the catalogue.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Fields and Vocabularies](fields-vocabularies.md)
