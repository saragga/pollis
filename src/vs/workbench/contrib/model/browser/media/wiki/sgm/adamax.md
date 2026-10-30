# AdaMax

**AdaMax** (Kingma and Ba, 2015) is the variant of Adam in which the second-moment average is replaced by an exponentially weighted **maximum**: u = max(beta2 * u, |g|), per parameter. The step is lr / (1 - beta1^t) times m / u, with Adam's first moment m.

## Under Noise
Adam's scale is the root mean square of recent gradients; AdaMax's is the largest recent absolute gradient, decaying by beta2 = 0.999 per step. A single large noisy gradient raises u at once and keeps the steps small for a while, instead of being averaged in: AdaMax's steps are **bounded** by about lr per parameter and less erratic when the noise has occasional spikes.

## Near the Minimum
Because u reflects the largest noise draws rather than the average, AdaMax's steps near the minimum are a little smaller than Adam's at the same rate, and its noise floor a little lower. **Noise Robustness** shows how it compares with Adam as the noise grows.

## When to Use It
AdaMax is used for **embeddings** and other models with sparse or spiky gradients. On most problems it behaves much like Adam; its suggested default rate is 0.002.

## See Also
- [Adam](adam.md) · [SGD](sgd.md) · [Decision Guide](decision-guide.md)
