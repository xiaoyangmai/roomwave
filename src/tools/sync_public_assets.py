from __future__ import annotations

import json
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse
from urllib.request import Request, urlopen

ORIGIN = "https://roomwave-live.sagan1122.chatgpt.site/"
ENTRY_URL = urljoin(ORIGIN, "together/")
HOST = urlparse(ORIGIN).hostname
ROOT = Path(__file__).resolve().parents[1]
USER_AGENT = "Roomwave-public-assets-mirror/1.0"
MAX_FILES = 1000

TEXT_EXTENSIONS = {
    ".html", ".htm", ".css", ".js", ".mjs", ".json", ".map", ".txt", ".svg",
}
ASSET_EXTENSIONS = {
    ".webp", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".avif",
    ".mp3", ".wav", ".ogg", ".m4a", ".webm", ".mp4", ".woff", ".woff2", ".ttf", ".otf",
    ".json", ".js", ".mjs", ".css", ".html", ".txt", ".bin",
}

class RefParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.refs: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        for key, value in attrs:
            if not value:
                continue
            key = key.lower()
            if key in {"src", "href", "poster", "data-src", "data-poster"}:
                self.refs.append(value)
            elif key == "srcset":
                self.refs.extend(part.strip().split(" ", 1)[0] for part in value.split(","))

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)


def fetch(url: str) -> tuple[bytes, str]:
    request = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=15) as response:
        return response.read(), response.headers.get_content_type()


def allowed(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.scheme in {"http", "https"} and parsed.hostname == HOST


def local_path(url: str, entry: bool = False) -> Path:
    path = unquote(urlparse(url).path)
    if not path or path.endswith("/"):
        path += "index.html"
    if path.startswith("/"):
        path = path[1:]
    if entry:
        path = "together/index.html"
    return ROOT / path


def has_candidate_extension(value: str) -> bool:
    path = urlparse(value).path.lower()
    return any(path.endswith(ext) for ext in ASSET_EXTENSIONS)


def extract_script_refs(text: str) -> list[str]:
    candidates: list[str] = []
    pattern = re.compile(r"(?:['\"`])([^'\"`\n]+)(?:['\"`])")
    for match in pattern.finditer(text):
        value = match.group(1).strip()
        if not value or value.startswith(("data:", "blob:", "javascript:", "mailto:", "#")):
            continue
        if value.startswith(("/assets/", "assets/", "./assets/", "../assets/", "/audio/", "audio/")) and has_candidate_extension(value):
            candidates.append(value)
    return candidates


def extract_css_refs(text: str) -> list[str]:
    refs: list[str] = []
    for match in re.finditer(r"url\(\s*['\"]?([^'\")]+)", text, re.I):
        value = match.group(1).strip()
        if value and not value.startswith(("data:", "#")):
            refs.append(value)
    return refs


def is_text(path: Path, content_type: str) -> bool:
    return content_type.startswith("text/") or path.suffix.lower() in TEXT_EXTENSIONS


def download_one(item: tuple[str, bool]) -> tuple[dict[str, str] | None, dict[str, str] | None, list[str]]:
    url, is_entry = item
    path = local_path(url, entry=is_entry)
    try:
        content, content_type = fetch(url)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
        refs: list[str] = []
        if is_text(path, content_type):
            try:
                text = content.decode("utf-8")
            except UnicodeDecodeError:
                text = ""
            if path.suffix.lower() in {".html", ".htm"}:
                parser = RefParser()
                parser.feed(text)
                refs.extend(parser.refs)
            elif path.suffix.lower() == ".css":
                refs.extend(extract_css_refs(text))
            elif path.suffix.lower() in {".js", ".mjs"}:
                refs.extend(extract_script_refs(text))
        record = {"url": url, "path": str(path.relative_to(ROOT)), "content_type": content_type, "bytes": str(len(content))}
        return record, None, refs
    except Exception as exc:
        return None, {"url": url, "error": str(exc)}, []


def main() -> int:
    root_page, content_type = fetch(ENTRY_URL)
    ROOT.joinpath("together/index.html").parent.mkdir(parents=True, exist_ok=True)
    ROOT.joinpath("together/index.html").write_bytes(root_page)
    parser = RefParser()
    parser.feed(root_page.decode("utf-8"))
    initial_refs = parser.refs

    queue: list[tuple[str, bool]] = [(ENTRY_URL, True)]
    # The source document declares <base href="/">, so root-relative references
    # resolve against the site origin rather than the /together/ route.
    for ref in initial_refs:
        child = urljoin(ORIGIN, ref)
        if allowed(child):
            queue.append((child, False))

    seen: set[str] = set()
    downloaded: list[dict[str, str]] = []
    failed: list[dict[str, str]] = []
    while queue and len(seen) < MAX_FILES:
        batch: list[tuple[str, bool]] = []
        for item in queue:
            url, _ = item
            parsed = urlparse(url)
            key = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
            if key not in seen and allowed(url):
                seen.add(key)
                batch.append(item)
            if len(batch) >= 32 or len(seen) >= MAX_FILES:
                break
        queue = queue[len(batch):]
        if not batch:
            break
        with ThreadPoolExecutor(max_workers=12) as pool:
            futures = [pool.submit(download_one, item) for item in batch]
            for future in as_completed(futures):
                record, error, refs = future.result()
                if record:
                    downloaded.append(record)
                    parent_url = ORIGIN if record["url"] == ENTRY_URL else record["url"]
                    for ref in refs:
                        if ref.startswith(("data:", "blob:", "javascript:", "mailto:", "#")):
                            continue
                        child = urljoin(parent_url, ref)
                        if allowed(child) and len(seen) + len(queue) < MAX_FILES:
                            queue.append((child, False))
                if error:
                    failed.append(error)

    report = {
        "origin": ORIGIN,
        "entry": ENTRY_URL,
        "downloaded_count": len(downloaded),
        "failed_count": len(failed),
        "downloaded": downloaded,
        "failed": failed,
    }
    (ROOT / "mirror-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"downloaded_count": len(downloaded), "failed_count": len(failed), "root": str(ROOT)}, ensure_ascii=False))
    if failed:
        print("failed sample:", json.dumps(failed[:10], ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
