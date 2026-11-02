"""Compiled sample loops; source ownership and arithmetic stay in native code.

Only this tool's freshly built DLL is loaded, never RipX or a public model.
No audio, numeric kernel, compiler or desktop application runs on import.
"""
from functools import lru_cache
from pathlib import Path
import ctypes as C
import numpy as np

_D=C.POINTER(C.c_double);_F=C.POINTER(C.c_float);_I=C.c_int64;_U=C.c_uint64


@lru_cache(maxsize=1)
def _library():
    path=Path(__file__).with_name('native-loop-kernels.dll')
    if not path.is_file():raise RuntimeError('原生循环加速组件缺失，请更新工具；不会静默退回逐样本Python处理')
    lib=C.CDLL(str(path))
    lib.rs_loop_abi.argtypes=[];lib.rs_loop_abi.restype=C.c_uint
    if lib.rs_loop_abi()!=1:raise RuntimeError('原生循环加速组件版本不匹配')
    lib.rs_energy.argtypes=[_D,_I];lib.rs_energy.restype=C.c_double
    lib.rs_correlate.argtypes=[_D,_D,_I,_D,_D,C.c_double,C.c_double,C.c_double,_I,_I,_I,_I,C.c_int,C.c_int,C.c_int,_D]
    lib.rs_correlate.restype=C.c_int
    lib.rs_add_component.argtypes=[_F,_I,_I,_I,C.c_double,_D,_U,_U];lib.rs_add_component.restype=None
    lib.rs_render_segment.argtypes=[_F,_I,_I,_D,C.POINTER(_U),_U,_D,C.c_double];lib.rs_render_segment.restype=None
    return lib


def require_compiled_loops():
    _library()
    return 'source-derived-cpp-loops-strict-fp'


def _double(values):return np.ascontiguousarray(values,dtype=np.float64)
def _pointer(values):return values.ctypes.data_as(_D)


@lru_cache(maxsize=1)
def _sines():
    from native_pcm_component import native_sine_table
    values=_double(native_sine_table());values.flags.writeable=False;return values


def sum_squares(values):
    values=_double(values)
    return _library().rs_energy(_pointer(values),len(values))


def correlate(values,window,slopes,frequency,rate,phase,first,hop,
              original_hop,original_begin,*,chirp,negative=False):
    values=_double(values);windowed=window is not None
    weights=_double(window) if windowed else values
    if windowed and len(weights)!=len(values):raise ValueError('Native sample window length mismatch')
    slopes=_double(slopes)
    if len(slopes)!=64:raise ValueError('Exactly64 native slopes required')
    output=np.empty(3,dtype=np.float64);table=_sines()
    code=_library().rs_correlate(_pointer(values),_pointer(weights),len(values),_pointer(table),
        _pointer(slopes),frequency,rate,phase,first,hop,original_hop,original_begin,
        int(chirp),int(windowed),int(negative),_pointer(output))
    if code:raise ValueError(f'原生编译循环输入超出已恢复的相位或64帧范围（{code}）')
    return tuple(float(value) for value in output)


def _mutable_pcm(pcm):
    return isinstance(pcm,np.ndarray) and pcm.ndim==1 and pcm.dtype==np.float32 and pcm.flags.c_contiguous and pcm.flags.writeable


def add_component(pcm,start,hop,amplitude,position,increment):
    if not _mutable_pcm(pcm):return False
    table=_sines()
    _library().rs_add_component(pcm.ctypes.data_as(_F),len(pcm),start,hop,amplitude,_pointer(table),position,increment)
    return True


def render_segment(buffers,first,stop,positions,increment,levels,deltas):
    if not all(_mutable_pcm(pcm) for pcm in buffers):return False
    if any(np.shares_memory(left,right) for i,left in enumerate(buffers) for right in buffers[i+1:]):return False
    table=_sines();lib=_library()
    for channel,pcm in enumerate(buffers):
        position=_U(positions[channel]);level=C.c_double(levels[channel])
        lib.rs_render_segment(pcm.ctypes.data_as(_F),first,stop,_pointer(table),C.byref(position),increment,C.byref(level),deltas[channel])
        positions[channel]=position.value;levels[channel]=level.value
    return True
