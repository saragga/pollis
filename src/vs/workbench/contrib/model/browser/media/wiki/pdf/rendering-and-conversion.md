# PDF Files: Rendering and Conversion

How the **Render Pages** and **Convert** tabs of the PDF Files panel turn pages into images and into other formats with `pdftoppm`, `pdftocairo`, `pdftops` and `pdftohtml` ([Poppler Developers (2025)](#ref-PD2025a)), and how the **Images** tab saves the pictures stored in a file.

## Render Pages with pdftoppm

`pdftoppm` draws each page from `-f` to `-l` as an image and writes one file per page, named after a root with the page number appended. Render Pages gives the root as the name of the PDF inside a folder ending in `_pages`. **Image Format** passes `-png`, `-jpeg` or `-tiff`; without one of them the tool writes PPM files. **Colour** passes nothing for colour, `-gray` for a grayscale image and `-mono` for black and white. Further options of `pdftoppm` include `-scale-to`, which fits the long side of each page to a number of pixels, `-singlefile`, which writes only the first page without a number in the file name, `-jpegopt` for the JPEG quality and `-tiffcompression` for the TIFF compression.

## Resolution of a rendered page

**Resolution (dpi)** is passed as `-r`, in pixels per inch, 150 by default in `pdftoppm`. A page measured in points, at 72 to the inch, comes out as its size in points times the resolution divided by 72 pixels on each side: at 72 dpi one pixel is one point, at 144 dpi two by two pixels per point. Doubling the resolution doubles both sides of the image, so it has four times as many pixels. Show a Page and Show the Area, in Visualise, render at 72 dpi for that reason: the axes of their plots are in points, the unit of the area inputs.

## Convert to SVG and PDF with pdftocairo

`pdftocairo` draws pages with the cairo graphics library and writes PNG, JPEG, TIFF, PDF, PostScript, EPS or SVG. For the vector formats the output file is the full file name. Convert writes one SVG file per page of the range, and one PDF of the whole range. Text in an SVG file from `pdftocairo` is drawn as glyph outlines, so the figure looks the same everywhere but its words cannot be selected. A PDF written by `pdftocairo` is a new file, drawn from the pages of the old one. Both SVG and PDF accept an area, given in points.

## PostScript and EPS with pdftops

`pdftops` converts a PDF to PostScript for printing, at Level 2 by default, the level that supports colour images and image compression; `-level1` and `-level3` choose the other levels, Level 3 adding CID font embedding. With `-eps`, it writes Encapsulated PostScript, which holds a single page, so Convert passes the First Page alone. Further options set the paper size (`-paper`, `-paperw`, `-paperh`), turn off the crop to the CropBox (`-nocrop`), or expand small pages to the paper (`-expand`).

## HTML and XML with pdftohtml

`pdftohtml` converts a PDF into HTML. With `-s` it writes one HTML file for all pages, and `-noframes` leaves out the frame set; the images of the pages are saved next to it, unless `-i` is given. With `-xml` it writes XML for further processing: a `page` element per page with its size, a `fontspec` element per font, and a `text` element per line of text with its top, left, width, height and font. Positions in the XML are at the zoom of `-zoom`, 1.5 by default, where 1 means 72 dpi, so dividing them by 1.5 gives points. Option `-c` generates complex output, and `-dataurls` puts the images inside the HTML file as data URLs, on the platforms that support them.

## Images: the pictures stored in a PDF

`pdfimages -list` prints one line per image: page, number, type (image, mask, smask or stencil), width and height in pixels, colour space, components, bits per component, encoding (image, jpeg, jp2, jbig2 or ccitt), interpolation, object ID, resolution in pixels per inch and size in the file. The width and height are those of the stored image, not the size at which the page shows it. **Save in Own Format** passes `-all`, which writes JPEG, JPEG 2000, JBIG2 and CCITT images in their own format, CMYK images as TIFF and the rest as PNG; **Save as PNG** passes `-png`. Both add `-p`, which puts the page number in each file name.

## References

<a id="ref-PD2025a"></a>Poppler Developers (2025). Poppler: A PDF Rendering Library. [poppler.freedesktop.org](https://poppler.freedesktop.org/)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
- [Text and Tables](text-and-tables.md) · [Areas of a Page](areas.md) · [Pages and Attachments](pages-and-attachments.md)
