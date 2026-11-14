# Many Analysts: Choosing the Analysts

Which coding agents and models can be the analysts of Many Analysts, why different models make a fairer study than one model several times, how many analysts a study needs, and what a study costs.

## Which Agents Can Be Analysts in Many Analysts?

An analyst must work to the end with no one to answer its questions, so Many Analysts offers only the agents that Pollis knows how to run unattended: Claude Code, Codex and OpenCode, when they are installed on this computer. Claude Code runs in print mode, accepts its own edits in its folder and runs no command but `julia`; Codex runs as `codex exec`, which writes only in its folder; OpenCode runs as `opencode run`. An agent of your own, added on the Coding Agents page, is not offered, since Pollis has no command line that runs it unattended. Each analyst starts in its own folder of the study, and its terminal stays open when it ends, so its output can be read.

## Why Use Different Models as Analysts in Many Analysts?

The analysts of a many-analysts study are meant to stand for the different researchers who might take up the question. One model given the same task several times tends to make the same choices each time, so its analysts spread less than different researchers would, and the study then shows the model's habits more than the range of defensible analyses. Different models, and different agents on the same model, give a fairer spread. **Analysts** offers every agent and model of Model Tasks and Routing that can run unattended, sets them in turn at first, and warns when one agent and model is chosen more than once.

## How Many Analysts Does a Many Analysts Study Need?

Many Analysts takes from 3 to 12 analysts, 5 by default. Three is the least that gives a median and a spread; with more analysts the **Median Estimate**, the **Interquartile Range** and the **Nonstandard Error** describe the spread more closely, and the choices table shows more combinations of choices. The published many-analysts studies had from 7 analysts for each study replicated to 164 teams. Every analyst is a full run of a coding agent, so the number of analysts is a matter of time and cost as much as of precision.

## Local Models as Analysts in Many Analysts

A local chat model of Model Tasks and Routing that can call tools can be an analyst, with Claude Code, Codex or OpenCode as its agent. Pollis starts llama.cpp's llama-server for the model, or uses the one already running, and points the agent at it, with a context of 32,768 tokens. Several analysts on the same local model share one server, so they run more slowly than on a cloud model, and a small model may fail to finish an analysis, which shows as **Ended without results**. A local model costs nothing to run and keeps the data on the computer.

## What Does a Many Analysts Study Cost?

Each analyst is a run of a coding agent, billed by its agent's provider as any run of the agent is, and an analysis that loads data, installs packages, estimates a model and writes a report takes several minutes and many requests. A study's cost is about that of one such run for each analyst. **Check and Collect** costs nothing beyond the Julia time: it runs each `analysis.jl` again on this computer, one after another, with no agent.

## See Also

- [Overview](overview.md) · [Factsheet](factsheet.md) · [Nonstandard Errors](nonstandard-errors.md) · [Writing the Question](writing-question.md)
