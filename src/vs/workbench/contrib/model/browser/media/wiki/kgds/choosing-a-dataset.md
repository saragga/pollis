# Choosing a Dataset

Kaggle's metadata makes it easy to judge a dataset before downloading. Weigh usability, size, file type, and licence.

## Usability

Kaggle scores every dataset with a **usability rating** (0–10) that reflects documentation, a clear licence, file formats, and column descriptions. A high rating usually means less cleaning work. The vote and download counts are good popularity signals too.

## Size and file type

| Goal | Look for |
|---|---|
| Quick prototype | A small CSV (a few MB) |
| Tabular modelling | `fileType=csv` or `sqlite` |
| Large / out-of-core | Check `totalBytes`; consider streaming the CSV |

Filter the catalogue by `fileType` to get formats Julia reads natively (CSV via `CSV.jl`, SQLite via `SQLite.jl`).

## Licence

Check `licenseName` before using data in a product. The `license` filter groups the common families: `cc` (Creative Commons / public domain), `gpl`, `odb` (Open Database), and `other`. Permissive (`cc`) is the safest default.

## A quick checklist

1. Search or filter by file type and licence.
2. Sort by votes or hotness to surface well-used datasets.
3. Read the title, subtitle, and usability rating.
4. List the files to confirm the format and size before downloading.

## See Also

- Browsing the Catalogue — search and filter syntax
- Downloading & Loading — getting the files into Julia
