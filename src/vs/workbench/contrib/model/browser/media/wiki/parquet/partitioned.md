# Partitioned

The **Partitioned** tab of the Parquet Files panel splits a table into a folder of Parquet files, one subfolder per value of a column, and reads the folder back as one table with DuckDB.

## What Is a Partitioned Parquet Dataset?

A partitioned dataset is a folder whose subfolders are named `column=value`, each holding the Parquet files of the rows with that value:

```
data_by_month/
	month=5/data_0.parquet
	month=6/data_0.parquet
	month=7/data_0.parquet
```

The layout is called **Hive partitioning**, after the Apache Hive data warehouse. The partition column is stored in the folder names, not in the files, and the readers of DuckDB, Spark, Polars and Arrow all understand it.

## How Do I Write and Read a Partitioned Dataset with DuckDB?

```julia
DBInterface.execute(con, """
COPY (SELECT * FROM read_parquet('data.parquet'))
TO 'data_by_month' (FORMAT parquet, PARTITION_BY (month), OVERWRITE_OR_IGNORE)
""")
tbl = Tables.columntable(DBInterface.execute(con, """
SELECT * FROM read_parquet('data_by_month/**/*.parquet', hive_partitioning = true)
WHERE month = 7
"""))
```

`PARTITION_BY` takes one column or several, as in `(year, month)`, which nests the folders. With `hive_partitioning = true`, `read_parquet` adds the partition column back from the folder names. `OVERWRITE_OR_IGNORE` lets `COPY` write into a folder that already exists; files of the same name are replaced, and others are left where they are, so a folder written twice from different tables can mix them.

## Why Does a Filter on the Partition Column Read Less?

A condition on the partition column, such as `month = 7`, is checked against the folder names before any file is opened, so DuckDB reads only the matching folders. The **Query Plan** action shows `File Filters` and `Scanning Files` under the Parquet scan, with how many files were read out of how many there are. A filter on any other column still reads every folder, skipping row groups inside each file as usual.

## See Also
- [Write](write.md) · [Query](query.md) · [Decision Guide](decision-guide.md)
