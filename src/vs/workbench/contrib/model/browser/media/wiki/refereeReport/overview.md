# Referee Report: Overview

Referee Report gives the same draft of a research paper to several coding agents, each a referee in a role of its own, and then to another agent, the editor, who reads the draft and every report and writes the decision letter to the authors. A revised draft goes to the same referees in a next round. The page is in Compose > Orchestration.

## What Does Referee Report Do?

Referee Report runs a small review of a draft, as a journal would, with coding agents as the referees and the editor. Every referee reads the whole draft, on its own and in its own folder, and goes deepest into its role: Methods, Contribution and Literature, Data and Reproducibility, Exposition, Devil's Advocate or General. No referee sees another's report. The editor then weighs the reports and writes the decision: Accept, Minor Revision, Major Revision or Reject. The authors can use the reports and the letter before they submit, to find the concerns a journal's referees are likely to raise, while there is still time to address them.

## What Are the Six Steps of Referee Report?

**Draft** names the study, which is the name of its folder, and takes the draft, a PDF, LaTeX, Markdown or text file, the field, the journal, if any, and the folder of the authors' code and data, if any; **Prepare the Draft** copies them into the study. **Referees** sets how many referees read the draft, from 2 to 5, and the role, agent and model of each; **Start the Referees** starts them all at once. **Reports** follows each referee's status, time and recommendation. **Editor** chooses the editor's agent and model, and **Start the Editor** starts it once the referees have ended. **Decision** shows the editor's decision and the referees' recommendations. **Next Round** makes a study for the revised draft.

## What Does Each Referee of Referee Report Write?

Each referee is a coding agent started in its own terminal and its own folder, `referee-1` to `referee-N` of the study, with the referee-report skill of Pollis Agents as `SKILL.md`, its role and the paper's field and journal in `TASK.md`, and a copy of the draft in `data/`. It writes `REPORT.md`, with a summary of the paper, an assessment, its major concerns, each with where it arises and what would resolve it, its minor points and its recommendation with a confidence from 1 to 5. It writes the same recommendation, the confidence and the number of concerns in `report.toml`, from which the page reads them. A referee runs commands only with `julia`, to check the authors' code or a computation of the draft, and does not look the paper up.

## What Does the Editor of Referee Report Write?

The editor is a coding agent started in the folder `editor` of the study, with the edit-referee-reports skill of Pollis Agents as `SKILL.md`, the draft in `data/` and every referee's report in `reports/`. It writes `LETTER.md`, the decision letter: the decision, the paper as the editor reads it, the concerns that decide it, where the referees disagree and which view the editor takes, the required and the suggested revisions, each with the referees who raised it, and a table of the referees' recommendations. It writes the decision, the number of required revisions and a one-sentence reason in `decision.toml`, from which the page draws the Decision step. The editor runs no commands.

## What Does a Next Round of Referee Report Add?

**Start the Next Round** makes a new study, named after the first with `-round-2`, `-round-3`..., with the revised draft, the authors' code and data of the round before, the editor's letter and, when given, the authors' response to the referees. Its referees are at first the same roles, agents and models, and can be changed before **Start the Referees**. Each referee gets, in `data/previous/`, its own report of the round before, the letter and the response, and its report opens with Earlier Concerns: for each of its earlier major concerns, whether the revision addresses it. The editor gets its letter of the round before and the response.

## Why Several Referees in Different Roles?

Referees of the same paper often disagree. [Cicchetti (1991)](#ref-Cic1991a) reviews the low reliability of peer review across disciplines, and [Bornmann, Mutz and Daniel (2010)](#ref-BMD2010a), in a meta-analysis of 48 studies of journal peer review, find a mean Cohen's kappa of 0.17 between independent reviews of the same manuscript. [Berk, Harvey and Hirshleifer (2017)](#ref-BHH2017a), from the letters of former editors of economics journals, describe the mistakes referees tend to make and how an editor reads their reports. Referee Report gives each referee a role, so that the reports cover different ground, and lets each be a different agent or model, so that they are less alike.

## How Close Are an Agent's Comments to a Referee's?

[Liang and 11 coauthors (2024)](#ref-LZCWD...2024a) compared the comments GPT-4 wrote on papers of 15 Nature family journals and of the ICLR conference with those of their human reviewers. The points GPT-4 raised overlapped with a reviewer's about as much as two human reviewers' points overlapped with each other, and more than half of 308 researchers who received its comments on their own papers found them helpful or very helpful. The authors conclude that human expert review should remain the foundation of the scientific process, and that such comments could help researchers in earlier stages of writing a paper, when expert feedback is not at hand. The reports of Referee Report are of this kind: comments on a draft, not a journal's review.

## References

<a id="ref-BHH2017a"></a>Berk, J. B., Harvey, C. R. and Hirshleifer, D. (2017). How to Write an Effective Referee Report and Improve the Scientific Review Process. *Journal of Economic Perspectives* 31(1), 231–244. [doi:10.1257/jep.31.1.231](https://doi.org/10.1257/jep.31.1.231)

<a id="ref-BMD2010a"></a>Bornmann, L., Mutz, R. and Daniel, H.-D. (2010). A Reliability-Generalization Study of Journal Peer Reviews: A Multilevel Meta-Analysis of Inter-Rater Reliability and Its Determinants. *PLoS ONE* 5(12), e14331. [doi:10.1371/journal.pone.0014331](https://doi.org/10.1371/journal.pone.0014331)

<a id="ref-Cic1991a"></a>Cicchetti, D. V. (1991). The Reliability of Peer Review for Manuscript and Grant Submissions: A Cross-Disciplinary Investigation. *Behavioral and Brain Sciences* 14(1), 119–135. [doi:10.1017/S0140525X00065675](https://doi.org/10.1017/S0140525X00065675)

<a id="ref-LZCWD...2024a"></a>Liang, W. and 11 coauthors (2024). Can Large Language Models Provide Useful Feedback on Research Papers? A Large-Scale Empirical Analysis. *NEJM AI* 1(8), AIoa2400196. [doi:10.1056/AIoa2400196](https://doi.org/10.1056/AIoa2400196)

## See Also

- [Factsheet](factsheet.md) · [The Referees' Roles](referee-roles.md) · [From Reports to a Decision](reports-to-decision.md)
