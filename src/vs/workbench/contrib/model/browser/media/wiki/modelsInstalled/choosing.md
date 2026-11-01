# Set Active Models — Choosing a Local Model

## Whether a Local Model Fits This Computer's Memory
A local model has to fit in the memory free when it runs, and the file size in Set Active Models is the lower bound of what it takes. A chat model needs more on top for its context, the text it holds at once, which grows with the length of the conversation it is allowed. When a model barely fits, the computer starts moving memory to disk and each word takes far longer, so it is worth leaving room for the other programs in use. Evaluate Answering Models warns when a model chosen may not fit in the memory free.

## Choosing the Quantisation of a Chat Model
For a chat model, `Q4_K_M` is the usual balance of size and quality, and it is the version Pollis picks first when a repository has several. With memory to spare, `Q5_K_M` or `Q6_K` of the same model can be downloaded from **Other Versions**. Below `Q4`, the loss starts to show in answers, so a smaller model at `Q4_K_M` is often better than a larger model at a lower quantisation. Evaluate Answering Models runs two versions on the same questions, which shows whether the extra bits change the answers on a given kind of work.

## Choosing the Quantisation of an Embedding Model or a Reranker
Embedding models and rerankers are small, so Pollis prefers `Q8_0` for both, which is nearly lossless. A lower quantisation saves little, and an embedding model finds passages by small differences between numbers, which rounding can blur. Changing the embedding model of Ask Pollis also means making the index again, since vectors from two models cannot be compared. Evaluate Embedding Models compares candidates on the same questions before that is done, including their memory and the size of their index.

## Which Local Model an Agent Needs
An agent, such as the one of a Model Tasks and Routing tier, works by calling tools, so its model must show **Yes** in the **Tools** column of Set Active Models. Agents also read long instructions and many results, so a chat model with the room for a large context serves them better than one that merely answers well. For a tier that runs often on small tasks, speed may matter more than quality, which favours a smaller model. A tier can stay on a cloud model while another uses a local one, as each tier is set on its own.

## Keeping Local Models That Are Still Used
Model files are large, and several versions of one model add up. Before deleting a file with **Open Folder**, Compose > Orchestration > Model Tasks and Routing shows whether a tier runs on it, and **Set Models** may also name it as the answering or embedding model. A file deleted by mistake from `~/.pollis/models` comes back the next time a panel or a tier asks for it, as long as the computer can reach Hugging Face. A file in the Hugging Face cache may be shared with other programs, and they would have to download it again.

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [GGUF Files and Quantisation](gguf-and-quantisation.md)
