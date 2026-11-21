# MAF

The **MAF** tab stacks masked autoregressive steps, after [Papamakarios, Pavlakou and Murray (2017)](#ref-PPM2017a). Each variable is shifted and scaled given those before it, so a single step changes every variable.

## What a Masked Autoregressive Step Computes

For a given order of the variables, each step computes:

- z_i = (x_i − mu_i(x_1, ..., x_(i−1))) · exp(−alpha_i(x_1, ..., x_(i−1)))
- log |det J| = −sum over i of alpha_i

One forward pass of a masked network gives all mu_i and alpha_i. The first variable has no predecessors, so its mu_1 and alpha_1 are constants. Step 1 keeps the order of the rows, and each later step reverses the z it receives, which alternates the direction of conditioning across the stack.

## How Masks Build an Autoregressive Network

The network follows MADE ([Germain, Gregor, Murray and Larochelle (2015)](#ref-GGML2015a)). Each hidden unit k has a degree, `mod1(k, D - 1)`, cycling through 1 to D − 1. Fixed 0/1 masks multiply the weights: a hidden unit sees only inputs and earlier units whose degree is at most its own, and output i reads only units of degree less than i. So mu_i and alpha_i can depend only on x_1 to x_(i−1), whatever the weights. The code needs **input_dim** of at least 2 and, for every dependency to be possible, **hidden_size** of at least D − 1.

## Which Inputs the MAF Tab Takes

| Input | Role in the code | Default |
|---|---|---|
| **input_dim** | D; must equal the number of rows of **Input data** | Set for the default **Input data** |
| **num_flows** | Autoregressive steps | 8 |
| **hidden_size** | Width of each masked hidden layer | 128 |
| **num_layers** | Hidden tanh layers in each masked network | 2 |

**num_bins** does not apply to this tab.

## How the MAF Tab Relates to the Published Model

The authors of MAF add batch normalisation after each autoregressive layer, and report that it reduces training time and increases stability. They also describe a variant whose base is a mixture of Gaussians. The tab stacks the autoregressive steps directly on a standard normal base, and its masked networks share one set of degrees among all hidden layers. The order of the variables in step 1 is that of the rows of **Input data**.

## What Masked Autoregressive Steps Do Well

Every variable can depend on all earlier ones within one step, and a coupling layer is the special case that leaves half of the variables unchanged. Reversing the order brings dependence in both directions across the stack. A density still takes one network pass per step for a whole batch, as in the coupling tabs. For density estimation with no plan to sample, that combination is the reason to choose this tab.

## What Limits a Masked Autoregressive Flow

Inverting a step takes D sequential passes, since x_i needs x_1 to x_(i−1), so sampling is slow for large D. Each conditional stays Gaussian within a step, and complex shapes take depth. Only the given order and its reverse occur, so reordering the rows of **Input data** can change the fit. Training starts from random weights, so repeated fits show how much of a difference between settings is noise.

## What to Compare MAF With

Compare first with **vs Multivariate Gaussian**, and then with **RealNVP** at a similar number of parameters on **Held-Out Log-Likelihood**. **Neural Spline** may do better on sharply shaped densities. For sampling, the inverse autoregressive flow reverses the costs, with fast sampling and slow density evaluation at new points ([Kingma, Salimans, Jozefowicz, Chen, Sutskever and Welling (2016)](#ref-KSJCS...2016a)). Repeating each fit shows whether a difference exceeds the spread from random starting weights.

## References

<a id="ref-GGML2015a"></a>Germain, M., Gregor, K., Murray, I. and Larochelle, H. (2015). MADE: masked autoencoder for distribution estimation. *Proceedings of the 32nd International Conference on Machine Learning*, *JMLR W&CP* 37, 881–889. arXiv:1502.03509. [doi:10.48550/arXiv.1502.03509](https://doi.org/10.48550/arXiv.1502.03509)

<a id="ref-KSJCS...2016a"></a>Kingma, D. P., Salimans, T., Jozefowicz, R., Chen, X., Sutskever, I. and Welling, M. (2016). Improving variational inference with inverse autoregressive flow. arXiv:1606.04934. [doi:10.48550/arXiv.1606.04934](https://doi.org/10.48550/arXiv.1606.04934)

<a id="ref-PPM2017a"></a>Papamakarios, G., Pavlakou, T. and Murray, I. (2017). Masked autoregressive flow for density estimation. arXiv:1705.07057. [doi:10.48550/arXiv.1705.07057](https://doi.org/10.48550/arXiv.1705.07057)

## See Also

- [Factsheet](factsheet.md) · [RealNVP](realnvp.md) · [Neural Spline Flows](nsf.md) · [Decision Guide](decision-guide.md)
