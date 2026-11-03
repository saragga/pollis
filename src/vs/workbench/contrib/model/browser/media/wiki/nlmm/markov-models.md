# Markov Models

A Markov model describes a process moving between a finite set of states over time. When the state is seen only through a noisy signal, the model is a hidden Markov model, and random effects let the transitions differ by subject.

## What the Markov Models Tab Fits

The **Markov Models** tab fits a continuous-time hidden Markov model with two states. The rate matrix for subject i is

Q_i = [-r_i, r_i; q21, -q21], with r_i = q12 exp(eta_i) and eta_i ~ Normal(0, omega²)

Rates q12 and q21 govern moves between the states, and the transition probabilities over an interval of length dt are the matrix exponential exp(Q_i dt). The signal y matches the state with probabilities p1 and p2. Every subject starts from state 1 at the time before the first observation, set by `Categorical([1.0, 0.0])`.

## How the Likelihood of a Hidden Markov Model Is Computed

The forward algorithm, set out in the tutorial of [Rabiner (1989)](#ref-Rab1989a), carries the probability of each state through the observations. At each row, the probabilities move by the transition matrix and are then multiplied by the probability of the observed signal in each state. The sum at the end is the subject's likelihood, so the hidden path needs no enumeration. In a mixed model the forward algorithm runs inside the integral over each subject's random effects, which makes each evaluation expensive and **MCMC** especially slow. [Altman (2007)](#ref-Alt2007a) develops such mixed hidden Markov models for longitudinal data.

## Why Continuous Time Suits Irregular Observations

A discrete-time model needs equally spaced observations, as its transition matrix covers one step. A continuous-time model has rates, so any interval has its own transition probabilities through the matrix exponential. The `dt` column gives the time since the previous observation. Such panel data, observed at intervals with moves unseen in between, are the setting of the R package `msm` by [Jackson (2011)](#ref-Jac2011a), which also covers misclassified states.

## Which Markov Models NoLimits.jl Offers

| Model | State | Time |
|---|---|---|
| `DiscreteTimeObservedStatesMarkovModel` | Observed | Discrete |
| `ContinuousTimeObservedStatesMarkovModel` | Observed | Continuous |
| `ContinuousTimeDiscreteStatesHMM` | Hidden | Continuous |

`NoLimits.jl` also offers a discrete-time hidden Markov model, and `coarsed(...)` for observations that narrow the state down to a set of possibilities. An acyclic rate matrix, with no way back to an earlier state, can use the faster `propagation_mode=:pathsum`.

## Why Hidden Markov Parameters Can Be Hard to Estimate

Rates and emission probabilities trade off: more frequent moves can look like a noisier signal, and the reverse. Estimates can therefore sit some way from their true values even with hundreds of observations, while the likelihood barely changes. Random effects on rates add to the difficulty, since a subject's rate rests on few moves. A good signal, longer sequences and a small number of states all help, and the labels of the states can swap unless the starting values or the model separate them.

## How to Read the Results of the Markov Models Tab

**Stationary Shares and Sojourn Times** turns the rates into quantities with a plain meaning. The long-run share of time in state 1 is q21 / (q12 + q21), and the mean stay in a state is one over its exit rate. **Hidden State Probabilities** shows the filtered probabilities per subject. Omega describes how much the rate of leaving state 1 varies between subjects, as a proportional deviation.

## References

<a id="ref-Alt2007a"></a>Altman, R. M. (2007). Mixed Hidden Markov Models. *Journal of the American Statistical Association* 102(477), 201–210. [doi:10.1198/016214506000001086](https://doi.org/10.1198/016214506000001086)

<a id="ref-Jac2011a"></a>Jackson, C. H. (2011). Multi-State Models for Panel Data: The msm Package for R. *Journal of Statistical Software* 38(8). [doi:10.18637/jss.v038.i08](https://doi.org/10.18637/jss.v038.i08)

<a id="ref-Rab1989a"></a>Rabiner, L. R. (1989). A tutorial on hidden Markov models and selected applications in speech recognition. *Proceedings of the IEEE* 77(2), 257–286. [doi:10.1109/5.18626](https://doi.org/10.1109/5.18626)

## See Also

- [Factsheet](factsheet.md) · [Assumptions](assumptions.md) · [Diagnostics](diagnostics.md) · [Decision Guide](decision-guide.md)
