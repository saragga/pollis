# Referee Report: Factsheet

The steps, inputs, files, recommendations and requirements of Referee Report at a glance.

## Steps of Referee Report

| Step | What it sets or does | Button |
|---|---|---|
| **Draft** | The study's name, the draft, the field, the journal and the folder of the authors' code and data; **Earlier studies...** reopens a study, **New Study** starts another | **Prepare the Draft** |
| **Referees** | How many referees, and the role, agent and model of each | **Start the Referees** |
| **Reports** | Each referee's role, status, time and recommendation, and links to its report and its terminal, with **Stop** and **Restart** | — |
| **Editor** | The editor's agent and model, and its status once started | **Start the Editor** |
| **Decision** | The decision, the number of required revisions, how many referees recommended it, and each referee's recommendation | **Open the Letter** |
| **Next Round** | The revised draft and the authors' response | **Start the Next Round** |

The blue button is always the next one to press. A button that cannot do its work yet says why beneath it when pressed.

## Inputs of Referee Report

| Input | Step | Default | Meaning |
|---|---|---|---|
| **Study** | Draft | `draft`, then `draft-2`... | The name of the study's folder: letters, digits, hyphens and underscores |
| **Draft** | Draft | — | The paper, as a PDF, LaTeX, Markdown or text file |
| **Field** | Draft | Empty | The paper's field, which sets the standards the referees judge by |
| **Journal** | Draft | Empty | The journal the paper is for; when empty, the referees judge it as for a good general journal of the field |
| **Code and Data** | Draft | Empty | The folder of the authors' code and data, which the referees can read and run in Julia |
| **How Many** | Referees | 3 | The number of referees, from 2 to 5 |
| **Referee 1** to **Referee N** | Referees | The roles in order, the agents and models in turn | The role, the agent and the model of each referee |
| **Editor** | Editor | An agent and model no referee has, when there is one | The editor's agent and model |
| **Revised Draft** | Next Round | — | The authors' revised paper |
| **Response** | Next Round | Empty | The authors' response to the referees |

## Files of a Referee Report Study

| File | Written by | What it holds |
|---|---|---|
| `study.toml` | Prepare the Draft; Start the Referees; Start the Editor | The round, the study before, the draft's file, the field, the journal, the date, each referee's role, agent and model, and the editor's |
| `paper/` | Prepare the Draft | The draft as `paper.pdf`, `paper.tex`, `paper.md` or `paper.txt`; the text of a PDF, page by page, as `paper.txt`; the authors' code and data in `code/` |
| `previous/` | Start the Next Round | The editor's letter of the round before and the authors' response |
| `referee-1/` to `referee-N/` | Start the Referees, then each referee | One folder for each referee |
| `editor/` | Start the Editor, then the editor | The editor's folder |

The study's folder is `orchestration/referee-report/<study>` of the open Pollis Workspace, else `~/.pollis/orchestration/referee-report/<study>`.

## Files of a Referee and of the Editor

| File | Folder | Written by | What it holds |
|---|---|---|---|
| `SKILL.md` | Both | Pollis | The referee-report or the edit-referee-reports skill of Pollis Agents |
| `TASK.md` | Both | Pollis | The role, the field, the journal, the round and the files; for the editor, each referee and its role |
| `data/` | Both | Pollis | A copy of the study's `paper/`, and in a later round `previous/` |
| `REPORT.md`, `report.toml` | Referee | The referee | The report, and its recommendation, confidence and number of concerns |
| `reports/` | Editor | Pollis | Each referee's `REPORT.md` and `report.toml`, as `referee-k.md` and `referee-k.toml` |
| `LETTER.md`, `decision.toml` | Editor | The editor | The decision letter, and the decision, the number of required revisions and the reason |
| `TRANSCRIPT.md`, `.transcript/` | Both | Pollis | What the agent did, step by step, with its time, tool calls and tokens |

A referee is **Done** once `REPORT.md` is in its folder, and the editor once `LETTER.md` is.

## Recommendations and Decisions of Referee Report

| Value in the TOML | Shown as | Meaning |
|---|---|---|
| `accept` | Accept | The paper can be published as it is |
| `minor` | Minor Revision | Small changes, which the editor can check without the referees |
| `major` | Major Revision | Changes that could alter the claims, which the referees read again |
| `reject` | Reject | Concerns that a revision is unlikely to resolve |

A referee's **confidence** goes from 1, little, to 5, certain.

## Requirements of Referee Report

| Need | For | Where to get it |
|---|---|---|
| Claude Code, Codex, OpenCode, GitHub Copilot CLI or Antigravity CLI | Start the Referees and Start the Editor | Compose > Coding Agents |
| The referee-report and edit-referee-reports skills | Start the Referees and Start the Editor | The Pollis Agents plugin, downloaded at each start |
| The PDF tools (Poppler) | Prepare the Draft and Start the Next Round, for a PDF | Installed by Pollis the first time they are needed |
| Julia | A referee that runs the authors' code | Installed with Pollis |

## See Also

- [Overview](overview.md) · [The Referees' Roles](referee-roles.md) · [From Reports to a Decision](reports-to-decision.md)
