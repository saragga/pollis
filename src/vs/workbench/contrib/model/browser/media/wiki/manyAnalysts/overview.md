# Many Analysts: Overview

Many Analysts gives the same research question and the same data to several coding agents, and each answers it on its own, in a folder of its own, as an independent researcher would. Pollis then runs each analysis again, checks that it gives the number the agent reported, and shows how far the estimates spread and which choices lie behind them. The page is in Compose > Orchestration.

## What Is a Many-Analysts Study?

A many-analysts study gives one question and one dataset to many research teams and compares their answers. In [Silberzahn and 64 coauthors (2018)](#ref-SUMAA...2018a), 29 teams with 61 analysts asked whether soccer referees give more red cards to players with darker skin; 20 teams found a significant positive effect and 9 did not, and the 29 analyses used 21 different combinations of covariates. [Huntington-Klein and 11 coauthors (2021)](#ref-HABBB...2021a) gave two published causal results in economics to seven replicators each, and no two replicators reported the same sample size. Such a study makes visible how much a result depends on choices that a single paper never reports. Many Analysts runs a small study of this kind with coding agents as the analysts.

## What Are the Four Steps of Many Analysts?

**Question and Data** names the study, which is the name of its folder, and sets the data, the question and the estimate every analyst must report: LaLonde's job training data by default, or a file of your own with a description of its columns. **Analysts** sets how many analysts the study has, from 3 to 12, and the agent and model of each. **Runs** starts every analyst at once with **Start the Analysts** and follows each one's status and time. **Results** runs every analysis again with **Check and Collect**, then shows the spread of the estimates, a plot of the estimates in order, and a table of each analyst's choices. **Open a Study** reopens an earlier study, which shows its runs and results again.

## What Does Each Analyst of Many Analysts Do?

Each analyst is a coding agent started in its own terminal and its own folder, `analyst-1` to `analyst-N` of the study, with two files: `SKILL.md`, the analyse-independently skill of Pollis Agents, and `TASK.md`, the question, the estimate to report, the data and the Julia command to run. The agent works to the end with no questions to anyone. It writes the whole analysis in Julia as `analysis.jl`, which writes the estimate, its standard error, its 95% confidence interval and the number of observations to `estimate.toml`. It then records its choices of sample, outcome, controls, estimator and standard errors in `choices.toml`, and its reasons in `REPORT.md`. No analyst sees another's folder.

## How Does Many Analysts Check an Analyst's Estimate?

**Check and Collect** sends Julia code to the Julia REPL that runs each analyst's `analysis.jl` again, in a new Julia process and an empty folder that holds only the study's data. It reads the `estimate.toml` that this rerun writes, and compares it with the one the analyst left: the column **Reproduced** says Yes when the same number of observations and the same four numbers come back, to a millionth. An estimate that does not come back the same is drawn in red in the plot, and the rerun's output is kept in `rerun.log` in the analyst's folder. The code then writes `results.json` in the study's folder, from which the page draws the results.

## What Does the Example of Many Analysts Ask?

The example asks for the effect of the National Supported Work job training programme on the earnings of the men who took part. [LaLonde (1986)](#ref-LaL1986a) compared the experimental estimate of the programme's effect with nonexperimental estimates, which set groups of men from two surveys in place of the experiment's controls, and found that the nonexperimental methods gave a large range of effects. [Dehejia and Wahba (1999)](#ref-DW1999a) found propensity score estimates on the same comparison groups much closer to the experimental benchmark. The question leaves the analysts to choose the comparison group, the sample and the method, which is where analysts differ.

## References

<a id="ref-DW1999a"></a>Dehejia, R. H. and Wahba, S. (1999). Causal Effects in Nonexperimental Studies: Reevaluating the Evaluation of Training Programs. *Journal of the American Statistical Association* 94(448), 1053–1062. [doi:10.1080/01621459.1999.10473858](https://doi.org/10.1080/01621459.1999.10473858)

<a id="ref-HABBB...2021a"></a>Huntington-Klein, N., Arenas, A., Beam, E., Bertoni, M., Bloem, J. R., Burli, P., Chen, N., Grieco, P., Ekpe, G., Pugatch, T., Saavedra, M. and Stopnitzky, Y. (2021). The Influence of Hidden Researcher Decisions in Applied Microeconomics. *Economic Inquiry* 59(3), 944–960. [doi:10.1111/ecin.12992](https://doi.org/10.1111/ecin.12992)

<a id="ref-LaL1986a"></a>LaLonde, R. J. (1986). Evaluating the Econometric Evaluations of Training Programs with Experimental Data. *American Economic Review* 76(4), 604–620. [www.jstor.org/stable/1806062](https://www.jstor.org/stable/1806062)

<a id="ref-SUMAA...2018a"></a>Silberzahn, R., Uhlmann, E. L., Martin, D. P., Anselmi, P., Aust, F., Awtrey, E., Bahník, Š., Bai, F., Bannard, C., Bonnier, E., Carlsson, R., Cheung, F., Christensen, G., Clay, R., Craig, M. A., Dalla Rosa, A., Dam, L., Evans, M. H., Flores Cervantes, I., Fong, N., Gamez-Djokic, M., Glenz, A., Gordon-McKeon, S., Heaton, T. J., Hederos, K., Heene, M., Hofelich Mohr, A. J., Högden, F., Hui, K., Johannesson, M., Kalodimos, J., Kaszubowski, E., Kennedy, D. M., Lei, R., Lindsay, T. A., Liverani, S., Madan, C. R., Molden, D., Molleman, E., Morey, R. D., Mulder, L. B., Nijstad, B. R., Pope, N. G., Pope, B., Prenoveau, J. M., Rink, F., Robusto, E., Roderique, H., Sandberg, A., Schlüter, E., Schönbrodt, F. D., Sherman, M. F., Sommer, S. A., Sotak, K., Spain, S., Spörlein, C., Stafford, T., Stefanutti, L., Tauber, S., Ullrich, J., Vianello, M., Wagenmakers, E.-J., Witkowiak, M., Yoon, S. and Nosek, B. A. (2018). Many Analysts, One Data Set: Making Transparent How Variations in Analytic Choices Affect Results. *Advances in Methods and Practices in Psychological Science* 1(3), 337–356. [doi:10.1177/2515245917747646](https://doi.org/10.1177/2515245917747646)

## See Also

- [Factsheet](factsheet.md) · [Nonstandard Errors](nonstandard-errors.md) · [Choosing the Analysts](choosing-analysts.md) · [Writing the Question](writing-question.md)
