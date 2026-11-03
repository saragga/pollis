# PDF Files: Text and Tables

How the **Extract Text** and **Tables** tabs of the PDF Files panel read words from a page with `pdftotext` ([Poppler Developers (2025)](#ref-PD2025a)), and how the Tables tab turns the words of an area into cells.

## The three text orders of pdftotext

`pdftotext` writes the text of the pages from `-f` to `-l`. By default it undoes the physical layout, as its manual page puts it: columns are read one after the other and hyphenation at line ends is removed, which gives **Reading Order**. With `-layout`, **Physical Layout**, it keeps the text as close as it can to where it is on the page, with spaces between words that are far apart. With `-raw`, **Content Stream Order**, it keeps the order in which the content stream of the page draws the text. The output file `-` sends the text to standard output, which Example Code reads into the string `text`. Further options of `pdftotext` include `-nopgbrk`, which leaves out the form feeds between pages, `-nodiag`, which discards diagonal text such as watermarks, and `-eol`, which chooses the line endings.

## Word boxes from pdftotext -tsv

With `-tsv`, `pdftotext` writes a table of tab-separated values with a line for every page, block, line and word, each with its box. The columns are level, page_num, par_num, block_num, line_num, word_num, left, top, width, height, conf and text. Level 5 is a word; left and top give its top left corner and width and height its size, all in points, measured from the top left corner of the page. The Tables tab keeps the words whose centre lies inside the area. The related options `-bbox` and `-bbox-layout` write the same boxes as XHTML, the second with blocks and lines as well as words.

## How the Tables tab groups words into rows

The words inside the area are sorted by their top, then by their left edge. A word starts a new row when its top is more than **Row Tolerance (pt)** below the top of the first word of the current row; otherwise it joins that row. Words on one baseline have the same top, so the tolerance only has to absorb small differences, such as a word in a different font size. A cell that wraps onto two lines becomes two rows, the second with empty cells where the first had text.

## How the Tables tab finds columns

The horizontal span of every word in the area, from its left edge to its right edge, is sorted by left edge. Spans are merged while the next one starts less than **Column Gap (pt)** to the right of the end of the current one; a wider gap starts a new column. Each word then goes to the column whose start is the last one at or left of the centre of the word, and the words of one row and column are joined with spaces into a cell. The result is `cells`, a matrix of strings with one row per table row and one column per table column, and empty strings where a table has no entry.

## Checking a table extracted from a PDF

**Extraction Accuracy** saves the attachment `table1.csv` with `pdfdetach`, reads it with CSV.jl ([Quinn (2023a)](#ref-Qui2023a)) as strings separated by semicolons, and compares it with `cells` cell by cell: the share of cells right, and each cell that differs. **Check Against Your Results** goes the other way, from a replication to the table: for each row label it rounds the estimates typed in the code to the number of decimals printed and reports whether they match. **Clean Numbers** turns the cells into numbers, removing stars, parentheses, percent signs and thousands separators and reading a Unicode minus as a minus; it reads commas as thousands separators, so tables with a decimal comma need the comma replaced by a point first.

## Making a test PDF for table extraction

**Make Your Own Test PDF** copies `sample.tex`, `table1.csv` and the figure of the sample from PollisDatasets to the working directory, typesets `sample.tex` with PollisTeX, and attaches `table1.csv` to the result with `pdfattach`, as `my_test.pdf`. The LaTeX source reads the table from `table1.csv` with the csvsimple package, one line per row and cells separated by semicolons, so changing the CSV file changes the typeset table and its true values together. Merged headings, more columns, negative numbers or a different font can be tried this way, and Extraction Accuracy scores each version.

## Saving a table extracted from a PDF

**Save Table as CSV** writes `cells` with CSV.jl as a file separated by semicolons and without a header line, the format of `table1.csv`, after wrapping the matrix as a table with `Tables.table` of Tables.jl ([Quinn (2023b)](#ref-Qui2023c)). **Save Text** writes the text of the whole file in its physical layout as a `.txt` file. A table saved this way and checked by hand against the printed one can be attached to its PDF with the Attachments tab, as `table1.csv`, so that Extraction Accuracy scores later extractions of the same file.

## References

<a id="ref-PD2025a"></a>Poppler Developers (2025). Poppler: A PDF Rendering Library. [poppler.freedesktop.org](https://poppler.freedesktop.org/)

<a id="ref-Qui2023a"></a>Quinn, J. (2023a). CSV.jl: Utility library for working with CSV and other delimited files. [github.com/JuliaData/CSV.jl](https://github.com/JuliaData/CSV.jl)

<a id="ref-Qui2023c"></a>Quinn, J. (2023b). Tables.jl: An interface for tables in Julia. [github.com/JuliaData/Tables.jl](https://github.com/JuliaData/Tables.jl)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Areas of a Page](areas.md) · [Rendering and Conversion](rendering-and-conversion.md) · [Pages and Attachments](pages-and-attachments.md)
