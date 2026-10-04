# Import File

The Import File tab stores a CSV, Parquet or JSON file as a **table** in the database. DuckDB reads the file itself; the data never passes through Julia.

## Construction
```julia
mydb = DBInterface.connect(DuckDB.DB, "mydata.duckdb")   # a database of your own, created if new
DBInterface.execute(mydb, "CREATE OR REPLACE TABLE sales AS SELECT * FROM read_csv('sales.csv')")
DBInterface.execute(mydb, "INSERT INTO sales SELECT * FROM read_csv('sales_2027.csv')")   # append
```

## Readers
- `read_csv` sniffs the delimiter, quoting, header and column types from a sample of rows. Override when it guesses wrong: `read_csv('f.csv', delim = ';', decimal_separator = ',', dateformat = '%d/%m/%Y', nullstr = 'NA')`.
- `read_parquet` uses the types stored in the file; it is the fastest and safest.
- `read_json` reads an array of objects or one object per line.
- All three accept globs, `read_csv('data/*.csv')`, and `.gz` files.

## Replace or Append
**Replace** (`CREATE OR REPLACE TABLE`) drops the old table. **Append** (`INSERT INTO`) adds rows and needs the same columns, in the same order, with compatible types; use `INSERT INTO t BY NAME SELECT ...` to match columns by name instead.

## Strengths and Limits
- Much faster than reading into Julia and saving, and works for files larger than memory.
- Type sniffing uses a sample: a text value late in a numeric column makes the import fail. Raise `sample_size = -1` to scan the whole file, or give `types = {'zip': 'VARCHAR'}`.

## See Also
- [Save Table](save.md) · [Decision Guide](decision-guide.md)
