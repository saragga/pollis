# PDF Files: Overview

The **PDF Files** panel reads, takes apart and rebuilds PDF files with Poppler, a PDF rendering library based on the code of Xpdf 3.0 ([Poppler Developers (2025)](#ref-PD2025a)). Poppler comes with a set of command-line tools, one per task, and each tab of the panel runs one or two of them from Julia.

## What a PDF file holds

A PDF page is a list of drawing instructions: put these characters, in this font, at this position; paint this image in this rectangle; draw this line. Nothing in the page says that a group of characters is a paragraph, a heading or the cell of a table. Words, lines and columns are found afterwards, from where the characters sit. Besides its pages, a file can carry a document information dictionary (title, author, dates), an XMP metadata stream, fonts, images, links, named destinations, a structure tree when it is tagged, JavaScript, and embedded files. A scanned page holds a picture of the text rather than characters, so it has no text to extract until OCR adds a text layer.

## How the PDF Files panel runs Poppler from Julia

`Poppler_jll.jl` installs the Poppler tools for the operating system, and each tool is a Julia function that returns the command: `pdftotext()`, `pdfinfo()`, `pdfimages()` and so on. Example Code runs them with `run` or `read` and Julia's backtick commands, for example ``read(`$(pdftotext()) -layout $pdf -`, String)``, where `-` sends the text to standard output. The arguments are the same as on the command line, so any option in the Poppler manual pages can be added to the code. Every tab starts by reading the number of pages from `pdfinfo`, which the Next Steps actions use as well.

## Where the files of the PDF Files panel go

Tabs that write files put them in the Julia working directory, named after the PDF: Render Pages writes into a folder ending in `_pages`, Images into one ending in `_images`, Split into one ending in `_split`, and Convert, Merge and Attachments write single files whose names add a suffix such as `_merged` to that of the PDF. The default File, `sample.pdf`, lives in the folder of PollisDatasets, which is read-only, so nothing is ever written next to it. Running a tab again overwrites its earlier output of the same name.

## The sample PDF of PollisDatasets

The default File is a three-page PDF typeset with LaTeX: sections and subsections of placeholder text, a figure, and a regression table on page 2 whose cells are attached to the file as `table1.csv`. The attachment holds the values typeset, so the Extraction Accuracy action can score a table extracted by the Tables tab cell by cell. Make Your Own Test PDF copies the LaTeX source and the CSV file to the working directory, where both can be edited to make harder tables, and typesets them again with PollisTeX.

## References

<a id="ref-PD2025a"></a>Poppler Developers (2025). Poppler: A PDF Rendering Library. [poppler.freedesktop.org](https://poppler.freedesktop.org/)

## See Also

- [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Text and Tables](text-and-tables.md) · [Areas of a Page](areas.md) · [Rendering and Conversion](rendering-and-conversion.md) · [Pages and Attachments](pages-and-attachments.md)
