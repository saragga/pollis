# Browse References — BibTeX Entries and Keys

## What a BibTeX Entry Holds
BibTeX is the bibliography program of LaTeX, and its file format has become a common way to exchange references ([Patashnik (1988)](#ref-Pat1988a)). An entry has a type, a key and fields, as in `@article{Key, author = {Last, First and Last, First}, title = {...}, journal = {...}, year = {2020}}`. The type says which fields apply: `article` takes a journal, `book` a publisher, and `inproceedings` a book title. Authors are joined by the word `and`. A document cites the entry through its key, with `\cite{Key}`, and the bibliography style decides how it is printed.

## How the Keys of PollisReferences Are Made
A key in the **Key** column of Browse References is built from the authors and the year. A single author gives the first three letters of the surname, as in `Pat1988a`. Several authors give the initials of their surnames, up to five and then three dots, as in `JKCZT...2018a`. A final letter tells apart the works sharing the rest. Searching by key works in the search box of the page.

## Writing Titles and Names So BibTeX Keeps Them
BibTeX styles may change the capitals of a title, so a word that must keep its capitals goes inside braces, such as `{GARCH}`. A surname of several words is written with the comma, `van der Vaart, Aad`, so that the parts are not mistaken for given names, and a company or an institution inside a second pair of braces, so it is not read as a person.

## Citing Software in a BibTeX Reference List
Software gets little acknowledgement or citation for the part it plays in research. [Smith, Katz, Niemeyer and FORCE11 Software Citation Working Group (2016)](#ref-SKNF2016a) review community practice and consolidate a set of software citation principles, to encourage one consistent policy across disciplines and venues. In BibTeX the practical step is an entry for the package itself, with its authors, the version used and a link or DOI, so that the reader can find what ran.

## References

<a id="ref-Pat1988a"></a>Patashnik, O. (1988). *BibTeXing*. [ctan.org/pkg/bibtex](https://ctan.org/pkg/bibtex)

<a id="ref-SKNF2016a"></a>Smith, A. M., Katz, D. S., Niemeyer, K. E. and FORCE11 Software Citation Working Group (2016). Software citation principles. *PeerJ Computer Science* 2, e86. [doi:10.7717/peerj-cs.86](https://doi.org/10.7717/peerj-cs.86)

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Citation Searches](snowball-search.md) · [Duplicates and Merging](duplicates.md)
