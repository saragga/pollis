# Browse References — Overview

## The Sources of a Work in PollisReferences
The **Source** of each work in Browse References says where it came from, and the Show filter lists one kind at a time.

| Source | Meaning |
|---|---|
| User | A work you saved from Discover Literature or added to a panel's References |
| Corrected | A built-in work, as you corrected it |
| Built-in | A work that comes with Pollis |

## Where Your References Are Kept
Your references, the works you save from Discover Literature or add to a panel's References, your corrections of the works of Pollis, their records and citation counts, are kept in the `knowledge_base/references` folder of the Pollis Workspace open, as lines of JSON: `references.jsonl`, `counts.jsonl`, `versions.jsonl` and `panels.jsonl`, the last line of a work winning. They go with the workspace, and each workspace has its own. The `user_references` and `all_references` tables of the PollisReferences database read the workspace last opened: a window that opens one makes the database read its folder. A window without a Pollis Workspace shows the references of the last one and saves none: it asks you to open a workspace. References kept in `~/.pollis/references` before are moved into the workspace, with their records and counts, when you agree.

## What Remove and Undo Correction Do in Browse References
**Remove** deletes a work of yours from your references, with its records and citation counts, and takes it off the panels you added it to. **Undo Correction** goes back to the work as Pollis has it, wherever it is cited. Your saved works and corrections live in `~/.pollis/references`, apart from the built-in library, so an update of Pollis leaves them as they are.

## Showing a Work in a Panel's Explore References
**Show in Panel...** adds a work to the References of a panel, where it then appears in Explore References. The chooser marks the panels that already cite the work with **cites it**. Adding a work to a panel's list does not change the wiki of the panel, which cites only the works written into it.

## Reading the Citations and Records Columns
The **Citations** column of Browse References sorts by the largest count among the work's sources, as different indexes count differently. OpenAlex ([Priem, Piwowar and Orr (2022)](#ref-PPO2022a)) is one of those sources. **Records** lists the entries of the same work saved from Discover Literature, such as a preprint, a working paper or a repository copy, each shown as its kind and its index. Counts of two records are never added together, since one citation may be found in both.

## References

<a id="ref-PPO2022a"></a>Priem, J., Piwowar, H. and Orr, R. (2022). OpenAlex: a fully-open index of scholarly works, authors, venues, institutions, and concepts. *arXiv preprint*. [arXiv:2205.01833](https://arxiv.org/abs/2205.01833)

## See Also
- [Factsheet](factsheet.md) · [BibTeX Entries and Keys](bibtex.md) · [Citation Searches](snowball-search.md) · [Duplicates and Merging](duplicates.md)
