# Diagnostics

Values change with settings, so the checks ask whether an estimate is stable under other settings, whether it behaves correctly on known series, and whether the series is stationary.

## How to Test on Known Series

Before trusting a value, run the code on a series whose answer is known:

| Series | Permutation entropy | Sample entropy, r = 0.2 |
|---|---|---|
| Long white noise | Near 1 | About 2.19 |
| Straight line | 0 | Near 0 |
| Sine, well sampled | Low | Near 0 |

A permutation value above 1 shows that the estimator does not normalise. A value at the far end of what is expected suggests a mistake in the inputs. Run each new setting on noise of the same length too, as a baseline for how short-series bias acts.

## How to Check the Order

**Order Sensitivity** prints permutation entropy for orders 3 to 8. A rising value often levels off at low m, and it declines at high m when m! exceeds what the series can fill. At the order where the 5 m! rule fails, the fall is a data limit and not a property of the system. The value is stable when several valid orders tell a similar story. For example, a series of 1000 points supports up to m = 5, whereas a value at m = 8 means little.

## How to Check the Tolerance

**SampEn vs r** plots the value from r of 0.05 to 0.5 sd. Values fall as r rises, roughly by ln 2 for each doubling. Gaps or infinite values at low r mean that no matches were found. A rise at low r can be noise in a small count. Choose r in a stable range, and use the same r when comparing series. A sharp change suggests the level of noise, since matches are mainly noise-driven below it, and the scale of the true structure lies above it.

## How to Check Stationarity

**Stationarity (PE)** gives permutation entropy for each half of the series. Close values do not prove stationarity, and it is unclear what counts as a large gap unless there is a baseline: compare with the gap seen in surrogates of the same length. **Entropy vs Time** gives a rolling view, with a window of 200. At the default m = 5, a window of 200 is below the 5 m! rule of 600, so that values are biased low, which makes a lower m or longer window a good choice there.

## How to Check the Entropy Rate

**Entropy Rate** prints sample entropy at m from 2 to 6. A decrease that levels off suggests structure that is captured by longer templates, and a flat line matches white noise. If values rise or fail at larger m, the counts are too low to trust. The action only lists the values, with no extrapolation, so that any statement about a limit is a judgement from the list. A series with short memory settles quickly, and one with long memory declines gradually.

## How to Check the Surrogate Test

**Surrogate Distribution** shows the histogram of null values, with the observed value marked. It should have a sensible spread, and the observed value should be clearly apart for a claim to stand. A very narrow null can make a trivial gap significant. Random surrogates vary from run to run, as the code sets no seed, so repeat the action to see how p changes. Check that results agree between `RandomFourier` and `IAAFT` in **Multiple Surrogates**, and read the `RandomShuffle` result as a test of time dependence only.

## See Also

- [Assumptions](assumptions.md) · [Interpretation](interpretation.md) · [Permutation Entropy](permutation-entropy.md) · [Sample Entropy](sample-entropy.md)
