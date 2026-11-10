# Package Vignettes — Writing a Vignette

## What the Vignette of a Method Holds
The vignette of a Pollis method is a short LaTeX document in the method's folder, `vignette/NAME.tex`, NAME being the name of the package, with any `.bib` file and a `resources/` folder for its images. The vignette says what the method does and which article it comes from, shows how to call the method in Julia, and sets the values its tests compute beside the published ones, so a reader sees how close the package comes to the article.

## How a Method Gets Its Vignette
On the page of a method (Compose > Replication > Browse Article Methods, then the method's title), the step Write a Vignette has a **Write Vignette** button, which asks the coding agent for the vignette once the method's tests pass. The vignette's title is `vignette_title` in the method's `method.toml`, or the method's `title` when `vignette_title` is empty.

## How Package and Publish Ships a Vignette
Package and Publish copies the vignette's LaTeX sources and its `resources/` folder into the package, without a PDF or the working files of LaTeX, and writes `vignette/Vignette.toml`, the vignette's entry: its title, method, package, version, author, description, citation, article, topic, license, repository and source. When the package is registered, the same entry goes into `Vignettes.toml` at the root of the registry, under the package's name, in place of the entry of an earlier version.

## How the Article Column Reads a Citation
The citation of a vignette's entry joins the citations of all the articles of its method, each written as "Surname, I. and Surname, I. (year). Title. Journal volume(issue), pages." The Article column of Package Vignettes shows them as Authors (year), with every surname and the articles separated by semicolons, such as "Hansen (1992); Carrasco, Hu and Ploberger (2014)". A citation written in another form appears as it is written.

## See Also
- [Factsheet](factsheet.md)
- [Overview](overview.md)
- [Installed or Registry](installed-or-registry.md)
