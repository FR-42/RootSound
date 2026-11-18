import hashlib
import json
import pathlib
import sys


def inventory(root):
    root = pathlib.Path(root).resolve()
    files = []
    for file in sorted(root.rglob('*')):
        relative = file.relative_to(root).as_posix()
        if file.is_file() and relative not in ('resources/app/install-files.json', 'resources/app/rootsound-installed'):
            if file.is_symlink() or not file.resolve().is_relative_to(root):
                raise ValueError('Linked program file: ' + relative)
            with file.open('rb') as stream:
                digest = hashlib.file_digest(stream, 'sha256').hexdigest()
            files.append({'path': relative, 'bytes': file.stat().st_size, 'sha256': digest})
    return {'version': 1, 'files': files}


if __name__ == '__main__':
    pathlib.Path(sys.argv[2]).write_text(json.dumps(inventory(sys.argv[1]), ensure_ascii=False), encoding='utf-8')
