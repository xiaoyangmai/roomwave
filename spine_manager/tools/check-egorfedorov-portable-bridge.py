from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from pathlib import Path


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> int:
    manager_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description="Verify egorfedorov Spine MCP through the Roomwave Portable CLI bridge.")
    parser.add_argument("--run-id", default="foundation-baseline-20261029")
    parser.add_argument("--mcp-root", default=str(Path.home() / ".codex" / "local-mcp" / "egorfedorov-spine-mcp"))
    args = parser.parse_args()

    mcp_root = Path(args.mcp_root).resolve()
    bridge = Path(os.environ.get("SPINE_BRIDGE", manager_root / "tools" / "run-spine-portable-cli.ps1")).resolve()
    spine_bin = Path(os.environ.get("SPINE_BIN", manager_root / "tools" / "spine-4.3.26" / "SpinePortable.exe")).resolve()
    run_dir = manager_root / "runs" / args.run_id
    source = run_dir / "mutation-candidate" / "c010_00.mutation.json"
    output_dir = run_dir / "mcp-egor-probe"
    project = output_dir / "probe.spine"
    export_dir = output_dir / "export"
    evidence_path = run_dir / "mcp-egorfedorov-portable-bridge-evidence.json"

    for path, label in ((bridge, "Portable bridge"), (spine_bin, "Spine Portable launcher"), (source, "mutation source")):
        if not path.exists():
            raise FileNotFoundError(f"{label} is missing: {path}")

    os.environ["SPINE_BIN"] = str(spine_bin)
    os.environ["SPINE_BRIDGE"] = str(bridge)
    sys.path.insert(0, str(mcp_root))
    import server  # type: ignore  # noqa: PLC0415

    output_dir.mkdir(parents=True, exist_ok=True)
    doctor = server.spine_doctor()
    make_project = server.make_project(str(source), str(project))
    export_project = server.export_project(str(project), str(export_dir))
    output_files = [
        {"name": path.name, "bytes": path.stat().st_size}
        for path in sorted(export_dir.glob("*"))
        if path.is_file()
    ]
    evidence = {
        "schema_version": 1,
        "server": "spine_egorfedorov",
        "status": "partial-verified" if doctor.get("spine_cli") and make_project.get("ok") and export_project.get("ok") else "blocked",
        "run_id": args.run_id,
        "environment": {"SPINE_BIN": str(spine_bin), "SPINE_BRIDGE": str(bridge)},
        "source_json": str(source),
        "source_sha256": sha256(source),
        "doctor": doctor,
        "make_project": make_project,
        "export_project": export_project,
        "output_files": output_files,
        "policy": "all CLI calls in this probe went through the Roomwave Portable CLI facade; source JSON was not modified",
        "limits": [
            "project_info output is not used as a pass criterion for this CLI build",
            "JSON-only probe does not prove texture-page export",
            "live Codex MCP must reload config before its tools inherit SPINE_BRIDGE",
        ],
    }
    evidence_path.write_text(json.dumps(evidence, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(evidence, indent=2))
    return 0 if evidence["status"] == "partial-verified" else 1


if __name__ == "__main__":
    raise SystemExit(main())
