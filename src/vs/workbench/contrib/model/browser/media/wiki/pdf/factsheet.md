# PDF Files: Factsheet

A quick reference for the **PDF Files** panel: the ten tabs, the Poppler tool behind each, the inputs and the Next Steps actions. Every tab runs the command-line tools of Poppler ([Poppler Developers (2025)](#ref-PD2025a)), which `Poppler_jll.jl` installs for macOS, Linux and Windows.

## The ten tabs of PDF Files side by side

| Tab | Poppler tool | What it gives | Writes files |
|---|---|---|---|
| **Extract Text** | `pdftotext` | The text of a page range, or of an area of each page | No |
| **Tables** | `pdftotext -tsv` | The words of an area grouped into rows and columns: a matrix of cells | No |
| **Document Info** | `pdfinfo` | The document information, or one of XMP metadata, page boxes, links, named destinations, structure tree, JavaScript | No |
| **Fonts** | `pdffonts` | The fonts of a page range, or their substitutes | No |
| **Images** | `pdfimages` | A list of the images, or the images saved as files | When saving |
| **Render Pages** | `pdftoppm` | One PNG, JPEG or TIFF image per page | Yes |
| **Convert** | `pdftocairo`, `pdftops`, `pdftohtml` | SVG, PDF, PostScript, EPS, HTML or XML | Yes |
| **Split** | `pdfseparate`, `pdfunite` | One PDF per page, or one PDF of a page range | Yes |
| **Merge** | `pdfunite` | One PDF of several whole files | Yes |
| **Attachments** | `pdfdetach`, `pdfattach` | The embedded files, listed or saved, or a copy of the PDF with one more | When saving or adding |

## Inputs of the PDF Files panel and their defaults

| Input | Default | Tabs | Meaning |
|---|---|---|---|
| **File** | `sample.pdf`, the sample of PollisDatasets | All | The PDF to read |
| **Password** | Empty | All but Split and Merge | The user password of an encrypted file |
| **First Page**, **Last Page** | 1 and `end` | Extract Text, Fonts, Images, Render Pages, Convert, Split | The page range |
| **Page** | 2 | Tables | The page with the table |
| **Region** | Whole Page; Area on Tables | Extract Text, Tables, Render Pages, Convert | The whole page or an area of it |
| **Left**, **Top**, **Width**, **Height (pt)** | 200, 155, 200, 130 | With Region set to Area | The area, in points from the top left corner |
| **Column Gap (pt)**, **Row Tolerance (pt)** | 8 and 3 | Tables | How far apart columns and rows must be |
| **Text Order** | Reading Order | Extract Text | Reading Order, Physical Layout or Content Stream Order |
| **Resolution (dpi)** | 150 | Render Pages | Pixels per inch of the images |
| **Format** | SVG | Convert | SVG, PDF, PostScript, EPS, HTML or XML |

The remaining inputs choose what a single tab shows or does: **Show** on Document Info and Fonts, **Images** on Images, **Image Format** and **Colour** on Render Pages, **Split Into** on Split, **Append Files** on Merge, and **Action** and **File to Attach** on Attachments.

## Next Steps actions of PDF Files

| Group | Action | Tabs | Output |
|---|---|---|---|
| Visualise | **Words per Page** | All | A bar chart of the words found on each page |
| Visualise | **Show a Page** | All | The page drawn at 72 dpi, with axes in points |
| Visualise | **Show the Area** | Extract Text, Tables, Render Pages, Convert | The page with the area outlined in red |
| Diagnose | **Scanned Pages** | All | Words and images on each page |
| Diagnose | **Fonts Not Embedded** | All | Fonts without an embedded copy or a Unicode map |
| Diagnose | **Encryption Check** | All | Whether the file is encrypted, and its permissions |
| Compare | **Reading, Layout and Raw Order** | All | One page in the three text orders |
| Compare | **Check Against Your Results** | Tables | Your estimates against the printed numbers, at the printed precision |
| Compare | **Extraction Accuracy** | Tables | The extracted cells against the true ones in an attached table1.csv |
| Interpret | **Most Frequent Words** | All | The 20 most frequent words of four letters or more |
| Interpret | **Clean Numbers** | Tables | The cells as numbers |
| Export | **Save Text** | All | The text of the file as a .txt file |
| Export | **Save Table as CSV** | Tables | The cells as a CSV file separated by semicolons |
| Export | **Make Your Own Test PDF** | All | A PDF typeset from the LaTeX source of the sample, with its table attached |

## References

<a id="ref-PD2025a"></a>Poppler Developers (2025). Poppler: A PDF Rendering Library. [poppler.freedesktop.org](https://poppler.freedesktop.org/)

## See Also

- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Text and Tables](text-and-tables.md) · [Areas of a Page](areas.md) · [Rendering and Conversion](rendering-and-conversion.md) · [Pages and Attachments](pages-and-attachments.md)
