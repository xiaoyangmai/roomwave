#!/usr/bin/env python3
"""Import only c010_00 from the Nikke Spine source archive."""
from __future__ import annotations

import hashlib
import json
import os
import shutil
import zipfile
from pathlib import Path

ARCHIVE_VALUE = os.environ.get("C010_SPINE_ARCHIVE")
ARCHIVE = Path(ARCHIVE_VALUE) if ARCHIVE_VALUE else None
MANAGER = Path(__file__).resolve().parents[1]
TARGET = MANAGER / "source" / "nikke_4.0.47" / "c010_00"
MANIFEST = MANAGER / "source" / "nikke_4.0.47" / "source-manifest.json"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> None:
    if ARCHIVE is None:
        raise SystemExit("C010_SPINE_ARCHIVE is required; the source archive is kept outside the Roomwave product tree.")
    if not ARCHIVE.exists():
        raise SystemExit(f"archive is missing: {ARCHIVE}")
    if TARGET.exists():
        shutil.rmtree(TARGET)
    TARGET.mkdir(parents=True)
    selected = []
    marker = "c010_00/"
    with zipfile.ZipFile(ARCHIVE) as archive:
        for info in archive.infolist():
            name = info.filename.replace("\\", "/")
            lower = name.lower()
            position = lower.find(marker)
            if position < 0 or name.endswith("/"):
                continue
            relative = name[position + len(marker):]
            destination = (TARGET / Path(relative)).resolve()
            if not str(destination).startswith(str(TARGET.resolve())):
                raise SystemExit(f"unsafe archive member: {name}")
            destination.parent.mkdir(parents=True, exist_ok=True)
            with archive.open(info) as source, destination.open("wb") as output:
                shutil.copyfileobj(source, output)
            selected.append({
                "path": relative,
                "bytes": info.file_size,
                "sha256": sha256(destination),
            })
    project = next((item for item in selected if item["path"].lower().endswith(".spine")), None)
    if not project:
        raise SystemExit("c010_00.spine is missing from the archive")
    manifest = {
        "schemaVersion": 1,
        "model": "c010_00",
        "archive": {
            "path": str(ARCHIVE),
            "bytes": ARCHIVE.stat().st_size,
            "sha256": sha256(ARCHIVE),
        },
        "sourceProject": {
            "path": "c010_00.spine",
            "editorVersion": "4.0.47",
            "bytes": project["bytes"],
            "sha256": project["sha256"],
        },
        "extractedRoot": str(TARGET),
        "fileCount": len(selected),
        "files": selected,
        "status": "source-project-available",
        "migration": {
            "currentEditorVersion": "4.0.47",
            "candidateEditorVersion": "4.3.26",
            "status": "deferred-candidate-only",
            "requiresSpineEditor": True,
            "requiresReexport": True,
            "runtimeCompatibilityPolicy": "keep-4.0-runtime-until-4.3-reexport-is-verified",
        },
    }
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "pass", "manifest": str(MANIFEST), "project": project, "fileCount": len(selected)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
