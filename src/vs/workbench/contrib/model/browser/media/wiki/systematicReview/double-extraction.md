# Systematic Review: Double Extraction

Why two extractors extract every study in Systematic Review, what they extract, how differences between them are found, and what changes when a study has only its abstract.

## What Does Double Extraction Find That Single Extraction Misses?

In double extraction, two reviewers extract the data of each study on their own, and their extractions are compared, so that an error of one is found by the difference it makes. [Buscemi, Hartling, Vandermeer, Tjosvold and Klassen (2006)](#ref-BHVTK2006a) randomised reviewers to extract data alone or to check another's extraction: single extraction made 21.7% more errors than double extraction, though it took 36.1% less time, and the effect estimates differed little for most outcomes. Systematic Review runs the two extractors at once, each in its own folder, so the time saved by a single extraction is small, and the errors double extraction finds are kept out of the meta-analysis.

## What Does an Extractor of Systematic Review Extract?

For each study the screening kept, an extractor of Systematic Review first decides whether the study, read in full, meets the review's criteria. For an eligible study, it extracts the effect on the outcome of the Question step, on the effect measure chosen there, with its standard error, the number of participants, how the effect was found and where in the study: a table, a figure or a page. The effect is taken as the study reports it when it reports the measure with its standard error. The standard error comes from a 95% confidence interval when the study gives that instead. Otherwise the effect is computed in Julia from the statistics the study reports, with the usual formulas of the Cochrane Handbook, and `how` says from which.

## When Do Two Extractions Differ in Systematic Review?

Two extractions of a study agree, in Systematic Review, when the extractors agree on whether it is eligible and, for an eligible study, on its effect and its standard error, to within 1% of the larger value or 0.005, whichever is more. Anything else is a difference: one extractor finds the study eligible and the other does not, they take different effects or standard errors, or one gives an effect and the other none. The Differences step shows both extractions of each study side by side, with where each value comes from, and marks the differences. A study whose extractions agree keeps Extractor 1's at first; a study whose extractions differ waits for your choice.

## How Do I Settle a Difference Between the Extractors?

Each study of the Differences step of Systematic Review has a menu, **Keep**: Extractor 1, Extractor 2 or Exclude. Before choosing, open both extractions, **Extraction** in each extractor's row of the Extraction step, and the study's full text, from the Full Texts step, at the table or page each extraction names. A difference often comes from two outcomes, two times of measurement or two analyses of the same study, which the notes of each extraction name. **Exclude** keeps the study out of the meta-analysis, as when neither extraction can be checked against the study. A study that is not eligible, or that has no effect with a positive standard error, stays out of the meta-analysis whichever extraction is kept.

## What Changes When a Study Has Only Its Abstract?

A record the screening kept goes to the extractors of Systematic Review with its full text when a PDF was added in the Full Texts step, and with its abstract only otherwise. An extractor judges a study with no full text on its abstract, extracts what the abstract gives, and says so in its notes. An abstract seldom gives the standard error or the statistics to compute it, so such a study often has no effect to pool. The Flow of Records, in the Meta-Analysis step, counts the studies assessed with a full text and with the abstract only. A PDF added after the extractors have started reaches an extractor only when it is restarted.

## References

<a id="ref-BHVTK2006a"></a>Buscemi, N., Hartling, L., Vandermeer, B., Tjosvold, L. and Klassen, T. P. (2006). Single Data Extraction Generated More Errors than Double Data Extraction in Systematic Reviews. *Journal of Clinical Epidemiology* 59(7), 697–703. [doi:10.1016/j.jclinepi.2005.11.010](https://doi.org/10.1016/j.jclinepi.2005.11.010)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Two Screeners and Their Agreement](screening-agreement.md) · [Reading the Meta-Analysis](meta-analysis.md)
