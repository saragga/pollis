# Snowball Search Map — Factsheet

**Snowball Search Map** starts from a few works you know, the seeds, and follows their citations into one pool ranked by how many seeds each work is tied to.

| | |
|---|---|
| **Purpose** | Find the works around a set of known ones, and tell when the search is done |
| **Seeds from** | PollisReferences, with Add Seeds; or Discover Literature's Snowball Search... |
| **Lists** | Cited By, Cites, Related |
| **Pool columns** | Work, Year, Cited, Links, From |
| **Actions** | Run to Saturation, Exclude, Save..., Open..., New Search |
| **Files** | `~/.pollis/literature`, a TOML of the steps with the works in a DuckDB file beside it |

## When to Use Snowball Search Map
- Filling out a literature review from a few central works.
- Covering a topic whose vocabulary varies, where keyword searches miss works.
- Showing how a search was done, step by step, from the saved map.

## What Snowball Search Map Does Not Do
Snowball Search Map does not judge relevance beyond the links it counts, so reading the candidates remains your part. Works in the pool stay in the map's record, as joining PollisReferences takes Discover Literature or Import References, and citations missing from the indexes cannot be followed.

## See Also
- [Overview](overview.md) · [Rounds and Saturation](rounds-and-saturation.md) · [Links and Citations](links-and-citations.md)
