# Referee Report: The Referees' Roles

The six roles a referee of Referee Report can take, what each looks at most closely, and how to choose the roles, agents and models of the referees of a draft.

## What Is a Referee's Role in Referee Report?

A role is the part of the paper a referee of Referee Report looks at most closely. Every referee reads the whole draft and can raise any concern, as any referee would, but its report goes deepest into its role. The role is set for each referee in the Referees step, written in its `TASK.md`, and named in the title of its report, `# Referee Report: Methods`. The editor sees each referee's role, and names it beside each concern in the letter: Referee 2 (Methods). At first the referees take the roles in their order on the page, Methods, Contribution and Literature, Data and Reproducibility, so that three referees cover the three parts most papers are judged on.

## The Six Roles of Referee Report

| Role | What the referee looks at most closely |
|---|---|
| **Methods** | Identification and the assumptions behind it; estimation and inference, such as standard errors, clustering and multiple testing; robustness; whether the results support the claims |
| **Contribution and Literature** | What is new and why it matters; how the paper stands against the closest work; claims of novelty that go too far; work it should engage with |
| **Data and Reproducibility** | Where the data come from; how the sample and the variables are built; what is dropped and why; whether the tables could be reproduced; the authors' code, when given |
| **Exposition** | Whether the introduction states the question, the answer and the contribution; the order of the argument; tables and figures that stand alone; length and notation |
| **Devil's Advocate** | The strongest case against the main claim: other explanations of the results, the evidence that would refute it, and whether the paper rules them out |
| **General** | The paper as a whole, as a typical referee of the journal |

## How Do I Choose the Roles of the Referees of a Draft?

The roles of Referee Report can repeat, and need not all be used. A draft whose question and data are settled, and whose doubts are in the estimation, can have two Methods referees on different models. A draft before submission, whose argument is still taking shape, gains from an Exposition referee. The Devil's Advocate role suits a paper whose main claim others are likely to contest, and asks what else would explain its results. A General referee reads the paper as most referees of the journal would, without a part to look at most closely. A Data and Reproducibility referee does most when the folder of the authors' code and data is given in the Draft step, since it can then read the code and run it in Julia.

## Should the Referees of Referee Report Use Different Models?

At first, the referees of Referee Report take the agents and models found on the computer in turn, so that the reports come from different models where there are several, and the editor takes an agent and model no referee has, when there is one. Two referees on the same model and in the same role can raise many of the same points; different models, like different roles, make the reports less alike. Each run is billed by its agent's provider, as any run of the agent is; a local model through llama.cpp costs nothing to run.

## Can I Change a Referee of Referee Report After It Has Started?

**Restart**, in a referee's row of the Reports step, starts that referee again on the role, agent and model now chosen for it in the Referees step, while the others are left as they are. Its folder is emptied first, and its earlier work, the report and the transcript, goes to the Trash. A running referee is stopped with **Stop** first. The Restart of the editor's row starts the editor again on the agent and model chosen in the Editor step, with the reports written by then. A restart changes only the study's `study.toml` and the agent's folder.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [From Reports to a Decision](reports-to-decision.md)
