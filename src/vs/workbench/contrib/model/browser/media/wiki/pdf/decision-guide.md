# PDF Files: Decision Guide

Which tab of the **PDF Files** panel, and which options, for a task. Each tab runs a Poppler tool ([Poppler Developers (2025)](#ref-PD2025a)); the Factsheet lists them all.

## Which tab of PDF Files for which task

| Task | Tab | Options |
|---|---|---|
| Quote or search a passage | **Extract Text** | Reading Order; an Area around the passage |
| Copy a printed table into Julia | **Tables** | Page, and an Area around the table only |
| Check a replication against a published table | **Tables**, then **Check Against Your Results** | Your estimates by row label |
| Find the title, page count or PDF version | **Document Info** | Show: Summary |
| Find why text extracts as odd characters | **Fonts** | Show: Fonts Used, then the `uni` column |
| Save a figure as stored in the file | **Images** | Images: Save in Own Format |
| A picture of a page for slides or OCR | **Render Pages** | PNG at 150 dpi on screen, 300 dpi for print or OCR |
| A figure as vector graphics | **Convert** | SVG, with an Area around the figure |
| Some pages of a long file | **Split** | Page Range into One File |
| One file from several | **Merge** | Append Files |
| The data or code carried inside a PDF | **Attachments** | Save All |

## Which text order for Extract Text

**Reading Order** suits prose: columns are followed one after the other and hyphenated words at line ends are joined. **Physical Layout** (`-layout`) suits tables and forms, because words keep their horizontal positions and columns stay side by side, padded with spaces; it is also the order Save Text uses. **Content Stream Order** (`-raw`) gives the text in the order the file draws it, which sometimes keeps a table row together when the other orders do not; the Poppler manual page of `pdftotext` no longer recommends it for general use. When unsure, Reading, Layout and Raw Order in Compare shows a page in all three.

## Whole Page or an Area

**Whole Page** suits a page range of plain text, page images, and conversion of entire pages. An **Area** suits anything that is one block on the page: a table, a figure, an abstract, a box in a form. The Tables tab always works on an area, because the words of the body text around a table would otherwise form rows and columns of their own. With an area, Render Pages gives a picture of just that block and Convert gives an SVG or a PDF whose page is the size of the area.

## Render Pages or Images for figures

**Images** saves the pictures stored in the file, at the size at which they are stored, without anything drawn on top of them: no labels, no axes, no vector lines. **Render Pages** draws the page, or an area of it, at the chosen resolution, with everything that is on it, so a chart made of vector lines and text, which Images cannot see, comes out whole. For a photograph or a scan, Images gives the original pixels; for a chart, a Render Pages image or an SVG from Convert gives what a reader sees.

## Split, Merge or both

**Split** with **One File per Page** writes each page as a file of its own; **Page Range into One File** writes the pages from First Page to Last Page as one file, in one step. **Merge** joins whole files in the order given. To reorder pages or pick pages from several files, split the pages wanted and merge the resulting files in the new order. Neither tab reads encrypted files.

## References

<a id="ref-PD2025a"></a>Poppler Developers (2025). Poppler: A PDF Rendering Library. [poppler.freedesktop.org](https://poppler.freedesktop.org/)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md)
- [Text and Tables](text-and-tables.md) · [Areas of a Page](areas.md) · [Rendering and Conversion](rendering-and-conversion.md) · [Pages and Attachments](pages-and-attachments.md)
