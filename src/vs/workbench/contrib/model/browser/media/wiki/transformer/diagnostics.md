# Transformers — Diagnostics

Transformers can reach a very low training loss without learning anything that transfers. These checks look at training, at the comparison with a simple model, and at how attention itself behaves.

## How to Read the Transformer Training Curve

**Training Curve** trains for 20 more epochs and records the loss on the first 256 examples after each. A curve still falling calls for more epochs, especially given the small learning rate. A flat curve at a high value suggests that the inputs are unscaled, that the token ids are wrong, or that the learning rate is too low for this size of model. As the 256 examples are also training data, a curve near zero can simply mean memorisation.

## How to Compare a Transformer with a Simple Baseline

**vs Simple Baseline** sets the loss of the model beside that of a very simple rival, computed on the same 256 examples. The rival is the class frequencies for **Encoder**, token frequencies for **Decoder** and **Encoder-Decoder**, the last observed value repeated for **Time Series**, and least squares on the numbers alone for **Cross-Modal**. A loss that does not beat the rival means that the model has learned nothing useful. Beating it on training data is a necessary test, and it is not sufficient.

## How to Read the Predictions Plot

**Predictions** differs by tab. **Encoder** shows a confusion matrix, with correct counts on the diagonal. **Decoder** and **Encoder-Decoder** show cross-entropy per position, where a steady rise along the target suggests that later positions are harder or that some positions lack context. **Time Series** plots one lookback, the actual horizon and the forecast, and it shows only one example. **Cross-Modal** plots predictions against targets, where a flat cloud means predictions close to the mean.

## How to Read Attention Entropy per Head

**Attention Entropy per Head** measures how focused each head is in each block, on up to 32 examples. Low entropy says that a head concentrates on a few positions, and high entropy says that it spreads out. An entropy near log(T), for T positions, means uniform attention, and if every head in every block looks like that, attention may not be doing anything, perhaps because training has stopped early. Several heads with near-identical values may be redundant, which would point to using fewer.

## How to Read Attention Across Layers

**Attention by Layer** plots the attention of each block for the first example, averaged across heads. Deeper blocks act on mixed representations, so their maps do not refer to the original tokens, and only the first block lines up exactly with the inputs. Maps that are alike in all blocks may mean extra depth adds little. In **Decoder**, the maps must be empty above the diagonal, in keeping with the causal mask, and any other pattern would mean that the mask is being applied wrongly.

## How to Check Positions

**Position Similarity** shows the cosine similarity between position vectors. With **Sinusoidal**, nearby positions are similar and the pattern is smooth. With **Learned**, a smooth band appears only after enough training, so a noisy matrix means that the table has not yet learned an order and has possibly not seen enough data to do so. The code builds the position table to a fixed length under both settings, so an input longer than the table stops with an indexing error.

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Decision Guide](decision-guide.md)
