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
