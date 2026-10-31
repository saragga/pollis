# Models Installed — Overview

## What Models Installed Shows
**Models Installed**, in Compose > Local Models, lists the GGUF models on this computer: those Pollis downloaded and those already in the Hugging Face cache. Pollis runs these models with llama.cpp, which comes with it, so a local model costs nothing to use and what it is given stays on the computer. A model usually arrives the first time a panel or a Model Tasks and Routing tier needs it, or through **Other Versions**. A click on a column's header sorts the list by that column, and the models start sorted by name.

## What the Kind of a Local Model Means
The **Kind** column of Models Installed says what a local model is for, read from the metadata in its file. A **Chat** model writes text, and is the kind that answers questions and runs agents. An **Embedding** model turns a text into a list of numbers, so that passages close in meaning can be found by search ([Reimers and Gurevych (2019)](#ref-RG2019a)), which is how Ask Pollis finds its passages. A **Reranker** reads a question with a passage and scores how well the passage answers it ([Nogueira and Cho (2019)](#ref-NC2019a)), which puts the best of the passages found first.

## Whether a Local Model Can Read Images and Audio
The **Reads** column of Models Installed says what a local model can take in. Every model reads **Text**. **Image** and **Audio** appear when a projector is beside the model: a second GGUF file, with `mmproj` in its name, that turns a picture or a sound into what the model understands, as LLaVA does for images ([Liu, Li, Wu and Lee (2023)](#ref-LLWL2023a)). A model without a projector cannot read images or audio, even when it was trained to. When the repository of a model has a projector, **Other Versions** lists it with a link to download it.

## Whether a Local Model Can Call Tools
The **Tools** column of Models Installed says whether a chat model can call tools, which is read from the chat template inside its file. **Yes** means the template uses the tools it is given, as the agent of a Model Tasks and Routing tier needs; **No** means it does not. A dash means the model is not a chat model, as with embedding models and rerankers, which are given no tools. Tools says what the template allows, not how well the model chooses among tools, which only trying it on a task shows.

## Where the Files of Local Models Are Kept
The **Where** column of Models Installed gives the origin of each file. **Pollis** means a file in `~/.pollis/models`, under the owner and the repository it came from on Hugging Face. **Hugging Face cache** means a file another program downloaded, in the folder of `HF_HUB_CACHE`, else `hub` in the folder of `HF_HOME`, else `~/.cache/huggingface/hub`. Pollis finds and runs these without copying them. **Show in Folder** opens the folder of the file, which is also how a model is deleted, and the full path appears when the pointer rests on the model's name.

## Which Tasks Run on Which Local Model
The **Model Tasks and Routing** column of Models Installed names the tiers set to run on each model, with a dash when no tier uses it. The tiers themselves are chosen in Compose > Orchestration > Model Tasks and Routing, which the line under the list opens. This column is the place to look before deleting a model, and to see whether a large model on the computer is in use at all.

## Getting Another Version of a Local Model
**Other Versions** in Models Installed opens the other files of a model's repository on Hugging Face, each with its size: the other quantisations, and the projector if there is one. A version on the computer is marked **Installed**, and any other has a **Download** link. The link appears only for a model whose repository is known, and looking up the files needs a connection to Hugging Face. The list refreshes when the page is shown again, when Pollis gets the focus back and when the model of a tier changes.

## References

<a id="ref-LLWL2023a"></a>Liu, H., Li, C., Wu, Q. and Lee, Y. J. (2023). Visual instruction tuning. *NeurIPS*. [arXiv:2304.08485](https://arxiv.org/abs/2304.08485)

<a id="ref-NC2019a"></a>Nogueira, R. and Cho, K. (2019). Passage re-ranking with BERT. [arXiv:1901.04085](https://arxiv.org/abs/1901.04085)

<a id="ref-RG2019a"></a>Reimers, N. and Gurevych, I. (2019). Sentence-BERT: sentence embeddings using Siamese BERT-networks. *EMNLP*. [arXiv:1908.10084](https://arxiv.org/abs/1908.10084)

## See Also
- [Factsheet](factsheet.md) · [GGUF Files and Quantisation](gguf-and-quantisation.md) · [Choosing a Local Model](choosing.md)
