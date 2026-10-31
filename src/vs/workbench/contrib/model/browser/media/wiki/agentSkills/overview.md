# Agent Skills — Overview

## What an Agent Skill Is
A skill is the know-how a coding agent reads to do a task: a folder with a `SKILL.md` file of instructions and, for some skills, further files it refers to. The agent loads a skill when the request matches, so the same agent can write a vignette in one run and package a toolbox in another. Skills are plain text, and any of them can be read in full with **View Skill**.

## Where Agent Skills Come From When the Page Opens
Agent Skills downloads the latest version each time it opens. If the download fails, the page falls back on the last copy, with a warning; with no copy at all, it shows an error. The copy is kept in `~/.pollis/agents/pollis-agents/skills/<folder>/SKILL.md`.

## Running a Skill With a Coding Agent
**Run with My Agent** starts the agent of the Standard tier with the first message "Read the skill and follow its instructions with me", naming the skill. The agent then asks what it needs. A skill with tasks shows them as links in the **Tasks** column, which start the task with its own prompt and tier. Two tasks are named without a link because they need a context: Polish with Agent needs a `.tex` file open, and Tables from the Article needs a method's page. A skill with no task shows **None: run it with your agent**.

## What a SKILL.md File Contains and the Smells Found in Agent Skills
[Hong, Imani and Ahmed (2026)](#ref-HIA2026a) study `SKILL.md` as a software artifact, on 238 real-world skills. Their taxonomy of the file has 13 higher-level and 44 lower-level components. From a review of 29 sources they take best practices, and they call a violation of one a skill smell. Over 99% of the skills hold at least one smell, and a smell once introduced rarely disappears. A skill is a document worth reading with **View Skill** and worth revising, as code is.

## How Agent Skills Are Reused and Maintained
[Gao, Lulla, Lin, Baltes, Treude and Zahedi (2026)](#ref-GLLBT...2026a) examine 18,463 skills from skills.sh and 23,199 personal-use skills from 5,876 GitHub repositories. Reuse is largely a one-time copy: 53% of the skills adopted are never modified afterwards. Maintenance overwhelmingly adds material, and customisation adapts a skill to its local environment. A copy made once falls behind its source, which is why the Agent Skills page takes the latest version of the Pollis skills each time it opens.

## Whether a Matching Agent Skill Helps a Coding Agent
Having a skill that matches the task does not by itself help. [Yang and Ding (2026)](#ref-YD2026a) test 31 public skills for web development on 50 projects and 1,000 ordered tasks, with four models and a control of irrelevant text of the same length. Injecting the matching skill reduces mean Pass@2 by 1.3% to 4.2% and raises token cost by 72% to 394%, with gains in 17% to 36% of the skill-project pairs. Among the helpful skills, rules on what to avoid outperform content heavy with examples. Their conclusion is that a matched skill is a hypothesis about one skill, one project and one model together, to be tried and not assumed.

## Procedures and Libraries of Skills Before Agent Skills
The word skill has a longer history. In the account of [Anderson (1982)](#ref-And1982a), a cognitive skill passes from a declarative stage, in which facts are interpreted, to a procedural stage, in which the knowledge is embodied in procedures, with knowledge compilation as the transition. A `SKILL.md` of plain instructions resembles the first stage, being read and interpreted at each run. Voyager, by [Wang, Xie, Jiang, Mandlekar, Xiao, Zhu, Fan and Anandkumar (2023)](#ref-WXJMX...2023a), resembles the second: its agent keeps an ever-growing library of skills as executable code, stores and retrieves them for later behaviours, and reuses them in a new world.

## References

<a id="ref-And1982a"></a>Anderson, J. R. (1982). Acquisition of cognitive skill. *Psychological Review* 89(4), 369–406. [doi:10.1037/0033-295x.89.4.369](https://doi.org/10.1037/0033-295x.89.4.369)

<a id="ref-GLLBT...2026a"></a>Gao, H., Lulla, J. L., Lin, H. Y., Baltes, S., Treude, C. and Zahedi, M. (2026). From registry to repository: how AI agent skills are written, adapted, and maintained. *arXiv preprint*. [arXiv:2607.00911](https://arxiv.org/abs/2607.00911)

<a id="ref-HIA2026a"></a>Hong, D. B., Imani, A. and Ahmed, I. (2026). From anatomy to smells: an empirical study of SKILL.md in agent skills. *arXiv preprint*. [arXiv:2607.01456](https://arxiv.org/abs/2607.01456)

<a id="ref-WXJMX...2023a"></a>Wang, G., Xie, Y., Jiang, Y., Mandlekar, A., Xiao, C., Zhu, Y., Fan, L. and Anandkumar, A. (2023). Voyager: an open-ended embodied agent with large language models. *arXiv preprint*. [arXiv:2305.16291](https://arxiv.org/abs/2305.16291)

<a id="ref-YD2026a"></a>Yang, Z. and Ding, F. (2026). Signal or noise? A benchmark study of agent skills in web development. *arXiv preprint*. [arXiv:2608.23067](https://arxiv.org/abs/2608.23067)

## See Also
- [Factsheet](factsheet.md)
