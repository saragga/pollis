# Attention

Attention lets each token gather information from all the others, with learned weights. It is the operation that makes a transformer's vectors depend on context.

## How Self-Attention Works

Each token produces three vectors: a query, a key and a value. A token's query is compared with every key, which gives scores across the sentence, and a softmax turns those scores into weights. The new vector is the weighted sum of the values:

- Attention(Q, K, V) = softmax(Q Kᵀ / sqrt(d_k)) V

Here d_k is the size of a key, and dividing by its square root keeps the scores in a workable range. Padding positions are masked out. The formula comes from [Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser and Polosukhin (2017)](#ref-VSPUJ...2017a).

## What Multiple Heads and Layers Add

A head applies its own learned query, key and value maps, so several heads can follow different relations at once. Their outputs are joined and mapped back to the hidden size. A full layer adds a position-wise network and residual connections, and layers stack, so information can travel several steps. `bert-base-uncased` has 12 layers of 12 heads. Attention alone ignores word order, so BERT adds a learned position embedding to each token at the start, as described by [Devlin, Chang, Lee and Toutanova (2019)](#ref-DCLT2019a).

## How the Attention Weights Action Works

**Attention Weights** reloads **Model** with `output_attentions=true`, since the plain model does not return attention scores. It encodes `attn_text` and takes `attention_score[:, :, 1, 1]` from the last layer, which is head 1 for sentence 1. The heatmap puts keys on the x axis and queries on the y axis, with WordPiece tokens as labels. Each row shows where one token looked. To see another layer, change `outputs[end]`, and to see another head, change the third index. One head of one layer is only a small sample of what the model computes.

## What Attention Maps Show

Maps from BERT often show structure: `[CLS]` and `[SEP]` draw much attention, and some heads link a word to its neighbours or to its syntactic partners. The survey by [Rogers, Kovaleva and Rumshisky (2020)](#ref-RKR2020a) reviews what has been learned about such patterns. Compare layers to see how the patterns shift with depth. Compare a sentence with a paraphrase to see whether similar links appear. Maps are good for raising hypotheses about what a model does, and for catching tokenisation problems.

## Why Attention Is Not Explanation

High attention does not establish that a token caused an output. [Jain and Wallace (2019)](#ref-JW2019a) show that attention often correlates weakly with other importance measures, and that quite different attention patterns can yield equivalent predictions, in the models they study. Layers also mix information, so that a position in a late layer already represents much of the sentence, and it no longer stands for its own word. The visible map is one step in a long calculation. Treat it as a description of a mechanism, and not as a reason for a result.

## Where Attention Sits in Other Methods

**Token Attribution** offers a different view, by asking how much a small change in each token's input embedding changes the `[CLS]` norm. Its target differs from a sentence embedding, so the two views need not agree. The same attention blocks appear in many language models, and [Goodfellow, Bengio and Courville (2016)](#ref-GBC2016a) cover the wider neural network background. **Compare Models** shows that a shallower stack trained for similarity can outdo a deeper one that was not, so architecture is only a part of what determines quality.

## References

<a id="ref-DCLT2019a"></a>Devlin, J., Chang, M.-W., Lee, K. and Toutanova, K. (2019). BERT: pre-training of deep bidirectional transformers for language understanding. *NAACL-HLT*. [arXiv:1810.04805](https://arxiv.org/abs/1810.04805)

<a id="ref-GBC2016a"></a>Goodfellow, I., Bengio, Y. and Courville, A. (2016). *Deep Learning*. MIT Press. [deeplearningbook.org](https://www.deeplearningbook.org/)

<a id="ref-JW2019a"></a>Jain, S. and Wallace, B. C. (2019). Attention is not explanation. *NAACL-HLT*, 3543–3556. [doi:10.18653/v1/N19-1357](https://doi.org/10.18653/v1/N19-1357)

<a id="ref-RKR2020a"></a>Rogers, A., Kovaleva, O. and Rumshisky, A. (2020). A primer in BERTology: what we know about how BERT works. *Transactions of the Association for Computational Linguistics* 8, 842–866. [doi:10.1162/tacl_a_00349](https://doi.org/10.1162/tacl_a_00349)

<a id="ref-VSPUJ...2017a"></a>Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, L. and Polosukhin, I. (2017). Attention is all you need. *NeurIPS*. [arXiv:1706.03762](https://arxiv.org/abs/1706.03762)

## See Also

- [Factsheet](factsheet.md) · [Tokenisation](tokenisation.md) · [Interpretation](interpretation.md) · [Overview](overview.md)
