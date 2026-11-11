# Article Methods — Overview

## Why a Method Comes With Published Results
The Article Methods list holds to one rule: without data and expected results there is no new method. Computed results depend on details an article cannot state in full, so the code is part of the scholarship, as [Buckheit and Donoho (1995)](#ref-BD1995a) argued. [Peng (2011)](#ref-Pen2011a) describes reproducibility as a spectrum that starts with publishing code and data, and a test against published values takes it further, since anyone can run the test. Having data and code alone is no guarantee: [Stodden, Seiler and Ma (2018)](#ref-SSM2018a) found that a journal's policy of asking for them was not enough for its results to be reproduced.

## The Two Lists of the Article Methods Page
**In Progress** holds the methods you started and have not published; click a title to go on with it. **Library** holds the published methods: those that come with Pollis and those pushed with Package and Publish, each with its author in the **Author** column; click a heading to sort by it. Under each title, the package's name opens its GitHub page. **Datasets** names the tables of PollisDatasets a method reads, more than three behind their count, which shows them when clicked, and its other data each in a few words. Clicking a name makes your own copy in `~/.pollis/methods` the first time and opens the page of that copy. With nothing started, In Progress says **None: Compose > Replication > Create Article Method starts one.**

## What the Tables Column of Your Methods Counts
The **Tables** column counts the published tables of a method as input and target: the tables holding the data it starts from, and those holding the results it must arrive at. A method's tests compare the targets with Julia's values, in line with the advice of [Sandve, Nekrutenko, Taylor and Hovig (2013)](#ref-SNTH2013a) to keep what produced each result.

## Removing Methods From the Article Methods Page
**Delete** moves a method's folder to the trash, with its tables, instructions and code, after asking. **Delete Empty Article Methods** does the same for every method with no article, tables, instructions or code, and shows how many there are.

## Why a Method Keeps Its Code, Data and Text Together
[Donoho (2010)](#ref-Don2010a) calls error ubiquitous in scientific computing and asks for a single script that generates all the figures and tables of a paper. [Gentleman and Temple Lang (2007)](#ref-GL2007a) propose dynamic documents, which integrate code, data and text so that readers can verify an analysis and adapt it. [Wilson, Aruliah, Brown, Chue Hong, Davis, Guy, Haddock, Huff, Mitchell, Plumbley, Waugh, White and Wilson (2014)](#ref-WABHD...2014a) gather the working habits that reduce such errors, among them version control and automated tests. A method in Pollis follows these ideas in keeping its article, tables, instructions and code in one folder.

## References

<a id="ref-BD1995a"></a>Buckheit, J. B. and Donoho, D. L. (1995). WaveLab and reproducible research. *Wavelets and Statistics*, 55–81. [doi:10.1007/978-1-4612-2544-7_5](https://doi.org/10.1007/978-1-4612-2544-7_5)

<a id="ref-Don2010a"></a>Donoho, D. L. (2010). An invitation to reproducible computational research. *Biostatistics* 11(3), 385–388. [doi:10.1093/biostatistics/kxq028](https://doi.org/10.1093/biostatistics/kxq028)

<a id="ref-GL2007a"></a>Gentleman, R. and Temple Lang, D. (2007). Statistical analyses and reproducible research. *Journal of Computational and Graphical Statistics* 16(1), 1–23. [doi:10.1198/106186007x178663](https://doi.org/10.1198/106186007x178663)

<a id="ref-Pen2011a"></a>Peng, R. D. (2011). Reproducible research in computational science. *Science* 334(6060), 1226–1227. [doi:10.1126/science.1213847](https://doi.org/10.1126/science.1213847)

<a id="ref-SNTH2013a"></a>Sandve, G. K., Nekrutenko, A., Taylor, J. and Hovig, E. (2013). Ten simple rules for reproducible computational research. *PLoS Computational Biology* 9(10), e1003285. [doi:10.1371/journal.pcbi.1003285](https://doi.org/10.1371/journal.pcbi.1003285)

<a id="ref-SSM2018a"></a>Stodden, V., Seiler, J. and Ma, Z. (2018). An empirical analysis of journal policy effectiveness for computational reproducibility. *Proceedings of the National Academy of Sciences* 115(11), 2584–2589. [doi:10.1073/pnas.1708290115](https://doi.org/10.1073/pnas.1708290115)

<a id="ref-WABHD...2014a"></a>Wilson, G., Aruliah, D. A., Brown, C. T., Chue Hong, N. P., Davis, M., Guy, R. T., Haddock, S. H. D., Huff, K. D., Mitchell, I. M., Plumbley, M. D., Waugh, B., White, E. P. and Wilson, P. (2014). Best practices for scientific computing. *PLoS Biology* 12(1), e1001745. [doi:10.1371/journal.pbio.1001745](https://doi.org/10.1371/journal.pbio.1001745)

## See Also
- [Factsheet](factsheet.md)
