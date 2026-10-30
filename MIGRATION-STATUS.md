# Roomwave migration staging

## Current stage

The first staging copy was created from `D:\awesome-games\Roomwave` into `D:\Roomwave`.

- The source project was not modified.
- Local Codex MCP configuration was not copied or modified.
- A new Git repository was initialized at `D:\Roomwave` on branch `main`.
- Critical product and c010 files were copied byte-for-byte.
- The new local server passed page and API smoke checks on port 4174.
- Product files are now grouped under `src/`; the root keeps only project entrypoints and migration metadata.
- `spine_manager/` is now an outer, independent resource-production workbench; product runtime code no longer lives inside it.
- The server uses `src/` as its static and runtime application root.
- `startup:smoke` passed after the move.
- `contract:check` passed after the move.
- Product HTTP and c010 resource checks passed.
- `smoke:runtime` passes without a missing-audio exception after the catalog stops requesting background tracks whose files are absent.
- The normal `validate` command now resolves the product runtime patch from `src/config/`; it remains blocked only when the external editable `.spine` source is not supplied, which is intentional for this separated layout.
- The audit page now reads Spine 4.3's unified `constraints` array without a console TypeError.
- The runtime-only hand-end correction makes the water action target gap 0px in the passing run; it remains provisional and does not replace an editable Spine fix.

## Intentionally excluded

- `spine_manager/source/`
- `spine_manager/reference-corpus/`
- generated run output under `spine_manager/runs/` (except the minimal baseline evidence snapshot)
- `spine_manager/artifacts/`
- `spine_manager/tools/spine-4.3.26/`
- nested `node_modules/`
- runtime logs

## Next migration work

1. Keep external Spine Lab inputs behind environment variables; do not copy them into this repository.
2. Keep product c010 runtime files in `src/runtime/`, `src/config/`, and `src/spine-audit/`; keep production and validation tools in the outer workbench.
3. Add the external Spine Lab path contract without moving or copying local MCP configuration.
4. Run a fresh-clone browser and Spine runtime validation.
5. Before editable mutation, set `C010_SPINE_PROJECT` and run `npm run validate:strict` from `spine_manager`.

## External Spine environment

The new tree does not carry Portable Spine or local MCP configuration. When the
Spine Lab is available, use environment variables instead:

- `SPINE_BIN`
- `SPINE_BRIDGE`
- `SPINE_PROFILE_ROOT` (optional)
- `SPINE_TOOL_ROOT` (optional metadata)
- `C010_SPINE_ARCHIVE` (only for source import)
- `C010_SPINE_PROJECT` (direct path to the editable `.spine` file for validation)
- `ROOMWAVE_C010_PROJECT` (only for export probes)
