$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$port = 4173
$existing = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($existing) {
    Start-Process "http://127.0.0.1:$port/solo/"
    exit 0
}
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) { throw "Node.js is required to start Roomwave." }
$env:PORT = "$port"
& $node.Source (Join-Path $root "server.cjs")
