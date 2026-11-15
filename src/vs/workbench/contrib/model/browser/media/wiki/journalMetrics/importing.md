# Journal Metrics — Importing Metrics and Using Them

## Downloading the File of Each Source
Each imported source has its own download, which **Download Page** on its card opens:

| Source | What to download |
|---|---|
| SCImago (SJR) | Journal Rankings, a year chosen with subject area and country at All, then Download data: a file a year, scimagojr YYYY.csv |
| CWTS (SNIP) | Downloads, then the Excel file of all the indicators, every year since 1999 in one file, released each spring |
| ABDC | The Excel file of the latest list, near the top of the page; its first sheet is the latest edition |
| Scopus (CiteScore) | Sources, signed in, then the download of the source list with its CiteScore metrics, an Excel file |
| Journal Citation Reports | Journals, filtered by category if you want only some, then Export, as CSV or Excel |

An export of Journal Citation Reports holds a limited number of rows: for more journals, export one category at a time and import each file.

## Importing a File and the Year of Its Metrics
**Import File...** asks for a CSV or Excel file and recognises its source from its columns. Pollis keeps a copy of the rows in its own folder of journal metrics, and a notification says how many rows were imported. The year of the metrics comes from the file's rows, or else from its name, which is why a SCImago file should keep the name scimagojr YYYY.csv; when neither gives a year, Pollis asks for it. The CWTS file is large and takes a minute or two. Several files of one source can be imported, such as a SCImago file for each year, and each is listed under the source's card with **Remove**.

## How Pollis Keeps the Metrics
The metrics you import stay on your computer: the licences of these sources let you keep a copy for your own use, not Pollis share one, so Pollis never sends them anywhere. **Remove** deletes Pollis's copy of a file's metrics; the file you downloaded stays where it is, to import again. The Norwegian Register and OpenAlex are open data, in PollisJournals from the start and brought up to date every month with PollisJournals.jl.

## Where the Metrics Appear: Tags, the Journals Filter and SQL
- **Tags**: each item of a journal on the RSS Feeds page and on the welcome page has a tag with the journal's Norwegian level, OpenAlex's 2-year mean citedness and, once imported, its SJR or Impact Factor quartile. The pointer on the tag shows every value, with its source and year.
- **Journals filter**: on the RSS Feeds page, Academic, Leading and Open Access from the start; SJR Q1, SJR Q1-Q2 and SNIP Above 1 once SCImago or CWTS are imported.
- **SQL**: the metrics and journal_metrics views of PollisJournals hold every row imported, and norwegian_levels every level since 2004. Query them in a duckdb> terminal, from Databases > New DuckDB Terminal.

## See Also
- [Overview](overview.md) · [Factsheet](factsheet.md) · [The Metrics and What They Mean](metrics.md)
