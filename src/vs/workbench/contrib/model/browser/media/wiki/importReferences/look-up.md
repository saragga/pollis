# Import References — Looking Up

## What Looking Up an Imported Reference Adds
**Look Up in OpenAlex and Semantic Scholar** adds, for each reference found, its citation counts, journal rankings and open-access copies, and fills the fields your file lacks. The fields your file has are kept. OpenAlex ([Priem, Piwowar and Orr (2022)](#ref-PPO2022a)) and Semantic Scholar supply the same columns as in Discover Literature.

## How Imported References Are Matched to the Indexes
A reference with a DOI is looked up by that DOI, a hundred to a request, which is quick and exact. A reference without one is looked up by its title, one request each, which is slower and may fail when the title differs from the index's. With many references lacking DOIs, a key for each index avoids waiting at busy times.

## Keeping Imported References as Your File Has Them
With Look Up unticked, the references stay as your file has them and nothing is sent to any service, which suits unpublished material. A list of DOIs is always looked up, as a DOI alone has no title to show.

## Why a DOI Is an Exact Match and a Title Is Not
A DOI is registered by the publisher with its record: [Hendricks, Tkaczyk, Lin and Feeney (2020)](#ref-HTLF2020a) describe Crossref, with over 106 million records across 13 content types. Without a DOI, Import References faces the older problem of record linkage, set out by [Fellegi and Sunter (1969)](#ref-FS1969a): deciding from a comparison of imperfect fields whether two records describe one thing. A title match can therefore be wrong as well as missing, so references without a DOI are worth a glance after the look-up.

## References

<a id="ref-FS1969a"></a>Fellegi, I. P. and Sunter, A. B. (1969). A theory for record linkage. *Journal of the American Statistical Association* 64(328), 1183–1210. [doi:10.1080/01621459.1969.10501049](https://doi.org/10.1080/01621459.1969.10501049)

<a id="ref-HTLF2020a"></a>Hendricks, G., Tkaczyk, D., Lin, J. and Feeney, P. (2020). Crossref: the sustainable source of community-owned scholarly metadata. *Quantitative Science Studies* 1(1), 414–427. [doi:10.1162/qss_a_00022](https://doi.org/10.1162/qss_a_00022)

<a id="ref-PPO2022a"></a>Priem, J., Piwowar, H. and Orr, R. (2022). OpenAlex: a fully-open index of scholarly works, authors, venues, institutions, and concepts. *arXiv preprint*. [arXiv:2205.01833](https://arxiv.org/abs/2205.01833)

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md)
