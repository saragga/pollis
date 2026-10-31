# Coding Agents — Overview

## What a Coding Agent Is
A coding agent is a program that runs in a terminal and works on a folder through a language model: it reads files, runs commands, reads what they print and decides the next step. The loop of reasoning and acting comes from [Yao, Zhao, Yu, Du, Shafran, Narasimhan and Cao (2023)](#ref-YZYDS...2023a), and a model's ability to choose tools for itself from [Schick, Dwivedi-Yu, Dessì, Raileanu, Lomeli, Zettlemoyer, Cancedda and Scialom (2023)](#ref-SDDRL...2023a). Claude Code, Codex and OpenCode are agents of this kind, each started by a command line with a first message. A chat model answers with text; an agent changes files, so its work should be read before it is kept, as with any contribution to a project.

## How Pollis Starts a Coding Agent for a Task
A Pollis task, such as Write a Method or Create a Panel, runs on the agent and model of its tier in Model Tasks and Routing. Pollis opens a terminal named after the task and the tier, in the task's folder, or else the first workspace folder, or else the home folder. The first message goes in place of `{prompt}` on the agent's command line, and a local model is served by llama.cpp for the length of the run. When the agent's command is not found, the error offers Open Install Page and Open Model Tasks and Routing. When the tier sits in no cell of the table, Pollis asks for it to be placed first.

## How Well Coding Agents Work on Real Software Tasks
How much an agent can do alone is measured on real tasks rather than on questions. SWE-bench gives agents issues from real GitHub projects and checks the fix with the project's tests ([Jimenez, Yang, Wettig, Yao, Pei, Press and Narasimhan (2023)](#ref-JYWYP...2023a)), and SWE-agent showed that the design of the commands an agent is given strongly affects how well it does ([Yang, Jimenez, Wettig, Lieret, Yao, Narasimhan and Press (2024)](#ref-YJWLY...2024a)). The practical lesson for a Pollis task: an agent does better with a narrow request, tests it can run, and instructions written for the job, which is what the Pollis skills give it.

## Whether Context Files Such as AGENTS.md Help a Coding Agent
Context files give an agent standing instructions about a repository, and the evidence on them is mixed. [Gloaguen, Mündler-Sasahara, Müller, Raychev and Vechev (2026)](#ref-GMMRV2026a) find that they do not generally improve task success and raise inference cost by over 20% on average. Agents follow the instructions well; overviews of the repository do not help, and notes on non-standard practices do. [Lulla, Mohsenimofidi, Galster, Zhang, Baltes and Treude (2026)](#ref-LMGZB...2026a), on 10 repositories and 124 pull requests, associate an `AGENTS.md` with a lower median runtime (28.64%) and fewer output tokens (16.58%), at comparable task completion. A file kept short, and to what the agent could not find out alone, costs least.

## Whether Coding Agents and AI Assistants Make Developers Faster
Measured speed depends on the task and the developer. In the experiment of [Peng, Kalliamvakou, Cihon and Demirer (2023)](#ref-PKCD2023a), developers asked to write an HTTP server in JavaScript finished 55.8% faster with GitHub Copilot. In the randomised trial of [Becker, Rush, Barnes and Rein (2025)](#ref-BRBR2025a), 16 experienced open-source developers working on 246 tasks in repositories they knew took 19% longer when AI was allowed, though they estimated a 20% reduction. Both describe tools of their date, and the second shows that how fast the work feels is a poor guide to how fast it is.

## The Security Risks of Code and Instructions Handled by a Coding Agent
[Perry, Srivastava, Kumar and Boneh (2023)](#ref-PSKB2023a) found that participants with an AI assistant wrote significantly less secure code and were more likely to believe it secure. A second risk comes from what an agent reads: [Greshake, Abdelnabi, Mishra, Endres, Holz and Fritz (2023)](#ref-GAMEH...2023a) describe indirect prompt injection, in which instructions are placed in data likely to be retrieved at inference time, blurring the line between data and instructions. Files, web pages and issues read during a run can all carry such text, so an agent's request to run a command deserves the same reading as its changes.

## References

<a id="ref-BRBR2025a"></a>Becker, J., Rush, N., Barnes, E. and Rein, D. (2025). Measuring the impact of early-2025 AI on experienced open-source developer productivity. *arXiv preprint*. [arXiv:2507.09089](https://arxiv.org/abs/2507.09089)

<a id="ref-GMMRV2026a"></a>Gloaguen, T., Mündler-Sasahara, N., Müller, M. N., Raychev, V. and Vechev, M. (2026). Evaluating AGENTS.md: are repository-level context files helpful for coding agents? *arXiv preprint*. [arXiv:2602.11988](https://arxiv.org/abs/2602.11988)

<a id="ref-GAMEH...2023a"></a>Greshake, K., Abdelnabi, S., Mishra, S., Endres, C., Holz, T. and Fritz, M. (2023). Not what you've signed up for: compromising real-world LLM-integrated applications with indirect prompt injection. *Proceedings of the 16th ACM Workshop on Artificial Intelligence and Security*, 79–90. [doi:10.1145/3605764.3623985](https://doi.org/10.1145/3605764.3623985)

<a id="ref-JYWYP...2023a"></a>Jimenez, C. E., Yang, J., Wettig, A., Yao, S., Pei, K., Press, O. and Narasimhan, K. (2023). SWE-bench: can language models resolve real-world GitHub issues? *arXiv preprint*. [arXiv:2310.06770](https://arxiv.org/abs/2310.06770)

<a id="ref-LMGZB...2026a"></a>Lulla, J. L., Mohsenimofidi, S., Galster, M., Zhang, J. M., Baltes, S. and Treude, C. (2026). On the impact of AGENTS.md files on the efficiency of AI coding agents. *arXiv preprint*. [arXiv:2601.20404](https://arxiv.org/abs/2601.20404)

<a id="ref-PKCD2023a"></a>Peng, S., Kalliamvakou, E., Cihon, P. and Demirer, M. (2023). The impact of AI on developer productivity: evidence from GitHub Copilot. *arXiv preprint*. [arXiv:2302.06590](https://arxiv.org/abs/2302.06590)

<a id="ref-PSKB2023a"></a>Perry, N., Srivastava, M., Kumar, D. and Boneh, D. (2023). Do users write more insecure code with AI assistants? *Proceedings of the 2023 ACM SIGSAC Conference on Computer and Communications Security*, 2785–2799. [doi:10.1145/3576915.3623157](https://doi.org/10.1145/3576915.3623157)

<a id="ref-SDDRL...2023a"></a>Schick, T., Dwivedi-Yu, J., Dessì, R., Raileanu, R., Lomeli, M., Zettlemoyer, L., Cancedda, N. and Scialom, T. (2023). Toolformer: language models can teach themselves to use tools. *Advances in Neural Information Processing Systems*. [arXiv:2302.04761](https://arxiv.org/abs/2302.04761)

<a id="ref-YJWLY...2024a"></a>Yang, J., Jimenez, C. E., Wettig, A., Lieret, K., Yao, S., Narasimhan, K. and Press, O. (2024). SWE-agent: agent-computer interfaces enable automated software engineering. *arXiv preprint*. [arXiv:2405.15793](https://arxiv.org/abs/2405.15793)

<a id="ref-YZYDS...2023a"></a>Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K. and Cao, Y. (2023). ReAct: synergizing reasoning and acting in language models. *International Conference on Learning Representations*. [arXiv:2210.03629](https://arxiv.org/abs/2210.03629)

## See Also
- [Factsheet](factsheet.md) · [Other Agents](other-agents.md) · [Pollis Skills](pollis-skills.md)
