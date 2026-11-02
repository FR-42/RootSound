"""32e650/32e4b0 native residual-row transfer between task cache stages.

Cache applicability is32db40's exact predecessor ordinal and stream key,
with stage>=5. Rows are copied before31d960 consumes group identities.
No absent cache is invented for a non-first task. Event history is preserved
as its owning350e40 event objects; this layer never reinterprets those fields.
"""
from dataclasses import dataclass


@dataclass(frozen=True)
class NativeNoiseTaskKey:
    ordinal_00:int
    first_ordinal_04:int
    stream_08:int

    def __post_init__(self):
        if any(type(x) is not int for x in (self.ordinal_00,self.first_ordinal_04,self.stream_08)):
            raise ValueError('Actual native task key integers required')


@dataclass(frozen=True)
class NativeNoiseTailCache:
    key:NativeNoiseTaskKey
    rows:tuple[bytes,...]
    event_history:tuple
    source_end_frame:int
    stage_08:int=5


@dataclass(frozen=True)
class NativeNoiseRestoreResult:
    records_by_frame:dict
    from_frame:int
    event_history:tuple
    predecessor_key:NativeNoiseTaskKey|None


def restore_native_noise_tail(key,previous,*,task_start_frame,bias_989fe4):
    """32e650 copies all actual cached rows, then returnsmax(start,stop)."""
    if not isinstance(key,NativeNoiseTaskKey):raise TypeError('Actual native task cache key required')
    if type(task_start_frame) is not int or type(bias_989fe4) is not int or bias_989fe4<0:
        raise ValueError('Actual native task start/bias required')
    if key.ordinal_00==key.first_ordinal_04:
        if previous is not None:raise ValueError('First native task has no predecessor cache')
        return NativeNoiseRestoreResult({},task_start_frame,(),None)
    if not isinstance(previous,NativeNoiseTailCache):
        raise ValueError('Native non-first task requires its completed predecessor cache')
    if previous.key.ordinal_00!=key.ordinal_00-1 or previous.key.stream_08!=key.stream_08 or previous.stage_08<5:
        raise ValueError('Native predecessor cache identity/stage does not match32db40')
    records={}
    begin=task_start_frame-bias_989fe4
    for offset,row in enumerate(previous.rows):
        if not isinstance(row,bytes) or len(row)%0xf8 or len(row)//0xf8>0x1d0:
            raise ValueError('Native cache contains invalid packed0xf8 rows')
        records[begin+offset]=row
    return NativeNoiseRestoreResult(records,max(task_start_frame,begin+len(previous.rows)),
        previous.event_history,previous.key)


def retain_native_noise_tail(key,records_by_frame,*,task_end_frame,bias_989fe4,event_history=()):
    """32e4b0 saves theexact[taskend-bias,taskend) rows atstage5."""
    if not isinstance(key,NativeNoiseTaskKey):raise TypeError('Actual native task cache key required')
    if type(task_end_frame) is not int or type(bias_989fe4) is not int or bias_989fe4<0:
        raise ValueError('Actual native task end/bias required')
    rows=[]
    for frame in range(task_end_frame-bias_989fe4,task_end_frame):
        if frame not in records_by_frame:raise ValueError('Native tail cache lacks required produced row')
        value=records_by_frame[frame]
        if not isinstance(value,(bytes,bytearray)) or len(value)%0xf8 or len(value)//0xf8>0x1d0:
            raise ValueError('Native cache requires actual packed0xf8 rows')
        rows.append(bytes(value))
    return NativeNoiseTailCache(key,tuple(rows),tuple(event_history),task_end_frame)
