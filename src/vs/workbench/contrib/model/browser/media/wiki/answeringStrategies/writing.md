# Ask Pollis Strategies — Writing a Strategy

## Where Is a Strategy Written?
A strategy of your own is a TOML file in `~/.pollis/ask/strategies/`, one strategy to a file. Open Folder, beside the folder's name at the top of the Ask Pollis Strategies page, shows the folder. The simplest start is to click a strategy in the table and press Copy as New... in its details, which asks for a name, writes a copy of the strategy as a new file and opens it in the editor. Pollis checks a strategy file each time it is saved, so the new row of the table, or the problems of the file under Files That Are Not Strategies, appear on the Ask Pollis Strategies page at once.

## What Does a Strategy File Hold?
A strategy file starts with a `[strategy]` table and has one `[[steps]]` table for each step:

```toml
[strategy]
id = "panelHeavy"
label = "Panel Heavy"
description = "Asked in a panel, most passages come from the panel."
author = "Your Name"

[[steps]]
step = "search"
panelShare = 0.75

[[steps]]
step = "rerank"
by = "reranker"
query = "panel"

[[steps]]
step = "answer"
panel = "card"
```

The `id` is letters, digits, `-` and `_`, starting with a letter, and no other strategy may have it. The `label` is the name shown in menus, and `author` is optional. Comments go on lines of their own, since a comment after a value becomes part of it.

## How Is the Search Step Set?
The search step comes first, and every strategy has one. Asked in a panel, the search step takes a share of the passages from the panel's own documents, the panel's Key Points, its wikis and the vignettes of its packages, and finds the rest as without a panel. The share is a number from 0 to 1. One `panelShare` is the same for every question: `panelShare = 0.625` takes five passages of eight. A share that depends on the question is two numbers, `panelNear` and `panelFar`. `panelNear` applies when the panel's nearest passage is almost as near the question as the nearest passage of all, and `panelFar` when it is not. A search by words only, without embeddings, uses `panelNear`.

## How Are the Rerank and Answer Steps Set?
The rerank step is optional and comes second. With `by = "reranker"`, the reranker of Set Active Models chooses the best passages among three times as many found; with no reranker set, the step is skipped. Asked in a panel, the reranker orders the panel's own passages and the others apart, and each keeps the share of the passages the search gave it. `query = "question"`, the default, gives the reranker the question as typed; `query = "panel"` gives the reranker the question after its Context, as "Check a Convergence Order: What does this panel check?". The answer step comes last, and every strategy has one. `panel = "named"` tells the answering model the panel's name and menu. `panel = "card"` adds what the panel holds: its models, Key Points, decision table, inputs and packages. `panel = "none"` tells the answering model nothing of the panel.

## Why Is a Strategy File Left Out?
Pollis leaves out a strategy file that it cannot carry out exactly as written, and lists the file under Files That Are Not Strategies with each problem. The problems are a key Pollis does not know, a value it cannot take, such as a share above 1, a missing id, label or description, an id that another strategy has, and steps that are not search, rerank if any, and answer, in that order, each once. Open File, below each file, opens it in the editor. Ask Pollis keeps answering with the other strategies, and with Panel Aware when the file left out was the one in use.

## How Is a Strategy Shared?
A strategy of your own is shared by proposing it to the catalogue, the GitHub repository `Trumpingtons/pollis-strategies`. Choose the strategy in the table of the Ask Pollis Strategies page and press Propose to the Catalogue.... Pollis signs in to GitHub as you, makes your copy of the catalogue, adds the strategy as `strategies/<id>.toml`, and opens a proposal on GitHub (a pull request), which the browser then shows. The proposal gives the strategy's description and its Panel FAQ Score beside that of Base, which help others decide whether to install it. The catalogue checks the file with the same rules as Pollis, and its maintainer reviews the proposal. Once accepted, the strategy appears under From GitHub on the Ask Pollis Strategies page of every Pollis, ready to install.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Comparing Strategies](comparing.md)
