# Many Analysts: Writing the Question

How to write a question and an estimate that every analyst of Many Analysts can answer in the same terms, how to describe data of your own, and what the example asks.

## Why Must Every Analyst Report the Same Estimate in Many Analysts?

The estimates of a many-analysts study can be compared only when they measure the same thing in the same unit. [Silberzahn and 64 coauthors (2018)](#ref-SUMAA...2018a) reported their teams' effects in odds-ratio units, so that 29 different analyses could be set side by side. In Many Analysts, the **Estimate to Report** of step 1 does this: every analyst reads it in `TASK.md` and must report that estimate, with its standard error, its 95% confidence interval and its number of observations, in `estimate.toml`. An analyst may choose any sample, controls and method it believes in, but not what it estimates; without this, the spread would mix differences of analysis with differences of question.

## How to Write the Question of Many Analysts

The **Question** is written in plain words, as you would ask a colleague: the effect of what, on what, for whom and when. It should leave open what a researcher would have to decide, since the point of the study is to see those decisions: which observations to keep, which variables to control for, which estimator and which standard errors. It should not suggest an answer or a method, and it should not say what other analysts did.

## How to Write the Estimate to Report in Many Analysts

The **Estimate to Report** names the quantity, its population and its unit: an average effect on the treated or on everyone, a difference in means, an elasticity, a coefficient, an odds ratio. It names the unit in which the number is to be given, such as dollars of a given year, percentage points or a logarithm, so that no analyst rescales it. Many Analysts adds the standard error, the 95% confidence interval and the number of observations to every estimate. When two quantities are equally natural, such as an effect in levels or in logarithms, choosing one here keeps the study about the analysis rather than the definition.

## How to Describe Data of Your Own in Many Analysts

With **A File of Your Own**, the file is copied into the study's `data/` folder, and each analyst gets a copy of its own with a `README.md` made from **What the Columns Are**. The description is all an analyst knows of the data besides the file itself, so it gives, for each column, its name, what it measures and its unit, and the codes of categorical columns, such as 1 for treated. It says how the data were collected when that matters to the analysis, such as a randomised experiment or a survey, and what a row is: a person, a firm, a year. It leaves out what the data are expected to show.

## What Does the Example Question of Many Analysts Ask?

The example asks for the effect of the National Supported Work job training programme on the earnings of the men who took part, in 1978, reported as the average effect on the treated in 1978 dollars. The data are LaLonde's, from PollisDatasets: `nsw`, the treated and control men of the randomised experiment, and `cps1` to `cps3` and `psid1` to `psid3`, men from the Current Population Survey and the Panel Study of Income Dynamics. [LaLonde (1986)](#ref-LaL1986a) set the survey groups in place of the experiment's controls to test nonexperimental methods against the experiment, and [Dehejia and Wahba (1999)](#ref-DW1999a) revisited them with propensity scores. Each analyst decides whether to use the experiment, a survey group or both.

## References

<a id="ref-DW1999a"></a>Dehejia, R. H. and Wahba, S. (1999). Causal Effects in Nonexperimental Studies: Reevaluating the Evaluation of Training Programs. *Journal of the American Statistical Association* 94(448), 1053–1062. [doi:10.1080/01621459.1999.10473858](https://doi.org/10.1080/01621459.1999.10473858)

<a id="ref-LaL1986a"></a>LaLonde, R. J. (1986). Evaluating the Econometric Evaluations of Training Programs with Experimental Data. *American Economic Review* 76(4), 604–620. [www.jstor.org/stable/1806062](https://www.jstor.org/stable/1806062)

<a id="ref-SUMAA...2018a"></a>Silberzahn, R., Uhlmann, E. L., Martin, D. P., Anselmi, P., Aust, F., Awtrey, E., Bahník, Š., Bai, F., Bannard, C., Bonnier, E., Carlsson, R., Cheung, F., Christensen, G., Clay, R., Craig, M. A., Dalla Rosa, A., Dam, L., Evans, M. H., Flores Cervantes, I., Fong, N., Gamez-Djokic, M., Glenz, A., Gordon-McKeon, S., Heaton, T. J., Hederos, K., Heene, M., Hofelich Mohr, A. J., Högden, F., Hui, K., Johannesson, M., Kalodimos, J., Kaszubowski, E., Kennedy, D. M., Lei, R., Lindsay, T. A., Liverani, S., Madan, C. R., Molden, D., Molleman, E., Morey, R. D., Mulder, L. B., Nijstad, B. R., Pope, N. G., Pope, B., Prenoveau, J. M., Rink, F., Robusto, E., Roderique, H., Sandberg, A., Schlüter, E., Schönbrodt, F. D., Sherman, M. F., Sommer, S. A., Sotak, K., Spain, S., Spörlein, C., Stafford, T., Stefanutti, L., Tauber, S., Ullrich, J., Vianello, M., Wagenmakers, E.-J., Witkowiak, M., Yoon, S. and Nosek, B. A. (2018). Many Analysts, One Data Set: Making Transparent How Variations in Analytic Choices Affect Results. *Advances in Methods and Practices in Psychological Science* 1(3), 337–356. [doi:10.1177/2515245917747646](https://doi.org/10.1177/2515245917747646)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Nonstandard Errors](nonstandard-errors.md) · [Choosing the Analysts](choosing-analysts.md)
