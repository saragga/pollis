# Package Vignettes — Factsheet

**Package Vignettes**, in Help > Documentation, lists the vignettes of Julia packages: the documentation of a package's method, with the article it follows, how to call it in Julia, and its results printed beside the published ones.

| | |
|---|---|
| **Purpose** | Find the vignette of a package and read it as a PDF |
| **Columns** | Vignette, Article, Topic, Package, Location |
| **Finding a vignette** | Search vignettes, All topics, sortable headings, rows per page |
| **Location** | Locally Installed, or Pollis Registry on GitHub |
| **Compiled with** | PollisTeX.jl, the first time a vignette is opened |
| **Compiled copies** | `~/.pollis/documents/vignettes`, one PDF for each package and version |
| **Registry read** | `Vignettes.toml` of the registry in the setting `pollis.newMethods.registry` |

## When to Use Package Vignettes
- Reading how a method was tested against its article before using its package.
- Finding packages by topic, author or article.
- Reading the vignette of a package being written in `~/.julia/dev`, as it changes.

## What Package Vignettes Does Not Do
Package Vignettes does not install packages or run their code: a click on a title opens the vignette, and a click on an article opens the article. A package outside the Pollis registry shows its vignette only once it is installed on this computer.

## See Also
- [Overview](overview.md)
- [Writing a Vignette](writing-a-vignette.md)
- [Installed or Registry](installed-or-registry.md)
