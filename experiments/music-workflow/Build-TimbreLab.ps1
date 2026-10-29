param([switch]$Run, [switch]$Test)
# The two editors now ship in one Tone Processor. Keep the historical build entry compatible.
$ErrorActionPreference = 'Stop'
& (Join-Path $PSScriptRoot 'Build-ToneProcessor.ps1') -Run:$Run -Test:$Test