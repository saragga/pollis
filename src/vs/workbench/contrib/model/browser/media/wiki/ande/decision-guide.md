# Decision Guide

| Situation | Method | Why |
|---|---|---|
| No labels, nonlinear structure | **AutoEncoder** ([autoencoder](autoencoder.md)) | Unsupervised; reconstruction error as score |
| A few labelled anomalies | **DeepSAD** ([deepsad](deepsad.md)) | Uses the labels to tighten the normal region |
| Labelled anomalies, single training stage | **ESAD** ([esad](esad.md)) | End-to-end, no separate pretraining |
| Small, low-dimensional table | Proximity detectors | KNN or LOF, no training needed |

## Decision Flow

1. **Is the data small or low-dimensional?** Try KNN and LOF first (Proximity-Based Outlier Detection). Move here only if they fall short.
2. **Do you have any confirmed anomalies?**
   - No: AutoEncoder.
   - Yes, even a handful: DeepSAD or ESAD, which usually beat the unsupervised autoencoder at finding anomalies of the same kind.
3. **DeepSAD or ESAD?** DeepSAD is the established method with a two-stage (pretrain, train) procedure; ESAD trains everything at once and adds a reconstruction term to the score. Try both and compare the rankings.

## Rules of Thumb
- **Scale inputs to [0, 1].**
- **Latent size** 2 to 8 for tabular data, well below the number of features.
- **Check several seeds** before trusting a ranking.
- **Keep a proximity baseline** for comparison.

## See Also
- [Overview](overview.md) · [Factsheet](factsheet.md)
