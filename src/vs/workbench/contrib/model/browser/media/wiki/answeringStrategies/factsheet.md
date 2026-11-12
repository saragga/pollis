# Ask Pollis Strategies — Factsheet

**Ask Pollis Strategies** lists the ways Ask Pollis can answer a question, chooses the one it uses, and installs or writes new ones.

| | |
|---|---|
| **Purpose** | Choose, compare, install and write the answering strategies of Ask Pollis |
| **Steps of a strategy** | Search, Rerank (optional) and Answer, in that order |
| **Strategies of Pollis** | Panel Aware, the one in use unless another is chosen, and Base |
| **Strategies of your own** | TOML files of `~/.pollis/ask/strategies/` |
| **Catalogue** | `Trumpingtons/pollis-strategies` on GitHub |
| **Score shown** | Panel FAQ Score, from the latest run of Evaluate Answering Models on the Panel FAQ |
| **Setting** | `pollis.ask.strategy`, the id of the strategy in use |
| **Key choice** | How much a question asked in a panel leans on that panel |

## When to Use Ask Pollis Strategies
- Choosing the strategy that Ask Pollis uses for every question, with Use.
- Seeing how well each strategy answers the questions of the panels, in the column Panel FAQ Score.
- Comparing two strategies on the same questions, with Evaluate..., which opens Evaluate Answering Models.
- Installing a strategy from the catalogue on GitHub, or updating one installed.
- Writing a strategy of your own, starting from a copy of another with Copy as New....
- Finding why a strategy file is left out, under Files That Are Not Strategies.

## What Ask Pollis Strategies Does Not Do
An answering strategy does not choose the model that answers, the embedding model or the reranker: those are set in Set Active Models. A strategy is settings for steps that Pollis carries out, never code, so a strategy cannot add a step of its own, call a program or reach the internet.

## See Also
- [Overview](overview.md) · [Writing a Strategy](writing.md) · [Comparing Strategies](comparing.md)
