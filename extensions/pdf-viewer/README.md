# PDF Viewer

**Notice:** This extension is bundled with Pollis. It can be disabled but not uninstalled.

## Features

This extension opens PDF files (`.pdf`) in Pollis, with the viewer of PDF.js and a sidebar of Pollis tools at its right, with the area of Select Area and the ten Poppler tools, which Tools: Show | Hide in the toolbar shows or hides; the viewer keeps the choice for the next PDF.

- **Viewer**: pages, outline, thumbnails, search, zoom, rotation, presentation mode, annotations and form fields, and Save As.
- **Markup**: Highlight, Add Text, Draw, and Add or Edit Images, the tools of PDF.js; Save writes the PDF with the marks in a new file.
- **Select Area**: drag a box on a page to get its coordinates in points from the top left corner, a picture of it, its text and its table; a click on the page, Escape or the × beside its coordinates clears it. Copy the text or the table, save the table as a CSV file or the picture as a PNG file, or send any of them to Ask Pollis.
- **Poppler Tools**: Extract Text (also of the pages given, such as 1-3, 7), Tables, Fonts, Images, Attachments, Document Info, Render Pages, Convert (SVG, PostScript, EPS, HTML or XML, or the area as PDF), Split (one file per page, the pages given, such as 1-3, 5, in one file, or a file per range) and Merge, run by the Poppler tools of Poppler_jll in a hidden Julia process of the Julia extension, on the pages given or on the area. Each has its options, Run, and its Julia code, to copy or run in the REPL. What a tool prints is shown under it; the files it writes go where you choose (the dialogs open in the folder chosen last, or at first in the PDF's folder, or in Documents for a PDF of a Julia package), the result names their folder, and a CSV file shows as a table, a picture as itself and a text file as its text. An attachment chosen in the left pane shows there too.
- **Print**: the print button of the viewer, with the system's print dialog.

The file reloads when it changes on disk, keeping the page and the zoom, so a PDF that LaTeX writes again, from Reports or New Methods, shows its new version.

## Commands

- **Open a PDF...**: opens a PDF from the disk; also a button in the viewer's title bar.
- **Open the Sample PDF**: opens the sample PDF of PollisDatasets.

Compose > PDF Files opens the PDF shown, else the sample PDF, for a task: Read (the outline, else the thumbnails), Extract and Convert (the tools sidebar shown), Crop (Select Area on), Highlight, Add Text, Draw, or Add or Edit Images (that markup tool on). The PDF... of Ask Pollis' + opens a PDF of yours in this viewer.

## Third-party software

The `pdfjs` folder holds the legacy build of PDF.js 6.4.299 by the Mozilla Foundation (Apache-2.0), with the license files of the components it includes.
