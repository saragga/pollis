# Package Vignettes — Installed or Registry

## Where the Vignettes of Package Vignettes Come From
Package Vignettes reads two sources. The registry's are listed in `Vignettes.toml` at the root of the registry named in the setting `pollis.newMethods.registry`, read from GitHub when the page opens. The packages on this computer carry their own: those installed in the Julia depot, in `~/.julia/packages/NAME/SLUG/vignette`, and those being developed, in `~/.julia/dev/NAME/vignette`. These are read without an Internet connection, and the Location column marks them Locally Installed.

## Which Version of a Vignette Package Vignettes Shows
A package on this computer shows its own vignette in place of the registry's, so the vignette read matches the code installed, even when the registry has a newer version. Of a package installed in several versions, Package Vignettes shows the newest that a Julia environment holds, as Julia's log of the manifests it has used (`~/.julia/logs/manifest_usage.toml`) tells; a copy left in the depot by an update or a removal is ignored. A package being developed in `~/.julia/dev` comes before any installed version.

## When a Vignette Is Compiled Again
Each compiled vignette is a PDF named after its package and version, so a new version of a package is compiled the first time it is opened. The vignette of a package in the registry is compiled from the `vignette` folder of its repository on GitHub. The vignette of a package being developed is compiled again whenever a file of its `vignette` folder is newer than the PDF, so its author reads it as it is written.

## Refreshing Package Vignettes
**Refresh**, at the end of the note above the table, reads the registry's `Vignettes.toml` again; GitHub may serve the previous list for a few minutes after a change. The packages on this computer are read again each time the page comes back into view, so a package installed meanwhile appears without Refresh.

## See Also
- [Factsheet](factsheet.md)
- [Overview](overview.md)
- [Writing a Vignette](writing-a-vignette.md)
