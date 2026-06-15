# Choosing a Dataset

A good dataset choice balances task fit, size, licence, and split layout. Use the catalogue's metadata to decide before you download anything.

## Task fit

Filter by `task_categories` to narrow the catalogue to datasets labelled for your problem (e.g. `text-classification`, `summarization`, `automatic-speech-recognition`). Then read the **dataset card** to confirm the columns and label scheme match what you need.

## Size

The `size_categories` tag (e.g. `1K<n<10K`, `1M<n<10M`) gives a rough scale. For exact counts, read `/api/datasets/<id>` or list the Parquet shards — many small shards usually mean a large dataset.

| Goal | Pick |
|---|---|
| Quick prototype | A small split, or slice `train[1:1000]` |
| Full training | The complete `train` split via Parquet shards |
| Evaluation only | The `test` / `validation` split |

## Licence

Check the `license` tag (`mit`, `apache-2.0`, `cc-by-4.0`, ...) before using data in a product. Some datasets are **gated** and require accepting terms on the Hub first — those need a token (see *Authentication*).

## Splits

Confirm the dataset provides the splits you expect. If it ships only a `train` split, hold out your own validation/test partition with `train[1:n]` style slicing.

## A quick checklist

1. Search or filter by task.
2. Open `/api/datasets/<id>` and read tags, licence, and downloads.
3. Confirm the splits and features in the dataset card.
4. Load a small slice first to sanity-check the fields.

## See Also

- Browsing the Hub — search and filter syntax
- Dataset Info — reading metadata for one dataset
