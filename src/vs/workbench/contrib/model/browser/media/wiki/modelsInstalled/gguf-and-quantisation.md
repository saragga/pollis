# Set Active Models — GGUF Files and Quantisation

## What a GGUF File Holds
GGUF is the file format of llama.cpp ([Gerganov (2023)](#ref-Ger2023a)). One file holds what is needed to run a language model: its weights, and metadata such as its architecture, its tokenizer and its chat template. That is why Pollis can tell the kind of a model, and whether it can call tools, by reading the file, with no other information from the repository it came from. A very large model may be split into several parts, named `-00001-of-00003` and so on, which llama.cpp reads as one model and Set Active Models shows as one.

## What Quantisation Does to a Language Model
Quantisation stores each weight of a model in fewer bits than it was trained with, usually 16 or 32 ([Jacob, Kligys, Chen, Zhu, Tang, Howard, Adam and Kalenichenko (2018)](#ref-JKCZT...2018a)). The file shrinks in proportion, the model needs less memory and on most computers it runs faster, as less has to be moved through memory for each word. The price is rounding: every weight is a little less exact, and answers get slowly worse as the bits fall. The loss is small at first and grows quickly at the low end, and how low a model can go depends on the method: GPTQ, made for language models, reports a small loss down to 3 or 4 bits per weight ([Frantar, Ashkboos, Hoefler and Alistarh (2023)](#ref-FAHA2023a)). A larger model quantised more heavily can still beat a smaller model quantised lightly, for the same memory.

## What the Quantisation Names of GGUF Files Mean
The quantisation is the last part of a GGUF file's name, and the bits per weight below are approximate.

| Quantisation | Bits per weight | Quality |
|---|---|---|
| `F16` | 16 | Nearly the original weights, at the largest size |
| `Q8_0` | About 8.5 | Nearly lossless, and usual for embedding models and rerankers |
| `Q6_K` | About 6.6 | Very close to `Q8_0`, at a smaller size |
| `Q5_K_M` | About 5.7 | A small step down from `Q6_K` |
| `Q4_K_M` | About 4.9 | The usual balance for chat models |
| `Q4_K_S` | About 4.6 | A little below `Q4_K_M` |

In these names the number is the bits of most weights, `K` is the method of llama.cpp that rounds weights in small blocks, and `M` and `S` stand for medium and small.

## Estimating the Size of a GGUF File From the Parameters
The **Size** column of Set Active Models gives the size of the file and, under it, the number of parameters when the file states it, such as `8B` for 8 billion. The two are linked: size in gigabytes is about the billions of parameters times the bits per weight, divided by 8. A model of 8 billion parameters is about 4.9 GB at `Q4_K_M`, 5.7 GB at `Q5_K_M` and 8.5 GB at `Q8_0`. The sum works in reverse too, which helps when comparing models whose files were quantised differently.

## References

<a id="ref-FAHA2023a"></a>Frantar, E., Ashkboos, S., Hoefler, T. and Alistarh, D. (2023). GPTQ: accurate post-training quantization for generative pre-trained transformers. *ICLR*. [arXiv:2210.17323](https://arxiv.org/abs/2210.17323)

<a id="ref-Ger2023a"></a>Gerganov, G. (2023). *llama.cpp: LLM inference in C/C++*. [github.com/ggml-org/llama.cpp](https://github.com/ggml-org/llama.cpp)

<a id="ref-JKCZT...2018a"></a>Jacob, B., Kligys, S., Chen, B., Zhu, M., Tang, M., Howard, A., Adam, H. and Kalenichenko, D. (2018). Quantization and training of neural networks for efficient integer-arithmetic-only inference. *CVPR*, 2704–2713. [doi:10.1109/CVPR.2018.00286](https://doi.org/10.1109/CVPR.2018.00286)

## See Also
- [Factsheet](factsheet.md) · [Overview](overview.md) · [Choosing a Local Model](choosing.md)
