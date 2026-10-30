# Interpretation

## Posterior Mean
**Posterior Mean** gives the mean and variance of each coordinate for both runs. For the default target the truth is mean 0 and variance 1 + 3^2 = 10 in every dimension. A chain in one mode gives a mean near +3 or -3 and a variance near 1: precise-looking and wrong.

## Credible Intervals
**Credible Intervals** gives the equal-tailed 95% interval of each coordinate. For a bimodal target the PT interval spans both modes, about [-4.5, 4.5] here, including the region of low density between them: an equal-tailed interval summarises a multimodal distribution poorly, and the joint samples say more.

## Chain Count Sweep
**Chain Count Sweep** reruns PT with 2, 4, 8, 16 and 32 chains, printing Lambda, round trips, restarts and the mode share. Lambda is a property of the target and the reference, so its estimate should settle as the chains increase; round trips grow until about 2 Lambda chains and then level off.

## Mode Separation Sweep
**Mode Separation Sweep** moves the modes to +-m for m from 1 to 6, widening the reference with them. At m = 1 the modes overlap and the single chain is fine; from m = 3 it is trapped while PT balances them. Lambda grows with the separation, and so do the chains needed.

## Normalising Constant
**Normalising Constant** estimates log Z with the stepping-stone estimator along the PT path. Since the reference is a normalised Gaussian, this is the log normalising constant of the target, which for the default is log 2 + (d / 2) log(2 pi), about 2.531 in two dimensions. A single chain gives no estimate: it needs the path.

## Single Chain vs PT
**Single Chain vs PT** compares the two mode shares and says whether the single chain was trapped, PT balanced the modes, or both agree. With no round trips in the last round, PT's samples are not to be trusted either.

## See Also
- [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md) · [Parallel Tempering](parallel-tempering.md)
