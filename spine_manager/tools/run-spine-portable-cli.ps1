$ErrorActionPreference = 'Stop'

$rawArgument = @($args)
$checkActivated = $rawArgument -contains '-CheckActivated' -or $rawArgument -contains '--check-activated'
$spineArgument = @($rawArgument | Where-Object {
  $_ -ne '-CheckActivated' -and $_ -ne '--check-activated'
})

$managerRoot = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $PSScriptRoot 'spine-tool.json'
$config = Get-Content -Raw -LiteralPath $configPath | ConvertFrom-Json
$configuredLauncher = if ($env:SPINE_BIN) { $env:SPINE_BIN } else { Join-Path $managerRoot $config.projectCopy.launcherRelative }
$portableLauncher = [IO.Path]::GetFullPath($configuredLauncher)
$configuredProfile = if ($env:SPINE_PROFILE_ROOT) { $env:SPINE_PROFILE_ROOT } else { Join-Path (Split-Path -Parent $portableLauncher) 'portable-data' }
$projectRoot = [IO.Path]::GetFullPath($configuredProfile)
$portableLog = Join-Path $projectRoot 'portable-data\home\Spine\spine.log'

if (-not (Test-Path -LiteralPath $portableLauncher -PathType Leaf)) {
  throw "Project-local SpinePortable launcher is missing: $portableLauncher"
}

if (-not (Test-Path -LiteralPath $projectRoot -PathType Container)) {
  throw "Project-local Spine tool directory is missing: $projectRoot"
}

if ($checkActivated) {
  $forwarded = @('--activated')
} elseif ($spineArgument.Count -gt 0) {
  $forwarded = @($spineArgument)
} else {
  throw 'Provide Spine CLI arguments, or use -CheckActivated.'
}

# SpinePortable owns the profile isolation hooks. The double-dash forwards the
# remaining arguments to the bundled Spine executable inside that profile.
# Start-Process is used so the wrapper's child exit status is preserved.
# The profile is already activated locally. In a headless MCP process the
# launcher otherwise tries to seed/update the package online before forwarding
# the CLI command, which fails in an offline environment. --no-license keeps
# the existing portable profile and skips that network-dependent seeding step.
$argumentLine = (@('--no-license', '--wait', '--') + @($forwarded) | ForEach-Object {
  if ($_ -match '[\s"]') { '"' + $_.Replace('"', '\\"') + '"' } else { $_ }
}) -join ' '
$cliStdout = Join-Path $projectRoot 'portable-data\tmp\mcp-cli.stdout.log'
$cliStderr = Join-Path $projectRoot 'portable-data\tmp\mcp-cli.stderr.log'
New-Item -ItemType Directory -Force -Path (Split-Path $cliStdout) | Out-Null
$process = Start-Process -FilePath $portableLauncher -ArgumentList $argumentLine -WorkingDirectory $projectRoot `
  -RedirectStandardOutput $cliStdout -RedirectStandardError $cliStderr -PassThru -Wait
$exitCode = $process.ExitCode

if ($checkActivated) {
  $activated = $false
  $logTail = @()
  if (Test-Path -LiteralPath $portableLog -PathType Leaf) {
    $logTail = @(Get-Content -LiteralPath $portableLog -Tail 40)
    $activated = [bool]($logTail | Where-Object { $_ -match '^Activated\.$' })
  }

  [pscustomobject]@{
    launcher = $portableLauncher
    profile = Join-Path $projectRoot 'portable-data'
    forwarded = $forwarded
    processExitCode = $exitCode
    logActivated = $activated
    logPath = $portableLog
  } | ConvertTo-Json -Depth 4
}

exit $exitCode
