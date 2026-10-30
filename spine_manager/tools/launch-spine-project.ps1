param(
  [string]$ProjectFile,
  [switch]$Wait,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$managerRoot = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $PSScriptRoot 'spine-tool.json'
$config = Get-Content -Raw $configPath | ConvertFrom-Json
$configuredLauncher = if ($env:SPINE_BIN) { $env:SPINE_BIN } else { Join-Path $managerRoot $config.projectCopy.launcherRelative }
$launcher = [IO.Path]::GetFullPath($configuredLauncher)
$configuredProfile = if ($env:SPINE_PROFILE_ROOT) { $env:SPINE_PROFILE_ROOT } else { Join-Path (Split-Path -Parent $launcher) 'portable-data' }
$projectRoot = [IO.Path]::GetFullPath($configuredProfile)
$portableDesktop = Join-Path $projectRoot 'portable-data\home\Desktop'
New-Item -ItemType Directory -Force -Path $portableDesktop | Out-Null

if (-not $DryRun -and -not (Test-Path -LiteralPath $launcher -PathType Leaf)) {
  throw "Project-local Spine launcher is missing: $launcher. Stage a verified project copy first."
}
if (-not ($launcher.StartsWith($projectRoot, [StringComparison]::OrdinalIgnoreCase))) {
  throw "Refusing to use a Spine launcher outside the project tool directory."
}

$externalSpine = Get-CimInstance Win32_Process | Where-Object {
  $_.Name -match '^(Spine|SpinePortable)\.exe$' -and $_.ExecutablePath -and
  -not $_.ExecutablePath.StartsWith($projectRoot, [StringComparison]::OrdinalIgnoreCase)
}
if ($externalSpine -and -not $DryRun) {
  $paths = ($externalSpine | Select-Object -ExpandProperty ExecutablePath -Unique) -join '; '
  throw "An external Spine process is already running: $paths. Close it before launching the project copy."
}

$projectHint = $null
if ($ProjectFile) {
  $resolvedProject = [IO.Path]::GetFullPath($ProjectFile)
  if (-not (Test-Path -LiteralPath $resolvedProject -PathType Leaf)) { throw "Project file does not exist: $resolvedProject" }
  $projectHint = $resolvedProject
}

if ($DryRun) {
  [pscustomobject]@{ launcher = $launcher; workingDirectory = $projectRoot; projectFileHint = $projectHint; wait = [bool]$Wait } | ConvertTo-Json
  exit 0
}

$process = Start-Process -FilePath $launcher -WorkingDirectory $projectRoot -PassThru
if ($Wait) { $process | Wait-Process }
Write-Output ("Started Spine from project copy: {0} (PID {1})" -f $launcher, $process.Id)
if ($projectHint) { Write-Output ("Open this project from the editor UI: {0}" -f $projectHint) }
