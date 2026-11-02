# Autoencoder

The **Autoencoder** tab fits a deterministic encoder and decoder by least squares on a standardised table. It gives each row a code and a reconstruction, with no probability model behind either.

## What the Autoencoder Tab Computes

Each standardised row x goes through the encoder to give a code z of length k, and the decoder turns z into a reconstruction:

- enc(x) = W2 · relu(W1 · x + b1) + b2
- dec(z) = W4 · relu(W3 · z + b3) + b4
- loss = (1 / (n × p)) × sum over rows i and columns j of (x_ij − dec(enc(x_i))_j)^2

The last encoder layer has no activation, so a code can take any real value. `Flux.mse` averages over all entries of the batch. Adam updates the weights on shuffled batches, and `losses` records the loss over the whole matrix after each epoch.

## Which Inputs the Autoencoder Tab Takes

| Input | Role in the code | Default |
|---|---|---|
| **Feature Matrix** | n × p table, standardised by column inside the code | `X_train` |
| **Latent Dimensions** | k, the width of the bottleneck | 2 |
| **Hidden Units** | Width of the single hidden layer on each side | 64 |
| **Epochs** | Full passes over the rows | 100 |
| **Learning Rate** | Adam step size | 0.001 |
| **Batch Size** | Rows per gradient step | 32 |

A **Latent Dimensions** value equal to the number of columns leaves no bottleneck, and a larger one also makes **vs PCA** fail, since it asks for more singular vectors than exist.

## How an Autoencoder Relates to Principal Component Analysis

The best linear autoencoder under squared error spans the subspace of the leading principal components ([Baldi and Hornik (1989)](#ref-BH1989a)), so PCA is the natural yardstick. **vs PCA** reports three mean squared errors on the standardised training rows: `model`, `pca` with the same number of dimensions, and `mean_only`, the error of predicting every column by its mean. An autoencoder above `pca` has either trained too little or found a poor optimum, and a smaller error says the nonlinearity pays on these rows. Because all three are in-sample, a small advantage may not carry over to new data.

## How to Flag Anomalies with the Reconstruction Error of an Autoencoder

The rows a network rebuilds worst can be treated as candidates for anomalies, an approach studied by [Sakurada and Yairi (2014)](#ref-SY2014a). **Reconstruction Error** plots the mean squared error of each row and lists the worst 5%, so it returns rows whether or not any is unusual. **Encode New Data** compares new rows, held in `X_new` with the same columns, against the 95th percentile of the training errors. Training errors are optimistic, so more than 5% of fresh rows from the same distribution can exceed that threshold. A flagged row may be odd, or may simply lie where the bottleneck is too narrow.

## How to Choose the Bottleneck Size of an Autoencoder

**Choosing Latent Size** retrains from 1 up to 8 latent dimensions, stopping at the number of columns, and plots the reconstruction error against the size. The usual reading is to stop where the curve stops falling quickly. In-sample error tends to fall as the code widens, so the bend is a judgement and not a test, and the plot uses no held-out rows. **Latent Scatter** shows only the first two dimensions, so a two-dimensional code is chosen for viewing and not because the data have two dimensions.

## How to Read the Latent Codes of an Autoencoder

**Latent Space Statistics** gives the mean, spread and range of each dimension, and a near-constant one carries nothing. **Latent Traversal** moves one dimension from its 5th to its 95th percentile with the others at their means, and draws the decoded features as a heatmap on the standardised scale; `j` selects the dimension. **Feature-Latent Correlation** gives the linear correlation of each original column with each dimension. **Reconstruction Quality Check** sets one row beside its reconstruction, so that the features the bottleneck drops can be seen. The signs and order of the dimensions carry no meaning and can change when the weights start differently.

## Where the Autoencoder Tab Misleads

Low reconstruction error does not make the codes meaningful: distances in `Z` follow no fixed scale, and two runs can give different axes. The space between training codes need not decode to anything realistic. **Generate Samples** fits a Gaussian to `Z` and decodes draws from it, which is rough when the codes are not Gaussian, and the output carries no noise on top of the decoder. Its units are those of **Feature Matrix**. The tab also adds no noise to its inputs, so it does not train the denoising form of [Vincent, Larochelle, Bengio and Manzagol (2008)](#ref-VLBM2008a); that form needs a change to `loss`.

## What to Compare an Autoencoder With

Run PCA first, through **vs PCA**, since it has no tuning and a unique answer for its subspace. Use the **VAE** tab when decoded samples or a regular latent space matter more than the closest reconstruction. For a picture of neighbourhoods alone, a neighbour-embedding method such as t-SNE may serve better, though it has no decoder and offers no reconstruction error to judge. An autoencoder earns its extra parameters only when the data are nonlinear and there are enough rows to fit it: with ten columns and two latent dimensions, the default of 64 **Hidden Units** gives 1,676 parameters.

## References

<a id="ref-BH1989a"></a>Baldi, P. and Hornik, K. (1989). Neural networks and principal component analysis: learning from examples without local minima. *Neural Networks* 2(1), 53–58. [doi:10.1016/0893-6080(89)90014-2](https://doi.org/10.1016/0893-6080(89)90014-2)

<a id="ref-SY2014a"></a>Sakurada, M. and Yairi, T. (2014). Anomaly detection using autoencoders with nonlinear dimensionality reduction. *Proceedings of the MLSDA 2014 2nd Workshop on Machine Learning for Sensory Data Analysis*, 4–11. [doi:10.1145/2689746.2689747](https://doi.org/10.1145/2689746.2689747)

<a id="ref-VLBM2008a"></a>Vincent, P., Larochelle, H., Bengio, Y. and Manzagol, P.-A. (2008). Extracting and composing robust features with denoising autoencoders. *Proceedings of the 25th International Conference on Machine Learning*, 1096–1103. [doi:10.1145/1390156.1390294](https://doi.org/10.1145/1390156.1390294)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Variational Autoencoder](vae.md)
