# PDF Files: Diagnostics

The Diagnose actions of the **PDF Files** panel check, before any extraction, whether a file can give what is asked of it: a text layer, fonts that map to Unicode, access without a password. The checks read what Poppler's tools report ([Poppler Developers (2025)](#ref-PD2025a)).

## Why a page gives no text: scanned pages

**Scanned Pages** prints, for each page, the number of words `pdftotext` finds and the number of images `pdfimages -list` lists. A page with images and no words has no text layer, as with a scan or a photograph of a page: its characters are pixels, and no tab of the panel can read them. Such pages need optical character recognition (OCR), which adds an invisible text layer on top of the image; Extract Text and Tables then work on that layer. A page with neither words nor images is blank, or drawn entirely with vector paths, as some figures and some converted documents are. **Words per Page**, in Visualise, gives the same count as a bar chart, which shows at a glance where in a long file the text stops.

## Fonts that are not embedded or have no Unicode map

**Fonts Not Embedded** reads the columns of `pdffonts` and lists two kinds of font. A font that is not embedded (`emb` is no) is drawn on screen and in print with a substitute, chosen by the program that opens the file, so spacing and glyphs can change; Fonts, with Show set to Substitutes, lists the substitutes Poppler uses. A font without a `ToUnicode` map (`uni` is no) may give extracted text with wrong or missing characters, although the Poppler manual notes that the absence of a map does not necessarily mean the text cannot be converted to Unicode.

## Encrypted PDF files and the Password input

**Encryption Check** prints the Encrypted line of `pdfinfo`, with the print and copy permissions when the file is encrypted. A file with a user password cannot be opened without it: type it in **Password**, which the tabs pass to Poppler as `-upw`. A file with only an owner password opens without one, and `pdfinfo` lists the permissions it sets. The Split and Merge tabs run `pdfseparate` and `pdfunite`, whose manual pages state that their input files should not be encrypted, so an encrypted file has to be decrypted with another program before it can be split or merged.

## Text that comes out in the wrong order

Reading order, the default of Extract Text, guesses columns and the flow of text from where the words are. Two-column articles, side notes, footnotes and captions sometimes end up interleaved with the body. **Reading, Layout and Raw Order**, in Compare, prints the first lines of one page in the three orders of `pdftotext`, so the order that keeps the passage together can be chosen. When none does, an **Area** around the passage, set with Region, extracts only that block.

## Tables whose columns merge or split

The Tables tab separates columns by gaps between words. Two columns whose words come within **Column Gap (pt)** of each other are merged into one; a column of long, ragged entries with a wide space inside them can be split in two. A heading that spans several columns, inside the area, joins them all. Superscripts and stars set on a raised baseline can make a row break in two, which a larger **Row Tolerance (pt)** fixes. **Extraction Accuracy** shows the cells that differ when the true values are attached as `table1.csv`; on other files, Show the Area and the printed table show where the boundaries fall.

## References

<a id="ref-PD2025a"></a>Poppler Developers (2025). Poppler: A PDF Rendering Library. [poppler.freedesktop.org](https://poppler.freedesktop.org/)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Decision Guide](decision-guide.md)
- [Text and Tables](text-and-tables.md) · [Areas of a Page](areas.md) · [Rendering and Conversion](rendering-and-conversion.md) · [Pages and Attachments](pages-and-attachments.md)
