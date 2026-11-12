# Knowledge Base — Overview

The **Knowledge Base** is a collection of openly licensed texts that a model can answer from: books, lecture notes, reports and manuals, chosen for the subjects of Pollis. Its texts come from `PollisKnowledge.jl`, each with its licence, and the page switches them on, downloads them and builds their index, as Retrieval-Augmented Generation does for a collection of your own documents.

## What the Knowledge Base Holds
A text is in the Knowledge Base only when its licence lets it be shared. Each row of the table names a text with its **Type**, such as Book, its **Subject**, its **Licence**, its **Size** as downloaded, what is kept of it (**As Kept**), how it is cut into **Passages**, and its switch, **In the Knowledge Base**. The books include Dive into Deep Learning ([Zhang, Lipton, Li and Smola (2023)](#ref-ZLLS2023a)), Probabilistic Machine Learning: An Introduction ([Murphy (2022)](#ref-Mur2022a)), Algorithms for Optimization ([Kochenderfer and Wheeler (2027)](#ref-KW2027a)) and Algorithms for Decision Making ([Kochenderfer, Wheeler and Wray (2022)](#ref-KWW2022a)). **Authors' Page** opens the page of a text on its authors' site, and a click on the title of a text on this computer opens it.

## The Printed Books, With Thanks to Their Authors
The books of the Knowledge Base are open because their authors made them so, and each is also a printed book. Above the table, **With Thanks to Their Authors** shows a card for each: its cover, as its authors show it on their page, its title, edition, authors, publisher and year. A click on the cover, or on **Authors' Page**, opens the book's page on its authors' site, and **Hard Copy** opens the page of its publisher, where the printed book is sold. The covers come with `PollisKnowledge.jl` and belong to their publishers.

## Licences of the Texts in the Knowledge Base
The **Licence** column links to the text of each licence. A text under CC BY-NC-ND, no derivatives, is kept as the PDF its authors distribute, unchanged. A text under CC BY-SA, share alike, may be changed, and the changes are shared under the same licence: Dive into Deep Learning is kept as its Markdown sources, one file a section, with its code left out, so that a model answering from it is not led to Python where Pollis works in Julia. **As Kept** says what was changed. Each downloaded text carries `LICENCE.md`, with its authors, source, changes and licence.

## Switching a Text On and Off
**On** downloads the text the first time, from the release of `PollisKnowledge.jl` that holds it, and keeps it in the folder of Julia artifacts, `~/.julia/artifacts`; the row shows **Downloading...** meanwhile. **Off** leaves the text on the computer and out of the next index. A text switched on is in the index only once **Build the Index** has run again, and the page says when the texts switched on have changed since the last build.

## How a Text Is Cut into Passages
A text in PDF is read as one document, cut at its bookmarks and then into passages of about **Passage Length** words, at its paragraphs. A text from Markdown is one document a section, cut at its headings. Each passage keeps the heading it is under, so a passage found names the chapter and section it comes from. The **Passages** column says how each text is cut, and how many of its passages the index holds once it is built.

## Building the Index of the Knowledge Base
**Embedding Model** chooses the model that embeds the passages, by default that of Ask Pollis, and **Passage Length** their length, from 100 to 500 words. **Build the Index** reads the texts switched on, cuts and embeds them into `~/.pollis/rag/knowledge-base.duckdb`. Each passage is embedded once by each model, ever, so building again after switching another text on embeds only the new passages. The page says when the index was embedded with another model or cut to another length than the ones chosen.

## Asking Ask Pollis from the Knowledge Base
Once its index is built, the **Knowledge Base** is listed in **Search In** of Ask Pollis, after the sources of Pollis and the Julia Manual. Ticked alone, it is the only thing searched. Ticked with sources of Pollis, each is searched in its own index and gives part of the passages: most come from the index nearest the question when both were embedded with the same model, and from Pollis otherwise. **Auto** does not search the Knowledge Base; tick it, or choose **All Sources**. A passage of a PDF opens at its page in the PDF Viewer, and a passage of Dive into Deep Learning at its heading in the Markdown preview.

## Common Workflow
1. Read the **Licence** and **As Kept** of a text, and switch it **On**.
2. Keep the default **Passage Length**, 250 words, to begin with.
3. Choose the **Embedding Model** and **Build the Index**.
4. Tick **Knowledge Base** in **Search In** of Ask Pollis, ask a question the text answers, and follow the passages it cites.
5. Switch on more texts, and **Build the Index** again.

## References

<a id="ref-KW2027a"></a>Kochenderfer, M. J. and Wheeler, T. A. (2027). *Algorithms for Optimization*, 2nd ed. MIT Press. [algorithmsbook.com/optimization](https://algorithmsbook.com/optimization/)

<a id="ref-KWW2022a"></a>Kochenderfer, M. J., Wheeler, T. A. and Wray, K. H. (2022). *Algorithms for Decision Making*. MIT Press. [algorithmsbook.com/decisionmaking](https://algorithmsbook.com/decisionmaking/)

<a id="ref-Mur2022a"></a>Murphy, K. P. (2022). *Probabilistic Machine Learning: An Introduction*. MIT Press. [probml.github.io/pml-book/book1.html](https://probml.github.io/pml-book/book1.html)

<a id="ref-ZLLS2023a"></a>Zhang, A., Lipton, Z. C., Li, M. and Smola, A. J. (2023). *Dive into Deep Learning*. Cambridge University Press. [d2l.ai](https://d2l.ai) · [arXiv:2106.11342](https://arxiv.org/abs/2106.11342)
