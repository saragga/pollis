# Models Installed — Factsheet

**Models Installed** lists the local models on this computer, with what each can do, how large it is, where its file is and which tasks run on it.

| | |
|---|---|
| **Purpose** | See the local models on this computer and get other versions of them |
| **Input** | The GGUF files in `~/.pollis/models` and in the Hugging Face cache |
| **Local models** | Run by [llama.cpp](https://github.com/ggml-org/llama.cpp), which comes with Pollis |
| **Columns** | Model, Kind, Reads, Tools, Size, Where, Model Tasks and Routing |
| **Actions** | Show in Folder and Other Versions, with Download |
| **Key choice** | Which version of a model suits the memory of this computer |

## When to Use Models Installed
- Checking which local models are on this computer, and how much disk each one takes.
- Finding whether a model can read images or audio, or call the tools an agent needs.
- Downloading another quantisation of a model, or its projector, from its repository on Hugging Face.
- Seeing which Model Tasks and Routing tiers run on a model before deleting its file.

## What Models Installed Does Not Do
Models Installed does not choose which model does what: Model Tasks and Routing sets the tiers, and Ask Pollis has its answering model in the status bar and its embedding model in Evaluate Embedding Models. New models are not searched for here either, since **Other Versions** only offers other files of a repository already on the computer. How well a model works is measured by Evaluate Answering Models and Evaluate Embedding Models, on questions with known answers.

## See Also
- [Overview](overview.md) · [GGUF Files and Quantisation](gguf-and-quantisation.md) · [Choosing a Local Model](choosing.md)
