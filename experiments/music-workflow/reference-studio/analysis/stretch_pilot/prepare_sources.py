"""Fetch pinned public MIT sources for the isolated, offline stretch trial."""
from __future__ import annotations

import hashlib
import io
import json
from pathlib import Path
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[5]
CACHE = ROOT / ".cache" / "stretch-pilot"
REPOSITORY = "Signalsmith-Audio/signalsmith-stretch"
COMMIT = "88061fd4eda56a2353c5d65c74aa3f4ccf76f9da"
LINEAR_COMMIT = "7bb1c8f36794d6980080ce817c91f8da8fe56a66"  # upstream tag 0.6.6


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "RootSound-local-experiment"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def archive(repository: str, commit: str, destination: Path) -> dict:
    url = f"https://codeload.github.com/{repository}/zip/{commit}"
    data = fetch(url)
    with zipfile.ZipFile(io.BytesIO(data)) as bundle:
        prefix = bundle.namelist()[0].split("/", 1)[0] + "/"
        for entry in bundle.infolist():
            relative = entry.filename.removeprefix(prefix)
            if not relative:
                continue
            target = (destination / relative).resolve()
            if not target.is_relative_to(destination.resolve()):
                raise ValueError("Unsafe archive path")
            if entry.is_dir():
                target.mkdir(parents=True, exist_ok=True)
            else:
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(bundle.read(entry))
    return {"repository": repository, "commit": commit, "url": url,
            "archive_sha256": hashlib.sha256(data).hexdigest()}


def main() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    source = CACHE / "source"
    records = [archive(REPOSITORY, COMMIT, source)]
    cmake = (source / "CMakeLists.txt").read_text(encoding="utf-8")
    if "GIT_TAG 0.6.6" not in cmake:
        raise ValueError("Pinned Stretch dependency declaration changed")
    records.append(archive("Signalsmith-Audio/linear", LINEAR_COMMIT, CACHE / "linear"))
    (CACHE / "sources.json").write_text(json.dumps(records, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(records, indent=2))


if __name__ == "__main__":
    main()
