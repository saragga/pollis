# New Article Method — Interpretation

## What Passing Tests Mean for a Pollis Method

Passing tests mean that a Pollis method gives every printed value of its target tables, on the article's data, to the digits printed and within each table's tolerance. That is strong evidence that the code computes what the article computed, as many values agreeing to several digits rarely happens by chance. It is evidence about those data and those settings: it does not show that the code is right on other data, or that the published method is a good one.

## How a Printed Value Is Compared with a Computed One

Each test of a Pollis method rounds the computed value to the number of digits the article prints, then compares it with the printed value. A value printed as 0.420 is compared at three decimals, and one printed as 1.2e-3 by its exponent as well. An empty cell of a target table is skipped. The comparison uses the table's own digits, so an article that prints more digits gets a stricter test.

## What the Tolerance of a Target Table Means

The tolerance of a Pollis method's target table is the number of units of the last printed digit a value may be off by. A tolerance of 0 asks for agreement to every printed digit, and 1 allows the last digit to differ by one, as when the article rounded at an intermediate step. A larger tolerance says less about the code and should have a reason, which the vignette gives. Raising a tolerance until tests pass hides the difference the tests exist to show.

## How Many Published Values a Pollis Method Should Reproduce

A Pollis method is more convincing the more of the article it covers: several tables, more than one specification, and both the estimates and their standard errors, since a formula can get the first right and the second wrong. Reporting the count of values reproduced, and those that are not, tells a reader what the tests establish. A value not reproduced is reported rather than dropped from the target.

## How Often Published Results Can Be Reproduced

Studies that try to reproduce published work often fail, so a value a Pollis method cannot reach is not by itself a fault in its code. [Dewald, Thursby and Anderson (1986)](#ref-DTA1986a) collected programs and data from authors for two years and tried to replicate their results, urging journals to require both. [McCullough, McGeary and Harrison (2006)](#ref-MMH2006a) found that, of more than 150 empirical articles under a journal's data and code archive, fewer than 15 could be replicated. [Chang and Li (2022)](#ref-CL2022a) replicated the key qualitative result of 22 of 67 economics papers (33%) without contacting the authors, and 29 of 59 (49%) with their help, leaving out those needing confidential data or software they did not have. [Stodden, Seiler and Ma (2018)](#ref-SSM2018a) obtained data and code for 44% of a journal's articles and reproduced the findings of 26%. [Vilhuber (2020)](#ref-Vil2020a) gives the history in economics, with the part played by restricted-access data.

## What a Vignette Adds to the Tests

The vignette of a Pollis method is where the tests are explained: the problem the method solves, its equations, the values reproduced and those that are not, with what is known about why. The tests say whether values agree, while the vignette says what they cover and what is still open. A reader deciding whether to rely on the package reads the vignette, and the tests let that reader check it.

## References

<a id="ref-CL2022a"></a>Chang, A. C. and Li, P. (2022). Is economics research replicable? Sixty published papers from thirteen journals say “often not”. *Critical Finance Review* 11(1), 185–206. [doi:10.1561/104.00000053](https://doi.org/10.1561/104.00000053)

<a id="ref-DTA1986a"></a>Dewald, W. G., Thursby, J. G. and Anderson, R. G. (1986). Replication in empirical economics: the Journal of Money, Credit and Banking project. *American Economic Review* 76(4), 587–603. [ideas.repec.org](https://ideas.repec.org/a/aea/aecrev/v76y1986i4p587-603.html)

<a id="ref-MMH2006a"></a>McCullough, B. D., McGeary, K. A. and Harrison, T. D. (2006). Lessons from the JMCB archive. *Journal of Money, Credit, and Banking* 38(4), 1093–1107. [doi:10.1353/mcb.2006.0061](https://doi.org/10.1353/mcb.2006.0061)

<a id="ref-SSM2018a"></a>Stodden, V., Seiler, J. and Ma, Z. (2018). An empirical analysis of journal policy effectiveness for computational reproducibility. *Proceedings of the National Academy of Sciences* 115(11), 2584–2589. [doi:10.1073/pnas.1708290115](https://doi.org/10.1073/pnas.1708290115)

<a id="ref-Vil2020a"></a>Vilhuber, L. (2020). Reproducibility and replicability in economics. *Harvard Data Science Review* 2(4). [doi:10.1162/99608f92.4f6b9e67](https://doi.org/10.1162/99608f92.4f6b9e67)

## See Also
- [Diagnostics](diagnostics.md) · [Assumptions](assumptions.md) · [Decision Guide](decision-guide.md)
