# New Method — Assumptions

## A Pollis Method Needs Published Data and Published Results

A Pollis method assumes that the article's data can be had and that the article prints results computed from it. Without both there is nothing to test, and so no method: a table of results with no data cannot be recomputed, and data with no printed results gives nothing to compare with. Where the data is not public but printed in the article, the table can be typed in as an input table.

## Target Tables Are Assumed to Be Copied Exactly

Target tables are assumed to hold each value as the article prints it, with every digit, since the digits printed decide how a value is rounded before it is compared. A value typed as 0.42 where the article prints 0.420 is tested less strictly. A coding agent using **Add from Article** can misread a table, so the targets are checked against the article by hand: the tests are only as right as the targets.

## Published Values Are Assumed to Come from the Stated Method

The tests of a Pollis method assume that the article's values were computed by the method the article describes, on the data it describes. Articles can differ from this through misprints, an unstated step in the data, an earlier version of the data, or a software default of the time. When a value cannot be reproduced, any of these may be the cause rather than the code, and a second implementation of the same estimator helps to tell which. Published figures can also carry mistakes of their own: [Herndon, Ash and Pollin (2014)](#ref-HAP2014a), replicating a published study of public debt and growth, trace its figures to selective exclusion of data, coding errors and inappropriate weighting.

## Linked Data Is Assumed to Stay Available

The tests of a Pollis method download each linked input table every time they run, so they assume the link keeps working and its content stays the same. A link that moves makes the tests fail although the code is right, and a file changed in place can change the results. **Save a Copy...** protects the user's own computer only, because a copy is not part of the package. A table that matters and is at risk can be typed in from the article, or taken from PollisDatasets when the catalogue has it.

## A License Is Assumed Before Others Reuse a Pollis Method

A published Pollis method is assumed to be reusable, which needs a license: `license` in `method.toml` names one, such as MIT, or another whose text is in a LICENSE file in the folder. Without a license nobody may reuse the package, so others cannot build on it. The license covers the code; the rights to the article's text and data stay with their owners, which is one reason both are links.

## A Pollis Method Assumes Every Result Can Be Traced to Its Steps

A Pollis method keeps a record of how each result is produced, which is the first of the rules of [Sandve, Nekrutenko, Taylor and Hovig (2013)](#ref-SNTH2013a), who also ask that manual changes to the data be avoided. In `method.toml`, each target names the call that computes it, and each input its link and how it is read, so no step is done by hand outside the folder. A table typed in from the article is the exception the method folder keeps visible, in `inputs/`. The folder also suits the habits of [Wilson, Bryan, Cranston, Kitzes, Nederbragt and Teal (2017)](#ref-WBCKN...2017a) for organising and tracking research computing, as it is a small set of plain text files.

## References

<a id="ref-HAP2014a"></a>Herndon, T., Ash, M. and Pollin, R. (2014). Does high public debt consistently stifle economic growth? A critique of Reinhart and Rogoff. *Cambridge Journal of Economics* 38(2), 257–279. [doi:10.1093/cje/bet075](https://doi.org/10.1093/cje/bet075)

<a id="ref-SNTH2013a"></a>Sandve, G. K., Nekrutenko, A., Taylor, J. and Hovig, E. (2013). Ten simple rules for reproducible computational research. *PLoS Computational Biology* 9(10), e1003285. [doi:10.1371/journal.pcbi.1003285](https://doi.org/10.1371/journal.pcbi.1003285)

<a id="ref-WBCKN...2017a"></a>Wilson, G., Bryan, J., Cranston, K., Kitzes, J., Nederbragt, L. and Teal, T. K. (2017). Good enough practices in scientific computing. *PLOS Computational Biology* 13(6), e1005510. [doi:10.1371/journal.pcbi.1005510](https://doi.org/10.1371/journal.pcbi.1005510)

## See Also
- [Overview](overview.md) · [Diagnostics](diagnostics.md) · [Interpretation](interpretation.md)
