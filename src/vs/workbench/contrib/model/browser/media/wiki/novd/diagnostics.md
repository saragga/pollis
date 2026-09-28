# Diagnostics

## False Alarm Rate
Run the detector on data you **know** to be normal (**False Alarm Check**).
- **One-Class SVM**: the share of training points outside the boundary should be close to nu.
- **Gaussian**: the share of training points above the threshold should be close to alpha. A much larger share means the data is not normal (heavy tails, clusters).
- **CUSUM**: simulate in-control series and measure the **average run length** (ARL0), the mean number of steps before a false alarm. For k = 0.5, h = 5 it is several hundred steps.

## Held-Out Normal Data
The training false-alarm rate is optimistic. If possible, keep part of the clean data aside and check the rate there too.

## Method Agreement
Compare the One-Class SVM and Gaussian flags (**Compare Methods**). Points flagged by both are strong novelties; points flagged by only one show where the methods' assumptions differ.

## Visual Checks
- Plot the test points over the training cloud (**Novelty Plot**). Novel points should sit away from it.
- For CUSUM, plot both statistics with the threshold. A steady climb after a known change is the expected pattern; spikes that reset quickly suggest outliers rather than a shift.

## Quick Checklist

| Check | Good sign | Warning sign |
|---|---|---|
| Training false alarms | Near nu or alpha | Well above the target |
| Held-out normal data | Similar rate | Many more flags |
| OC-SVM vs Gaussian | Mostly agree | Large disagreement |
| CUSUM ARL0 | Long run lengths | Alarms on in-control data |

## See Also
- [Interpretation](interpretation.md) · [Assumptions](assumptions.md)
