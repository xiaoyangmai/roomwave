#!/usr/bin/env python3
"""Extract c010 atlas regions and alpha masks without changing the source atlas."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

from PIL import Image


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def parse_atlas(path: Path):
    lines = [line.strip() for line in path.read_text(encoding="utf-8").splitlines()]
    if not lines:
        raise ValueError("atlas is empty")
    page = None
    regions = []
    index = 0
    while index < len(lines):
        line = lines[index]
        if not line:
            index += 1
            continue
        # A page header is followed by a size entry. Region names are not.
        if ":" not in line and index + 1 < len(lines) and lines[index + 1].startswith("size:"):
            page = line.lstrip("\ufeff")
            index += 1
            while index < len(lines) and ":" in lines[index]:
                index += 1
            continue
        if ":" in line or page is None:
            index += 1
            continue
        name = line
        index += 1
        properties = {}
        while index < len(lines) and lines[index] and ":" in lines[index]:
            key, value = lines[index].split(":", 1)
            properties[key.strip()] = value.strip()
            index += 1
        if "bounds" not in properties:
            continue
        bounds = tuple(int(value) for value in properties["bounds"].split(","))
        if len(bounds) != 4:
            raise ValueError(f"invalid bounds for {name}: {properties['bounds']}")
        rotation = int(properties.get("rotate", "0"))
        regions.append({"name": name, "page": page, "bounds": bounds, "rotation": rotation, "properties": properties})
    return regions


def safe_name(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]+", "_", value).strip("._") or "region"


def extract(atlas_path: Path, image_path: Path, output_root: Path, only=None):
    regions = parse_atlas(atlas_path)
    pages = {image_path.name: Image.open(image_path).convert("RGBA")}
    for page_name in sorted({region["page"] for region in regions} - {image_path.name}):
        sibling = image_path.with_name(page_name)
        if not sibling.exists():
            raise FileNotFoundError(f"atlas page is missing: {sibling}")
        pages[page_name] = Image.open(sibling).convert("RGBA")
    output_regions = output_root / "regions"
    output_masks = output_root / "masks"
    output_regions.mkdir(parents=True, exist_ok=True)
    output_masks.mkdir(parents=True, exist_ok=True)
    selected = set(only or [])
    manifest_regions = []
    for region in regions:
        if selected and region["name"] not in selected:
            continue
        x, y, width, height = region["bounds"]
        crop = pages[region["page"]].crop((x, y, x + width, y + height))
        rotation = region["rotation"] % 360
        if rotation in (90, 180, 270):
            crop = crop.rotate(rotation, expand=True, resample=Image.Resampling.BICUBIC)
        filename = f"{safe_name(region['name'])}.png"
        image_output = output_regions / filename
        mask_output = output_masks / filename
        crop.save(image_output, optimize=True)
        crop.getchannel("A").save(mask_output, optimize=True)
        manifest_regions.append({
            "name": region["name"],
            "file": f"regions/{filename}",
            "mask": f"masks/{filename}",
            "sourcePage": region["page"],
            "sourceBounds": list(region["bounds"]),
            "sourceRotation": rotation,
            "rotationApplied": rotation,
            "sha256": sha256(image_output),
            "maskSha256": sha256(mask_output),
        })
    manifest = {
        "schemaVersion": 1,
        "model": "c010_00",
        "sourceAtlas": str(atlas_path),
        "sourceTexture": str(image_path),
        "sourceAtlasSha256": sha256(atlas_path),
        "sourceTextureSha256": {name: sha256(image_path.with_name(name)) for name in pages},
        "regionCount": len(manifest_regions),
        "regions": manifest_regions,
        "status": "source-extraction-only",
        "sourceUnmodified": True,
    }
    manifest_path = output_root / "region-manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest_path, len(manifest_regions)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--atlas", type=Path, default=Path("../src/spine-audit/c010/model-4.3.26/c010_00.atlas"))
    parser.add_argument("--texture", type=Path, default=Path("../src/spine-audit/c010/model-4.3.26/c010_00.png"))
    parser.add_argument("--out", type=Path, default=Path("assets/source/c010"))
    parser.add_argument("--name", action="append", dest="names", help="extract only this region; repeatable")
    args = parser.parse_args()
    manifest, count = extract(args.atlas.resolve(), args.texture.resolve(), args.out.resolve(), args.names)
    print(json.dumps({"status": "pass", "manifest": str(manifest), "regionCount": count}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
