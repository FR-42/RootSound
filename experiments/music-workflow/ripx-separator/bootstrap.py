"""Runtime paths are scoped to this application, never written to global settings."""
from pathlib import Path
import os, sys, json
ROOT = Path(__file__).resolve().parent
CONFIG = json.loads((ROOT / 'runtime.json').read_text(encoding='utf-8-sig'))
sys.path[:0] = [str(ROOT / 'packages'), CONFIG['torch_packages']]
os.environ.setdefault('PYTHONIOENCODING', 'utf-8')
os.environ.setdefault('OMP_NUM_THREADS', '4')
os.environ.setdefault('MKL_NUM_THREADS', '4')
os.environ.setdefault('MKL_THREADING_LAYER', 'SEQUENTIAL')
os.environ['NUMBA_CACHE_DIR'] = str(ROOT / '.cache' / 'numba')
os.environ['PYTHONDONTWRITEBYTECODE'] = '1'

# Intel's transitive/dynamic loads need the process PATH as well as AddDllDirectory.
# Explorer launches do not inherit the development shell's Anaconda activation.
# This is local to this process and inherited workers; no registry/global PATH edits.
_gpu_dll_handles = []
if os.name == 'nt':
    _runtime_dirs = [str(p) for p in (
        Path(CONFIG['torch_packages']) / 'Library' / 'bin',
        Path(CONFIG['torch_packages']) / 'bin',
    ) if p.is_dir()]
    _gpu_dll_handles = [os.add_dll_directory(p) for p in _runtime_dirs]
    _known = {os.path.normcase(os.path.normpath(p)) for p in _runtime_dirs}
    _inherited = [p for p in os.environ.get('PATH', '').split(os.pathsep)
                  if p and os.path.normcase(os.path.normpath(p)) not in _known]
    os.environ['PATH'] = os.pathsep.join(_runtime_dirs + _inherited)
