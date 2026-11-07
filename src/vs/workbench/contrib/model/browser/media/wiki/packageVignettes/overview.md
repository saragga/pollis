# Package Vignettes — Overview

## What a Package Vignette Is
A package vignette is the documentation of a package's method, written in LaTeX and carried by the package, as R packages carry theirs. The vignette of a Pollis method says what the method does, which article it follows, how to call it in Julia, and how close its tests come to the published values, shown side by side. Package Vignettes gathers in one table the vignettes of the Pollis registry and those of the Julia packages on this computer, and Ask Pollis reads them all.

## Reading the Columns of Package Vignettes
**Vignette** gives the title of each vignette, the method and a description; a click on the title opens the vignette. **Article** names the articles the method follows as Authors (year): a click opens the article, and the full citation appears when the pointer rests on it. **Topic** is the field of the method. **Package** gives the package with its version, author, repository and license. **Location** says where the vignette comes from: Locally Installed, or Pollis Registry on GitHub.

## Finding a Vignette in Package Vignettes
**Search vignettes** looks in the title, method, description, full citation, topic, package, author, license and location of every vignette, so a word of an article's title finds its vignette. **All topics** narrows the table to one topic. A click on a heading sorts the table by that column and a second click reverses the order. The choice of rows sets how many vignettes each page of the table shows.

## Opening a Vignette From Package Vignettes
The first time a vignette is opened, Pollis compiles its LaTeX sources into a PDF with PollisTeX.jl, which needs Julia, while the status bar says which package is being compiled. The PDF then opens in the PDF Viewer and stays in `~/.pollis/documents/vignettes`, so the next opening needs no compiling. A vignette published as a PDF, without its sources, opens that PDF directly.

## See Also
- [Factsheet](factsheet.md)
- [Writing a Vignette](writing-a-vignette.md)
- [Installed or Registry](installed-or-registry.md)
