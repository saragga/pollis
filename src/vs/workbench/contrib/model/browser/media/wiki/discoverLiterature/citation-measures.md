# Discover Literature — Citation Measures

## Why Compare Citations Within a Field and Year
A raw citation count favours old articles and fields that cite heavily. Comparing an article with others of its field and year removes much of that. [Waltman, van Eck, van Leeuwen, Visser and van Raan (2011)](#ref-WELVR2011a) set out why this should be done article by article, dividing each article's citations by those expected for its field and year, and only then averaging. The columns FWCI and Percentile of Discover Literature rest on this idea.

## What FWCI and Percentile Mean in Discover Literature
**FWCI**, field-weighted citation impact, is an article's citations over those of the average article of its field and year, as OpenAlex computes it: 1 is average, and 2 is twice the average. **Percentile** is OpenAlex's citation percentile against the same field and year, and **Influence** in the search form filters on it. Because citations are very unevenly spread, a percentile is often easier to read than a ratio, since a few articles pull the average up.

## What the Influential Column Counts
Not every citation builds on the work cited: many only mention it in passing. [Valenzuela, Ha and Etzioni (2015)](#ref-VHE2015a) trained a classifier to tell citations that matter from the rest, using signals such as how often the work is cited within the citing paper, and found the meaningful ones to be a minority. **Influential** in Discover Literature is Semantic Scholar's count of citations of this kind, those that build on the article. An article can rank high on it and modestly on total citations, which often marks work that others truly use.

## Recent Citations and Citations Since Publishing
**Since Publishing** is the number of times an article was cited since it came out, as each index counts. **Last n Years** counts up to the last ten years, this year included, and shows whether a topic still draws on the article. Recent Citations is a column rather than a criterion of the search. OpenAlex counts year by year for its last ten years; Semantic Scholar does not, so that column stays OpenAlex's.

## Where Citation Indexes and Journal Citation Measures Come From
[Garfield (1955)](#ref-Gar1955a) proposed citation indexes for science, in which a work is found through the works that cite it. [Garfield (1972)](#ref-Gar1972a) then used citation analysis to evaluate journals, ranking them by the frequency and impact of their citations. The **2-Year Mean Citedness** of Discover Literature belongs to this family: a measure of the journal, not of the article shown beside it.

## Why Citation Counts and Journal Measures Should Not Decide Alone
A journal's figure says little about one article: [Seglen (1997)](#ref-Seg1997a) found that it conceals the difference in article citation rates, the most cited half of a journal's articles being cited ten times as often as the least cited half, and that it depends on the field. Counts also reflect standing: for [Merton (1968)](#ref-Mer1968a), the Matthew effect heightens the visibility of contributions by scientists of acknowledged standing and reduces that of those less known. The Leiden Manifesto of [Hicks, Wouters, Waltman, de Rijcke and Rafols (2015)](#ref-HWWRR2015a) opens with the principle that "Quantitative evaluation should support qualitative, expert assessment". The columns of Discover Literature help choose what to read, and do not replace reading it.

## References

<a id="ref-Gar1955a"></a>Garfield, E. (1955). Citation indexes for science: a new dimension in documentation through association of ideas. *Science* 122(3159), 108–111. [doi:10.1126/science.122.3159.108](https://doi.org/10.1126/science.122.3159.108)

<a id="ref-Gar1972a"></a>Garfield, E. (1972). Citation analysis as a tool in journal evaluation. *Science* 178(4060), 471–479. [doi:10.1126/science.178.4060.471](https://doi.org/10.1126/science.178.4060.471)

<a id="ref-HWWRR2015a"></a>Hicks, D., Wouters, P., Waltman, L., de Rijcke, S. and Rafols, I. (2015). Bibliometrics: the Leiden Manifesto for research metrics. *Nature* 520(7548), 429–431. [doi:10.1038/520429a](https://doi.org/10.1038/520429a)

<a id="ref-Mer1968a"></a>Merton, R. K. (1968). The Matthew effect in science. *Science* 159(3810), 56–63. [doi:10.1126/science.159.3810.56](https://doi.org/10.1126/science.159.3810.56)

<a id="ref-Seg1997a"></a>Seglen, P. O. (1997). Why the impact factor of journals should not be used for evaluating research. *BMJ* 314(7079), 497. [doi:10.1136/bmj.314.7079.497](https://doi.org/10.1136/bmj.314.7079.497)

<a id="ref-VHE2015a"></a>Valenzuela, M., Ha, V. and Etzioni, O. (2015). Identifying meaningful citations. *AAAI Workshop on Scholarly Big Data*. [aaai.org/ocs/index.php/WS/AAAIW15/paper/view/10185](https://aaai.org/ocs/index.php/WS/AAAIW15/paper/view/10185)

<a id="ref-WELVR2011a"></a>Waltman, L., van Eck, N. J., van Leeuwen, T. N., Visser, M. S. and van Raan, A. F. (2011). Towards a new crown indicator: some theoretical considerations. *Journal of Informetrics* 5(1), 37–47. [doi:10.1016/j.joi.2010.08.001](https://doi.org/10.1016/j.joi.2010.08.001)

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Searching and Keys](search-and-keys.md)
