# Systematic Review: Overview

Systematic Review runs a review with two independent reviewers at each stage, the reviewers being coding agents: two screen every record, two extract every study, and you, or a third agent, settle where they disagree. Pollis then runs the meta-analysis in Julia. The page is in Compose > Orchestration.

## What Does Systematic Review Do?

Systematic Review takes a review question from the records found to a meta-analysis. The records come from a file of references and from a search of OpenAlex. Two coding agents screen every record's title and abstract against the inclusion and exclusion criteria, each on its own, and the page shows how far they agree. The records they disagree on are settled by you, or by a third agent. You add the full text of each record kept, as a PDF. Two agents then read each study and extract its effect on the measure chosen, with its standard error, each on its own; where they differ, you keep one. Pollis pools the effects kept, with the forest and funnel plots, and counts the flow of records from the search to the meta-analysis.

## What Are the Eight Steps of Systematic Review?

**Question** names the review, which is the name of its folder, and takes the question, the inclusion and exclusion criteria, the outcome and the effect measure; **Save the Question** writes them. **Records** adds records with **Add the File** and **Search OpenAlex**. **Screening** starts the two screeners with **Start the Screeners**. **Conflicts** shows their agreement and the records they disagree on, each settled by your decision or by **Settle with an Agent**. **Full Texts** takes a PDF for each record kept, with **Add PDF...**. **Extraction** starts the two extractors with **Start the Extractors**. **Differences** shows the two extractions of each study side by side, and the one you keep. **Meta-Analysis** runs it with **Run the Meta-Analysis**.

## What Do the Screeners of Systematic Review Write?

Each screener is a coding agent started in its own terminal and its own folder, `screener-1` or `screener-2` of the review, with the screen-records skill of Pollis Agents as `SKILL.md`, the question and criteria in `TASK.md`, and every record in `data/records.csv`. It decides each record as include, exclude or unsure from its title and abstract, with a short reason, in `screening.csv`, and writes `SCREENING.md`, with its counts, once every record is decided. Unsure goes on to the full text, as include does. The third screener, in the folder `adjudicator`, gets only the records the two disagreed on, with both decisions and reasons, and decides each as include or exclude.

## What Do the Extractors of Systematic Review Write?

Each extractor is a coding agent started in its own terminal and its own folder, `extractor-1` or `extractor-2` of the review, with the extract-effect-sizes skill of Pollis Agents as `SKILL.md`, the review's question, criteria, outcome and effect measure in `TASK.md`, and in `data/` the studies kept, `studies.csv`, with the full texts added, as PDFs and their text. For each study, it decides whether the study meets the criteria, read in full, and writes the effect on the measure chosen, its standard error, the sample size, how the effect was found and where in the study, in `extraction.csv`. It writes `EXTRACTION.md` last. An extractor runs commands only with `julia`, to compute an effect from the statistics a study reports.

## What Do I Decide in Systematic Review?

You write the question and the criteria, choose the sources of the records, add the full texts, and settle what the agents disagree on. In **Conflicts**, each record one screener would keep and the other would exclude has your decision, Include or Exclude, beside the third agent's, if it ran; yours comes first. In **Differences**, each study whose two extractions differ has a menu: Extractor 1, Extractor 2 or Exclude. The meta-analysis runs only once every conflict and every difference is settled. Your decisions are kept in `choices.json`, in the review's folder, so a review reopened later has them.

## Why Two Reviewers at Each Stage?

Systematic reviews have two reviewers screen the records and extract the data, each on its own, so that one reviewer's mistakes are found by the other. [Buscemi, Hartling, Vandermeer, Tjosvold and Klassen (2006)](#ref-BHVTK2006a) randomised reviewers to extract data alone or to check another's extraction, and found that single extraction made 21.7% more errors than double extraction, while taking 36.1% less time. [Page and 25 coauthors (2021)](#ref-PMBBH...2021a), in the PRISMA 2020 statement, ask a review to report how many reviewers screened each record and extracted each study, and whether they worked independently. Systematic Review makes two independent reviewers cheap: the agents run at once, each in its own folder, and never see each other's work.

## References

<a id="ref-BHVTK2006a"></a>Buscemi, N., Hartling, L., Vandermeer, B., Tjosvold, L. and Klassen, T. P. (2006). Single Data Extraction Generated More Errors than Double Data Extraction in Systematic Reviews. *Journal of Clinical Epidemiology* 59(7), 697–703. [doi:10.1016/j.jclinepi.2005.11.010](https://doi.org/10.1016/j.jclinepi.2005.11.010)

<a id="ref-PMBBH...2021a"></a>Page, M. J. and 25 coauthors (2021). The PRISMA 2020 Statement: An Updated Guideline for Reporting Systematic Reviews. *BMJ* 372, n71. [doi:10.1136/bmj.n71](https://doi.org/10.1136/bmj.n71)

## See Also

- [Factsheet](factsheet.md) · [Two Screeners and Their Agreement](screening-agreement.md) · [Double Extraction](double-extraction.md) · [Reading the Meta-Analysis](meta-analysis.md)
