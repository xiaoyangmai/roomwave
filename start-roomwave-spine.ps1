$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 4173
$existing = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if (-not $existing) {
    $node = Get-Command node -ErrorAction SilentlyContinue
    if (-not $node) { throw "Node.js is required to start Roomwave." }
    $env:PORT = "$port"
    Start-Process -FilePath $node.Source -ArgumentList "server.cjs" -WorkingDirectory $root -WindowStyle Hidden
    Start-Sleep -Milliseconds 700
}
Start-Process "http://127.0.0.1:$port/solo/?spine=c010"
