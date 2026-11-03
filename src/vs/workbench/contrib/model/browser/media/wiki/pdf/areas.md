# PDF Files: Areas of a Page

An area is a rectangle on a page that the **Extract Text**, **Tables**, **Render Pages** and **Convert** tabs of the PDF Files panel can work on instead of the whole page. Each tab passes the rectangle to a Poppler tool, which crops to it ([Poppler Developers (2025)](#ref-PD2025a)).

## Points and the top left corner of a PDF page

The four area inputs are in points, the unit of PDF pages: one point is 1/72 inch. **Left (pt)** and **Top (pt)** are the distances of the top left corner of the area from the left and top edges of the page; **Width (pt)** and **Height (pt)** are its size. An A4 page is about 595 by 842 points and a US Letter page 612 by 792; `pdfinfo` prints the size of the pages of a file, and Document Info with Show set to Page Boxes prints the boxes of each page. The crop options of the Poppler tools and the word boxes of `pdftotext -tsv` measure from the top left corner, as the area inputs do.

## The Region input of PDF Files

**Region** sets whether a tab works on the **Whole Page** or on an **Area**. With Area, the four inputs for the rectangle appear, and the same rectangle is used on every page of the range. The Tables tab offers only Area. In Example Code the rectangle becomes the named tuple `area`, with fields `x`, `y`, `W` and `H`, and the function `cropargs` turns it into the options `-x`, `-y`, `-W` and `-H` of the Poppler tools, multiplied by a scale where a tool counts in pixels.

## How each tab of PDF Files crops to an area

| Tab | Tool | Unit of `-x -y -W -H` | Result |
|---|---|---|---|
| **Extract Text** | `pdftotext` | Pixels at the resolution `-r`, 72 dpi by default, that is points | The text inside the area |
| **Tables** | `pdftotext -tsv` | No crop: the words are filtered in Julia | The words whose centre is inside |
| **Render Pages** | `pdftoppm` | Pixels at the chosen resolution | An image of the area |
| **Convert** (SVG, PDF) | `pdftocairo` | Points, for vector output | A page the size of the area |

`pdftoppm` counts the area in pixels, so Example Code multiplies each number in points by the resolution divided by 72. HTML and XML from `pdftohtml`, and PostScript and EPS from `pdftops`, have no crop option, so Convert offers them only with Whole Page.

## Finding the numbers of an area on a page

**Show a Page**, in Visualise, draws the page at 72 dpi, so the pixels of the plot are points and its axes read directly as Left and Top. Reading the corners of a table or a figure off the axes gives the four numbers. **Show the Area** draws the same page with the area outlined in red, which shows before a tab runs whether the rectangle takes in a caption, a footnote or a neighbouring column. A margin of a few points around the block keeps letters on its edge inside without taking in lines nearby.

## A PDF of just the area

Convert, with Format set to PDF and Region set to Area, runs `pdftocairo -pdf` with the crop options and with `-paperw` and `-paperh` set to the width and height of the area, so each page of the new file is the size of the area. The new file is a PDF like any other: every tab of the panel can open it, so its fonts, images and text can be examined on their own. Words cut by the edge of the area can remain in its text, outside the visible page.

## References

<a id="ref-PD2025a"></a>Poppler Developers (2025). Poppler: A PDF Rendering Library. [poppler.freedesktop.org](https://poppler.freedesktop.org/)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Text and Tables](text-and-tables.md) · [Rendering and Conversion](rendering-and-conversion.md) · [Pages and Attachments](pages-and-attachments.md)
