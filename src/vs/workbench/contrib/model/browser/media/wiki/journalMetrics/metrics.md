# Journal Metrics — The Metrics and What They Mean

## Citations per Document: Impact Factor, CiteScore, Citedness and IPP
Several metrics count the citations a journal's documents receive, per document, over a window of years. The **Journal Impact Factor (JIF)** of Journal Citation Reports counts the citations in a year to the items of the two years before, per citable item, and the **5-year JIF** does the same over five years, steadier and fairer to fields that cite slowly. OpenAlex's **2-year mean citedness** is close to a two-year impact factor and exists for every journal OpenAlex covers. **CiteScore** of Scopus counts the citations in four years to the documents of those four years. **IPP** (impact per publication) of CWTS uses the papers of the three years before. None of these is adjusted for field, so they compare journals of one field only.

| Metric | Source | Window |
|---|---|---|
| Impact Factor (JIF) | Journal Citation Reports | 2 years |
| 5-year JIF | Journal Citation Reports | 5 years |
| 2-year mean citedness | OpenAlex | 2 years |
| CiteScore | Scopus | 4 years |
| IPP | CWTS | 3 years |

## Metrics Adjusted for Field or Prestige: SNIP, JCI and SJR
Fields cite at very different rates, so raw citation counts favour journals of fields that cite much. **SNIP** of CWTS adjusts the citations per paper for how much the journal's field cites: 1 is about the average of any field and 2 twice it, so journals of different fields can be compared. The **Journal Citation Indicator (JCI)** of Journal Citation Reports normalises citations by field, year and document type: 1 is the average of the category and 1.5 half as much again. **SJR** of SCImago weights each citation by the prestige of the citing journal, over the documents of the three years before; it is higher for better journals but is still best compared within a field.

## Quartiles: SJR, CiteScore and JIF Quartiles
A quartile places a journal among the journals of a subject category: Q1 is the top quarter of the category by the metric, Q4 the bottom quarter. SCImago gives the **SJR quartile** in each of its subject categories, and Pollis shows the journal's best one. Scopus gives the **CiteScore quartile** in each Scopus subject area, and Journal Citation Reports the **JIF quartile** in each Web of Science category. A journal listed in several categories can be Q1 in one and Q3 in another.

## The h-index of a Journal
The **h-index** is the largest h such that h of the journal's works have at least h citations each. OpenAlex computes it over all the works it knows, and SCImago over the documents in Scopus. The h-index grows with the journal's age and size, so an old, large journal has a higher one than a young journal of the same standing.

## Levels and Ratings: the Norwegian Register and the ABDC List
Two sources rate journals by expert panels rather than by citations. The **Norwegian Register** gives each journal or series a **Level** every year since 2004: 2 for leading channels, those that publish about a fifth of a field's most significant work; 1 for academic channels, peer reviewed with authors from several institutions; 0 for channels not academic or no longer approved. It covers every field, the humanities included. The **ABDC Journal Quality List** of the Australian Business Deans Council rates journals of business, economics, accounting, finance and management: **A*** about the top 5 to 7% of the list, **A** about the next 15 to 25%, **B** about the next 35 to 40%, and **C** the rest, journals of recognised quality. The list is reviewed every three years.

## Open Access, DOAJ and Article Charges
OpenAlex says whether a journal is fully **open access** and whether it is listed in the **Directory of Open Access Journals (DOAJ)**, which vets open-access journals. For an open-access journal, OpenAlex also gives the **article charge**, the article processing charge (APC) in US dollars, when it is known. These values come with OpenAlex, built into Pollis, so they need no import, and the **Open Access** choice of the Journals filter on the RSS Feeds page uses them to keep only the items of open-access journals.

## See Also
- [Overview](overview.md) · [Factsheet](factsheet.md) · [Importing Metrics and Using Them](importing.md)
