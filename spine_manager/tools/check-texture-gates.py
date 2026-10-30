#!/usr/bin/env python3
"""Deterministic Pillow-based texture gate runner.

The script deliberately separates pixel facts from model-assisted review. It
can prove mask leakage, alpha contamination, edge-ring similarity, silhouette
IoU, and optional frame flicker. Identity embeddings, LPIPS, and human-view
judgement remain explicitly deferred instead of being guessed.
"""

from __future__ import annotations

import argparse
import json
import math
import statistics
import sys
import tempfile
import warnings
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

warnings.filterwarnings("ignore", category=DeprecationWarning)


ROOT = Path(__file__).resolve().parents[1]
GATES_PATH = ROOT / "configs" / "texture-gates.json"


def load_rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def pixels(image: Image.Image):
    return list(image.getdata())


def rgb_delta(a, b):
    return max(abs(a[0] - b[0]), abs(a[1] - b[1]), abs(a[2] - b[2]))


def alpha_mask(image: Image.Image, threshold: int = 8):
    return [pixel[3] > threshold for pixel in pixels(image)]


def silhouette_iou(base: Image.Image, candidate: Image.Image):
    a, b = alpha_mask(base), alpha_mask(candidate)
    intersection = sum(x and y for x, y in zip(a, b))
    union = sum(x or y for x, y in zip(a, b))
    return 1.0 if union == 0 else intersection / union


def boundary_indices(image: Image.Image, threshold: int = 8):
    alpha = image.getchannel("A").point(lambda value: 255 if value > threshold else 0)
    mask = alpha.load()
    width, height = image.size
    result = []
    for y in range(height):
        for x in range(width):
            if not mask[x, y]:
                continue
            if any(x + dx < 0 or x + dx >= width or y + dy < 0 or y + dy >= height or not mask[x + dx, y + dy]
                   for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                result.append((x, y))
    return result


def edge_ring_ssim(base: Image.Image, candidate: Image.Image):
    ring = boundary_indices(base)
    if not ring:
        return None
    base_gray = base.convert("L").load()
    candidate_gray = candidate.convert("L").load()
    xs = [base_gray[x, y] for x, y in ring]
    ys = [candidate_gray[x, y] for x, y in ring]
    mean_x, mean_y = statistics.fmean(xs), statistics.fmean(ys)
    var_x = statistics.fmean([(value - mean_x) ** 2 for value in xs])
    var_y = statistics.fmean([(value - mean_y) ** 2 for value in ys])
    cov = statistics.fmean([(x - mean_x) * (y - mean_y) for x, y in zip(xs, ys)])
    c1, c2 = 6.5025, 58.5225
    return ((2 * mean_x * mean_y + c1) * (2 * cov + c2)) / ((mean_x ** 2 + mean_y ** 2 + c1) * (var_x + var_y + c2))


def frame_flicker(frame_paths):
    if len(frame_paths) < 2:
        return None
    images = [load_rgba(path) for path in frame_paths]
    if len({image.size for image in images}) != 1:
        raise ValueError("All flicker frames must have the same dimensions.")
    changes = []
    for before, after in zip(images, images[1:]):
        before_pixels, after_pixels = pixels(before), pixels(after)
        values = [(abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2]) + abs(a[3] - b[3])) / 1020 for a, b in zip(before_pixels, after_pixels)]
        changes.append(statistics.fmean(values))
    ordered = sorted(changes)
    p95 = ordered[min(len(ordered) - 1, math.ceil(len(ordered) * .95) - 1)]
    return {"mean": statistics.fmean(changes), "p95": p95, "samples": len(changes)}


def gate(name, observed, threshold, passed, layer, reason=None):
    result = {"name": name, "layer": layer, "observed": observed, "threshold": threshold, "status": "pass" if passed else "fail"}
    if reason:
        result["reason"] = reason
    return result


def unavailable(name, layer, reason):
    return {"name": name, "layer": layer, "status": "unavailable", "reason": reason}


def evaluate(base_path: Path, candidate_path: Path, mask_path: Path, frame_paths, config):
    base, candidate, mask = load_rgba(base_path), load_rgba(candidate_path), load_rgba(mask_path).convert("L")
    if base.size != candidate.size or base.size != mask.size:
        raise ValueError(f"base, candidate and mask dimensions must match: {base.size}, {candidate.size}, {mask.size}")
    base_pixels, candidate_pixels, mask_pixels = pixels(base), pixels(candidate), pixels(mask.convert("RGBA"))
    allowed = [pixel[0] > 0 for pixel in mask_pixels]
    outside = [not item for item in allowed]
    rgb_limit = config["hard"]["maskOutsideRgbDeltaMax"]
    outside_rgb = [rgb_delta(a, b) for a, b, is_outside in zip(base_pixels, candidate_pixels, outside) if is_outside]
    outside_alpha_changed = sum(a[3] != b[3] for a, b, is_outside in zip(base_pixels, candidate_pixels, outside) if is_outside)
    outside_changed = sum(delta > rgb_limit for delta, is_outside in zip([rgb_delta(a, b) for a, b in zip(base_pixels, candidate_pixels)], outside) if is_outside)
    outside_count = max(1, sum(outside))
    ssim = edge_ring_ssim(base, candidate)
    gates = [
        gate("mask_outside_mutation", outside_changed / outside_count, config["hard"]["maskOutsideChangedPixelRatioMax"], outside_changed / outside_count <= config["hard"]["maskOutsideChangedPixelRatioMax"], "hard"),
        gate("mask_outside_rgb_delta", max(outside_rgb or [0]), rgb_limit, max(outside_rgb or [0]) <= rgb_limit, "hard"),
        gate("alpha_contamination", outside_alpha_changed / outside_count, config["hard"]["alphaOutsideChangedPixelRatioMax"], outside_alpha_changed / outside_count <= config["hard"]["alphaOutsideChangedPixelRatioMax"], "hard"),
        gate("edge_ring_ssim", ssim, config["hard"]["edgeRingSsimMin"], ssim is not None and ssim >= config["hard"]["edgeRingSsimMin"], "hard"),
        gate("silhouette_iou", silhouette_iou(base, candidate), config["soft"]["silhouetteIoUMin"], silhouette_iou(base, candidate) >= config["soft"]["silhouetteIoUMin"], "soft"),
        unavailable("identity_embedding", "soft", "requires an independent embedding/model adapter"),
        unavailable("material_similarity", "soft", "requires LPIPS or an equivalent model adapter"),
    ]
    flicker = frame_flicker(frame_paths) if frame_paths else None
    if flicker:
        gates.extend([
            gate("frame_flicker_mean", flicker["mean"], config["hard"]["frameFlickerMeanMax"], flicker["mean"] <= config["hard"]["frameFlickerMeanMax"], "hard"),
            gate("frame_flicker_p95", flicker["p95"], config["hard"]["frameFlickerP95Max"], flicker["p95"] <= config["hard"]["frameFlickerP95Max"], "hard"),
        ])
    hard_failures = [item for item in gates if item["layer"] == "hard" and item["status"] == "fail"]
    unavailable_soft = [item for item in gates if item["layer"] == "soft" and item["status"] == "unavailable"]
    status = "fail" if hard_failures else "needs-review" if unavailable_soft else "pass"
    return {
        "schemaVersion": 1,
        "base": str(base_path),
        "candidate": str(candidate_path),
        "mask": str(mask_path),
        "gates": gates,
        "flicker": flicker,
        "status": status,
        "modelAssistedReviewRequired": bool(unavailable_soft),
        "policy": config["policy"],
    }


def self_test():
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        base = Image.new("RGBA", (32, 32), (20, 20, 20, 255))
        candidate = base.copy()
        draw = ImageDraw.Draw(candidate)
        draw.rectangle((10, 10, 16, 16), fill=(240, 120, 180, 255))
        mask = Image.new("L", (32, 32), 0)
        ImageDraw.Draw(mask).rectangle((8, 8, 18, 18), fill=255)
        base.save(root / "base.png"); candidate.save(root / "candidate.png"); mask.save(root / "mask.png")
        result = evaluate(root / "base.png", root / "candidate.png", root / "mask.png", [], json.loads(GATES_PATH.read_text(encoding="utf-8")))
        if result["status"] == "fail":
            raise RuntimeError(json.dumps(result, ensure_ascii=False))
        print(json.dumps({"status": "pass", "gateStatus": result["status"], "gateCount": len(result["gates"])}, ensure_ascii=False, indent=2))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path)
    parser.add_argument("--candidate", type=Path)
    parser.add_argument("--mask", type=Path)
    parser.add_argument("--frame-dir", type=Path)
    parser.add_argument("--out", type=Path)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        return self_test()
    if not all((args.base, args.candidate, args.mask)):
        parser.error("--base, --candidate and --mask are required unless --self-test is used")
    config = json.loads(GATES_PATH.read_text(encoding="utf-8"))
    frames = sorted(args.frame_dir.glob("*.png")) if args.frame_dir else []
    result = evaluate(args.base, args.candidate, args.mask, frames, config)
    payload = json.dumps(result, ensure_ascii=False, indent=2)
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(payload + "\n", encoding="utf-8")
    print(payload)
    if result["status"] == "fail":
        sys.exit(1)


if __name__ == "__main__":
    main()
