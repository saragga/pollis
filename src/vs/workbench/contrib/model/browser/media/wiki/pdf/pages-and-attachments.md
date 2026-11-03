# PDF Files: Pages and Attachments

How the **Split**, **Merge** and **Attachments** tabs of the PDF Files panel take files apart and put them together with `pdfseparate`, `pdfunite`, `pdfdetach` and `pdfattach` ([Poppler Developers (2025)](#ref-PD2025a)).

## Split: one file per page with pdfseparate

`pdfseparate` extracts the pages from `-f` to `-l` and writes each one as a PDF of its own. The name of the output files is a pattern that has to contain `%d`, which becomes the page number, or any other printf format for an integer, such as `%03d` for numbers padded to three digits. **Split Into** set to **One File per Page** gives the pattern as the name of the PDF followed by `-%d.pdf`, inside a folder ending in `_split`. Without `-f`, extraction starts with page 1, and without `-l` it ends with the last page.

## Split: a page range into one file

**Page Range into One File** writes the pages from First Page to Last Page as a single PDF, named after the PDF and the two page numbers. The tab first separates those pages into a temporary folder with `pdfseparate`, then joins them in order with `pdfunite`; a range of one page is copied as it is. The result is the same as splitting the file into single pages and merging those of the range, in one step.

## Merge files with pdfunite

`pdfunite` merges PDF files in the order in which they are given into one file, the last name on its command line. **Merge** passes File first, then each file in **Append Files**, separated by commas, and names the result after File with `_merged`. To put pages of several files in a new order, Split them into single pages and give the pages to Merge in the order wanted. The manual pages of `pdfseparate` and `pdfunite` state that the files they read should not be encrypted, which is why Split and Merge have no Password input.

## List and save the attachments of a PDF

A PDF can carry other files inside it, such as the data of its tables, code, or notes, as embedded files. **Attachments** with **Action** set to **List** runs `pdfdetach -list`, which prints the number of embedded files and the name of each. **Save All** runs `pdfdetach -saveall` with `-o`, the folder to save them into, ending in `_attachments`. `pdfdetach -save` with a number, or `-savefile` with a name, saves one file only; `-o` is then the name to save it under. The Extraction Accuracy action reads the true cells of a table this way.

## Add a file to a PDF with pdfattach

**Add a File** runs `pdfattach`, which adds a new embedded file to a PDF and writes the result as a new PDF: the original is left as it is. `pdfattach` will not write over an existing output file, so Example Code removes an earlier output first. With `-replace`, an embedded file of the same name, if there is one, is replaced. Attaching the data behind a table or a figure keeps them together in one file that any PDF reader opens; Make Your Own Test PDF attaches the cells of its table this way.

## References

<a id="ref-PD2025a"></a>Poppler Developers (2025). Poppler: A PDF Rendering Library. [poppler.freedesktop.org](https://poppler.freedesktop.org/)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Text and Tables](text-and-tables.md) · [Areas of a Page](areas.md) · [Rendering and Conversion](rendering-and-conversion.md)
