# Group-Aware

When several observations belong to the same unit (a patient measured repeatedly, the samples of one batch, the years of one firm), they share information. A random split puts some of a unit's observations in training and others in test, and the model scores well partly because it has already seen the unit. If the model will be used on **new units**, the score is optimistic. The group-aware strategies of DataSplits.jl keep each group whole.

## GroupKFold
**GroupKFold** assigns every group to exactly one fold: each group is held out once, and no group appears in both the training and test sets of a fold. The folds are balanced by number of observations as far as the group sizes allow.

## GroupShuffleSplit
**GroupShuffleSplit** makes one random train/test split of whole groups. It adds groups to the training set in random order until the requested size is reached, so the training set may be somewhat larger than requested.

## Which Question
Holding out groups estimates performance on **unseen groups**. If the model will predict new observations of groups it already knows (the next visit of an enrolled patient), splitting within groups is the right design, and holding out groups would be pessimistic. The choice depends on the deployment, not on the mere presence of groups.

## Number of Groups
The effective sample size for evaluation is the number of groups, not of observations. With few groups the folds are few and uneven, and the score is noisy; leave-one-group-out, which holds out each group in turn, makes the most of them.

## Choosing the Groups
Group by the unit whose new members the model will meet. When observations are linked at several levels (patients in hospitals), group at the level of deployment: if the model will be used in new hospitals, group by hospital.

## See Also
- [Overview](overview.md) · [Cross-Validation](cross-validation.md) · [Time-Series](time-series.md)
