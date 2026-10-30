# Project-local CLI and the SpinePortable profile

The project copy contains a Portable launcher whose profile is isolated under
`spine_manager/tools/spine-4.3.26/portable-data`. Its native profile hook is
part of `SpinePortable.exe`; running `app/Spine.com` directly does not load that
hook. Copying `portable-data/home/Spine/settings/launcher-1.json` into the
ordinary user profile is therefore not a reliable bridge: the launcher rejects
the file as invalid when the Portable identity hook is absent.

Use `tools/run-spine-portable-cli.ps1` as the project CLI facade. It forwards
the normal Spine CLI arguments after `--` while keeping the Portable profile
active. The bundled Spine executable is the Windows GUI binary, but Spine's
official CLI accepts the same arguments through `Spine.exe`; the wrapper waits
for its exit code.

Activation check:

```powershell
pwsh -File .\spine_manager\tools\run-spine-portable-cli.ps1 -CheckActivated
```

The script does not print or store an activation code. A direct invocation of
`app\Spine.com --activated` remains a separate profile and requires its own
official `--install <activation-code>` activation.

Project rule: automation must never invoke that direct `Spine.com` path. The
`cli:policy` guard scans executable pipeline code, and the
`cli:roundtrip:c010` stage calls the bridge, exports into the run
evidence directory, and parses the JSON plus atlas with the 4.3.13 runtime
core. A run is accepted only when activation, export, texture-page presence,
and structural readback all pass.
