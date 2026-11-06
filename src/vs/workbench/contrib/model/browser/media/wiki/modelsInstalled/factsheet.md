# Set Active Models — Factsheet

**Set Active Models** sets the models Pollis AI+ uses, the answering model, the embedding model and the reranker, and lists the local models on this computer, with what each can do, how large it is, where its file is and which tasks run on it.

| | |
|---|---|
| **Purpose** | See the local models on this computer and get other versions of them |
| **Input** | The GGUF files in `~/.pollis/models` and in the Hugging Face cache |
| **Local models** | Run by [llama.cpp](https://github.com/ggml-org/llama.cpp), which comes with Pollis |
| **Columns** | Model, Reads, Tools, Size, Date |
| **Actions** | Open Folder and Other Versions, with Download |
| **Key choice** | Which version of a model suits the memory of this computer |

## When to Use Set Active Models
- Checking which local models are on this computer, and how much disk each one takes.
- Finding whether a model can read images or audio, or call the tools an agent needs.
- Downloading another quantisation of a model, or its projector, from its repository on Hugging Face.

## What Set Active Models Does Not Do
Set Active Models does not set the tiers, which Model Tasks and Routing does, and it does not compare models, which Evaluate Answering Models, Evaluate Embedding Models and Evaluate Reranking Models do. New models are not searched for here either, since **Other Versions** only offers other files of a repository already on the computer. How well a model works is measured by those three pages, on questions with known answers.

## See Also
- [Overview](overview.md) · [GGUF Files and Quantisation](gguf-and-quantisation.md) · [Choosing a Local Model](choosing.md)
