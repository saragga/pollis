# Compare Package Versions: Reading a Comparison of Versions

How to read the table of Compare Package Versions, and when a difference between two versions of a package is a change in its speed rather than noise in the timings.

## What Does Each Cell of the Table of Compare Package Versions Show?

Each cell of the table that `create_table` of AirspeedVelocity makes gives, for one benchmark and one version, the median of the timed samples, followed by the interquartile range, the distance between the 25th and the 75th percentiles of the samples. The median is the time of a typical sample; the interquartile range is the spread of the middle half of the samples, and grows when other work on the computer, garbage collection or a processor changing its speed disturbs the timings. The unit of each row is chosen from the size of its median. The last row, `time_to_load`, is the time to load the package in a new Julia.

## How Is the Ratio Column of Compare Package Versions Read?

When two versions are compared, `create_table` adds a column whose header names both versions, the first divided by the second, and whose cells give the median of the first version divided by the median of the second. A ratio above 1 means the second version is faster on that benchmark, and a ratio below 1 that it is slower. Beside the ratio comes an error, computed from the interquartile ranges of the two versions, which says how much the ratio could move with the spread of the timings. With three versions or more there is no ratio column, and the table lists the versions side by side.

## When Is a Difference Between Two Versions of a Package Real?

A difference in the medians is a change in speed only when it is larger than the spread of the timings. **Is the Change Clear?** compares the interquartile ranges of the first and the last version: when they overlap, the middle halves of the samples of both versions share some times, and the difference is within the variation of the timings; when they do not overlap, the change is clearer. Running the same comparison again shows whether a difference repeats.

## Why Can the Same Versions Give Different Times on Another Run?

The time of the same code changes from one run to the next with the state of the computer: other programs, the temperature of the processor and the speed it runs at, the placement of data in memory. Each version is timed in a new Julia process, at a different moment, so a change in the computer between versions can appear as a difference between them. Comparing the versions when the computer does little else leaves fewer of these disturbances in the timings. A difference that comes back in the same direction on repeated runs is more likely to belong to the package than to the computer.

## Why Can a Version Be Faster on One Benchmark and Slower on Another?

A version of a package can change several functions, the methods chosen for different types of arguments, or the dependencies it loads, so the code of one benchmark can become faster while another becomes slower. The size of the data matters too: a change that adds a fixed cost to each call slows small inputs and leaves large ones almost unchanged, and an algorithm that scales better can be slower on small inputs. Timing the code of the actual use, with data of its actual size, in **Code to Time** and **Data**, gives the comparison that matters for that use. **Allocations and Memory** shows whether the change also changed what the code allocates.

## What Can a Comparison of Package Versions Not Say?

A comparison times the versions with one version of Julia, on one computer, on the code and data of the script. A newer version of Julia can change the speed of all versions of a package, and a version of the package can be faster on one processor and not on another. Versions also differ in the versions of their dependencies that Julia installs with them, so a difference between two versions of the package can come from a dependency. The time of a benchmark also says nothing of whether the versions compute the same result; Speed Up a Function, in Compose > Profiling, checks that before it compares times.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md)
