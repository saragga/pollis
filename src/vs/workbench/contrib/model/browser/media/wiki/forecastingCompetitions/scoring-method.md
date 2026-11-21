# Scoring a Method

How to write the method of the page Score Models for each kind of dataset, what it is scored beside, and what its Next Steps show.

## How Do I Write the Forecast Function?

The step Your Method holds Julia code that defines a function `forecast(y, h, period)`. Its arguments are `y`, the values of one series that the forecasters saw, in order, as a vector of `Float64`; `h`, the number of steps to forecast; and `period`, the seasonal period of the series, 1 for none. The function must return `h` finite numbers, the forecasts of steps 1 to `h`. The code may load any Julia package installed in the session with `using`, and define other functions beside `forecast`. The function is called on each series on its own, so a method cannot learn from other series of the dataset; the page's example is the benchmark Theta [(Assimakopoulos and Nikolopoulos, 2000)](#ref-AN2000a), written out from the functions of `PollisCompetitions.Benchmarks`.

## How Do I Write the Predict Function of a Tabular Dataset?

For tabular datasets, the step Your Method holds Julia code that defines a function `predict(train, test, target, response_type, classes)`. `train` holds the training rows of a split, with every column, the target among them, and `test` its test rows, without the target; both are tables of columns, a NamedTuple of vectors, with text as strings and missing values as `missing`. `target` is the name of the target's column, `response_type` the dataset's Response Type, and `classes` the target's classes, sorted, empty for Continuous and Count. The function returns, for Continuous and Count, a vector with a number for each test row; for Binary, a vector with the probability of `classes[2]` for each test row; and for Multiclass, a matrix with a row for each test row and a column for each class, each row summing to 1. The page's example predicts the mean of the training targets, or the share of each class in the training rows.

## How Do I Write the Predict Function of a Survival Dataset?

For survival datasets, the function is `predict(train, test, time, event, times)`. `train` holds the training rows of a split, with every column, among them the time and the event indicator (1 for an event, 0 for a censored time), whose column names are `time` and `event`; `test` holds the test rows, without them. `times` are the distinct times of the training rows, increasing. The function returns a matrix with a row for each test row and a column for each of `times`: the row's probability of surviving past that time, between 0 and 1 and never increasing along the row. The page's example is the Kaplan-Meier estimate [(Kaplan and Meier, 1958)](#ref-KM1958a) of the training rows, the same curve for every test row.

A predict function is called on each split in turn, fitted afresh each time, and may load any Julia package installed in the session with `using`. It should draw no random numbers unless it seeds them itself, so that a run can be repeated and gives the same scores.

## What Happens When the Forecast Function Fails?

When `forecast` throws an error on a series, or returns the wrong number of values, or a value that is not finite, the series is counted as failed in the progress of the step Run, and the run goes on with the other series. Once every series has been tried, a run with failed series stops before scoring, since the measures need a forecast of every series chosen, and the step Scores shows the number of failed series, the name of the first one, and its error. The function can then be fixed in `method.jl`, or in the step Your Method of a new run.

## What Happens When the Predict Function Fails?

When `predict` throws an error on a split, or returns a value of the wrong shape, a probability outside [0, 1], a value that is not finite, a row of class probabilities that does not sum to 1, or a survival curve that increases, the run stops at that split, and the step Scores shows the split, its repeat and fold, and the error. The splits are scored together, so a run with a failed split has no scores.

## Which Splits Should I Run?

A tabular or survival dataset has a split for each fold of each repeat of its cross-validation, and its published scores are means over all of them. **All the Published Splits** fits the method on each, so its means are compared with the published ones as equals. **The First Repeat** fits it on the folds of the first repeat only, a tenth of the fits on a dataset of 10 repeats, and the step Scores says that its comparison is then indicative. The step Datasets gives the number of fits a run makes.

## Which Benchmarks Is a Method Scored Beside?

The method is scored beside the eight benchmarks of `PollisCompetitions.Benchmarks`, computed by PollisCompetitions.jl on the same series, from the values the forecasters saw, and scored as the method is. Naive repeats the last value, and Seasonal Naive (sNaive) the last period of values. A series that passes the package's seasonality test is adjusted by its classical multiplicative seasonal index; Naive2, Simple Exponential Smoothing (SES), Holt, Damped and Theta forecast the adjusted values, and their forecasts are multiplied back by the last period of the index. Com is the mean of SES, Holt and Damped. A benchmark that cannot be fitted to a series of the run, such as one too short for it, is left out of the table. Naive2 is also the benchmark against which the OWA weighs every method.

On a tabular or survival dataset, the method is scored beside the published runs of the dataset's benchmark, the means of each model over all its splits, read from the Benchmarks of PollisCompetitions.jl. Its rank on a measure is 1, plus one for each published run that does better on it (see [Tabular and Survival Measures](tabular-survival-measures.md)).

## Why Run a Sample of Series?

A run of a dataset with many series calls the forecast function once for each, which for a slow method can take hours. **A Sample of** with a number of series runs the method on that many series, drawn at random among those of the frequency chosen, or among all of them; the same **Seed** draws the same series again, so two methods can be compared on the same sample. The benchmarks are computed on the same sample.

## How Fast Does a Run Go?

The series are forecast over the threads of the Julia session, so a session started with more threads, such as `julia --threads=auto`, forecasts more series at a time. The forecast function must then be safe to call on several series at once: it must not change a global variable or a value it shares with other calls. The step Run shows how many series are done and the seconds since the run started, from `progress.json`, which the run updates after each hundredth of its series.

## Which Next Steps Are Offered for Each Kind?

Errors by Horizon, Browse the Series and Where It Fails are about series, so they are offered for runs on forecasting datasets. Compare Two Runs is offered for runs of every kind.

## What Does Errors by Horizon Show?

**Errors by Horizon**, in the Next Steps of Score Models, gives the sMAPE and the MASE of a run's method at each step ahead, from 1 to the horizon, beside those of Naive2 on the same series. Each value is the mean over the series of one frequency, as the series of different frequencies have different horizons; a run of several frequencies has a choice of frequency. Errors usually grow with the step ahead, and a method that does well in total may do so on the first steps only. The step uses `step_errors` of PollisCompetitions.jl, whose means over the horizon of a series are the sMAPE and the MASE [(Hyndman and Koehler, 2006)](#ref-HK2006a) that the scores average.

## What Does Browse the Series Show?

**Browse the Series**, in the Next Steps of Score Models, plots one series of a run at a time: the values the forecasters saw, the values the series was scored on, and the method's forecast. A **Benchmark** computed on the series by PollisCompetitions.jl can be drawn beside them; a benchmark that cannot be fitted to the series is not offered. **Show** finds a series by the name its source gives it, and **Previous** and **Next** go through the series of the run in order. The plot shows the last three horizons of past values, or **All the Past Values**, and a table below it gives each forecast step by step.

## What Does Where It Fails Show?

**Where It Fails**, in the Next Steps of Score Models, compares a run's method with Naive2 series by series. Its first table counts, for each frequency and in total, the series the method forecasts better than Naive2 and those it forecasts worse, by sMAPE and by MASE. Its second table holds the series where the method does worst: the 100 worst by each of four measures, the method's sMAPE and MASE and each relative to that of Naive2 on the same series. A relative measure above 1 means the method erred more than Naive2 on that series, and a click on a heading sorts the table by that column. The name of a series opens it in Browse the Series, to see where its forecast went wrong.

## What Does Compare Two Runs Show?

**Compare Two Runs**, in the Next Steps of Score Models, sets the run shown in steps 3 and 4 beside another of the user's runs, chosen in **The Other Run**. Two runs are compared only when they are on the same series: the same dataset, frequency and number of series, and for a sample the same seed, so that two methods, or two versions of one, can be tried on the same sample and set side by side. Two runs of a tabular or survival dataset are compared when they are on the same dataset and the same splits. The table gives the scores of both and the seconds each took. **Compare method.jl** opens the two methods in a diff editor, the other run's on the left. The step reads the files the two runs wrote, and runs no Julia.

## References

<a id="ref-AN2000a"></a>Assimakopoulos, V. and Nikolopoulos, K. (2000). The Theta Model: A Decomposition Approach to Forecasting. *International Journal of Forecasting* 16(4), 521–530. [doi:10.1016/s0169-2070(00)00066-2](https://doi.org/10.1016/s0169-2070(00)00066-2)

<a id="ref-HK2006a"></a>Hyndman, R. J. and Koehler, A. B. (2006). Another Look at Measures of Forecast Accuracy. *International Journal of Forecasting* 22(4), 679–688. [doi:10.1016/j.ijforecast.2006.03.001](https://doi.org/10.1016/j.ijforecast.2006.03.001)

<a id="ref-KM1958a"></a>Kaplan, E. L. and Meier, P. (1958). Nonparametric Estimation from Incomplete Observations. *Journal of the American Statistical Association* 53(282), 457–481. [doi:10.1080/01621459.1958.10501452](https://doi.org/10.1080/01621459.1958.10501452)

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [The Error Measures](error-measures.md) · [Tabular and Survival Measures](tabular-survival-measures.md) · [Licences and Downloads](licences-downloads.md)
