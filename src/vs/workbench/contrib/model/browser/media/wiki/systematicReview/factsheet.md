# Systematic Review: Factsheet

The steps, inputs, files, effect measures, figures and requirements of Systematic Review at a glance.

## Steps of Systematic Review

| Step | What it sets or does | Button |
|---|---|---|
| **Question** | The review's name, the question, the inclusion and exclusion criteria, the outcome and the effect measure; **Earlier reviews...** reopens a review, **New Study** starts another | **Save the Question** |
| **Records** | A file of references, and a search of OpenAlex with its years and the most works to take | **Add the File**, **Search OpenAlex** |
| **Screening** | The agent and model of each screener, and each screener's status, time and records decided | **Start the Screeners** |
| **Conflicts** | The screeners' agreement, and each conflict with your decision | **Settle with an Agent** |
| **Full Texts** | A PDF for each record kept | **Add PDF...** in each row |
| **Extraction** | The agent and model of each extractor, and each one's status and time | **Start the Extractors** |
| **Differences** | Each study's two extractions, and the one kept | — |
| **Meta-Analysis** | The pooled estimates, heterogeneity, Egger's test, the forest and funnel plots, and the flow of records | **Run the Meta-Analysis** |

The blue button is always the next one to press. A button that cannot do its work yet says why beneath it when pressed.

## Inputs of the Question and Records of Systematic Review

| Input | Step | Default | Meaning |
|---|---|---|---|
| **Review** | Question | `review`, then `review-2`... | The name of the review's folder: letters, digits, hyphens and underscores |
| **Question** | Question | — | The review's question, in plain words |
| **Inclusion Criteria** | Question | — | One line each: the population, the intervention, the comparison, the outcome and the study design |
| **Exclusion Criteria** | Question | Empty | One line each |
| **Outcome** | Question | Empty | The outcome whose effect is extracted, and when it is measured |
| **Effect Measure** | Question | Standardized Mean Difference (Hedges' g) | The measure every effect is extracted on |
| **File** | Records | — | A file of references: BibTeX, RIS or CSL-JSON |
| **OpenAlex** | Records | — | Words searched in titles and abstracts, with AND, OR, NOT and quotes for phrases |
| **From**, **To** | Records | 1900, this year | The years of publication searched |
| **Up To** | Records | 500 | The most works taken from the search, up to 5,000 |

## Agents of Systematic Review

| Input | Step | Default | Meaning |
|---|---|---|---|
| **Screener 1**, **Screener 2** | Screening | Different agents and models, when there are | The agent and model of each screener |
| **Third Screener** | Conflicts | An agent and model neither screener has, when there is one | The agent and model that settles conflicts |
| **Extractor 1**, **Extractor 2** | Extraction | Different agents and models, when there are | The agent and model of each extractor |

## Effect Measures of Systematic Review

| Measure | What each study gives | Shown, once pooled |
|---|---|---|
| **Standardized Mean Difference (Hedges' g)** | The difference of the groups' means, in units of their standard deviation | On its scale |
| **Mean Difference** | The difference of the groups' means, in the outcome's unit | On its scale |
| **Log Odds Ratio** | The natural logarithm of the odds ratio | And as an odds ratio |
| **Log Risk Ratio** | The natural logarithm of the risk ratio | And as a risk ratio |
| **Correlation, as Fisher's z** | The correlation, transformed to Fisher's z | And as a correlation |
| **Another Measure, with Its Standard Error** | A measure the outcome names, on the scale it is pooled on | On its scale |

Each effect comes with its standard error, on the same scale.

## Files of a Systematic Review

| File | Written by | What it holds |
|---|---|---|
| `study.toml` | Save the Question; the Start buttons | The question, criteria, outcome and measure, the date, and each agent's agent and model |
| `records.json`, `records.csv` | Add the File; Search OpenAlex | The records, numbered `R0001`..., and where they came from |
| `choices.json` | Your decisions | Your decision on each conflict, and the extraction kept for each study |
| `full-texts/` | Add PDF... | Each full text, `<id>.pdf`, and its text, `<id>.txt` |
| `screener-1/`, `screener-2/`, `adjudicator/` | Pollis, then each screener | `SKILL.md`, `TASK.md`, `data/records.csv`, `screening.csv` and `SCREENING.md` |
| `extractor-1/`, `extractor-2/` | Pollis, then each extractor | `SKILL.md`, `TASK.md`, `data/studies.csv`, `data/full-texts/`, `extraction.csv` and `EXTRACTION.md` |
| `effects.csv`, `meta.jl` | Run the Meta-Analysis | The effects kept, and the Julia of the meta-analysis |
| `results.json` | `meta.jl` | The pooled estimates, heterogeneity, Egger's test and each study's weight |

Each agent's folder also holds `TRANSCRIPT.md` and `.transcript/`, what it did step by step. The review's folder is `orchestration/systematic-review/<review>` of the open Pollis Workspace, else `~/.pollis/orchestration/systematic-review/<review>`.

## Requirements of Systematic Review

| Need | For | Where to get it |
|---|---|---|
| Claude Code, Codex, OpenCode, GitHub Copilot CLI or Antigravity CLI | The screeners, the third screener and the extractors | Compose > Coding Agents |
| The screen-records and extract-effect-sizes skills | The same | The Pollis Agents plugin, downloaded at each start |
| A connection to OpenAlex | Search OpenAlex | Nothing to install; an OpenAlex key, when Pollis has one, is sent with each search |
| The PDF tools (Poppler) | Add PDF... | Installed by Pollis the first time they are needed |
| Julia and Distributions.jl | Run the Meta-Analysis | Julia comes with Pollis; Distributions.jl is installed the first time |

## See Also

- [Overview](overview.md) · [Two Screeners and Their Agreement](screening-agreement.md) · [Double Extraction](double-extraction.md) · [Reading the Meta-Analysis](meta-analysis.md)
