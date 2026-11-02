"""350430/350100 native event-group allocation and residual redistribution.

The group slots are original0xf8 fields. Event kind/identity are copied from
34df10-owned event records; they are not inferred from instrument names.
"""
import struct
from native_harmonic_fields import f32


def _f(data,offset):return struct.unpack_from('<f',data,offset)[0]
def _put(data,offset,value):struct.pack_into('<f',data,offset,f32(value))
def _sides(mode):return tuple(max(0,index-1) for index in range(1 if mode>=3 else 0,mode))
def _strength(record,group,mode):
    base=0x14+group*0x18;left=_f(record,base)
    return left if mode==1 else f32(f32(_f(record,base+4)+left)*.5)
def _chosen(mask):return 7 if mask==0xfc else next(group for group in range(2,8) if not mask&(1<<group))


def redistribute_native_noise_remainder(packed,*,context):
    """350100 distributes remaining group0 among original0x11/0x40 groups."""
    if len(packed)%0xf8:raise ValueError('Actual packed native0xf8 records required')
    output=packed if isinstance(packed,bytearray) else bytearray(packed)
    for offset in range(0,len(output),0xf8):
        positive=False
        for side in _sides(context.channel_mode):
            value=_f(output,offset+0x14+side*4)
            if value<=0:continue
            eligible=[group for group in range(1,8) if output[offset+0xd0+group] in (0x11,0x40)]
            total=0.0
            for group in eligible:total=f32(total+_f(output,offset+0x14+group*0x18+side*4))
            if total>0:
                for group in eligible:
                    at=offset+0x14+group*0x18+side*4;old=_f(output,at)
                    _put(output,at,f32(f32(f32(value*old)/total)+old))
                _put(output,offset+0x14+side*4,0.0)
            positive=True
        if positive and (context.mode_14!=0 or output[offset+0xd0]!=0x12):output[offset+0xd0]=0x7e
    return output if isinstance(packed,bytearray) else bytes(output)


def distribute_native_noise_events(events,records_by_frame,*,context,columns,group_width,
                                    task_start_frame,task_end_frame,analysis_last_frame=None,cleanup=True):
    """350430 both passes; task+10 and inclusive analysis endpoint staydistinct.

    task_end_frame is the source task+10(exclusive for output, but the native
    low-frequency pass examines it inclusively). analysis_last_frame is the
    signature's inclusive param9 and controls the final cleanup span.
    """
    last=task_end_frame if analysis_last_frame is None else analysis_last_frame
    records={frame:(value if isinstance(value,bytearray) else bytearray(value)) for frame,value in records_by_frame.items()}
    def frame_records(frame):
        if frame not in records:raise ValueError('Native event distribution lacks required produced frame')
        data=records[frame]
        if len(data)%0xf8:raise ValueError('Native distribution row is not packed0xf8 records')
        return data
    def high_locations(event):
        for frame in range(max(task_start_frame,event.start),event.end+1):
            data=frame_records(frame)
            for bucket in range(event.lower,event.upper+1):
                value=event.sample(frame,bucket)
                if value<=0:continue
                for index in range(bucket*group_width,min((bucket+1)*group_width,len(data)//0xf8)):
                    offset=index*0xf8
                    if _f(data,offset)>500.0:yield frame,data,offset,value
    for event in events:
        if event.kind!=0x11 or event.samples is None or event.identity==0:continue
        occupied=0;has_remainder=False
        for _,data,offset,_ in high_locations(event):
            view=memoryview(data)[offset:offset+0xf8]
            if _strength(view,0,context.channel_mode)>0:
                has_remainder=True
                for group in range(2,8):
                    if _strength(view,group,context.channel_mode)>0:occupied|=1<<group
            if occupied==0xfc:break
        if not has_remainder:continue
        group=_chosen(occupied)
        for _,data,offset,value in high_locations(event):
            view=memoryview(data)[offset:offset+0xf8]
            if _strength(view,0,context.channel_mode)<=0 or _strength(view,group,context.channel_mode)!=0:continue
            for side in _sides(context.channel_mode):
                source=offset+0x14+side*4;left=_f(data,source);amount=min(left,value)
                _put(data,offset+0x14+group*0x18+side*4,amount);_put(data,source,f32(left-amount))
                data[offset+0xd0+group]=event.kind;struct.pack_into('<I',data,offset+0xd8+group*4,event.identity)
    def low_locations(event):
        for frame in range(max(task_start_frame,event.start),min(task_end_frame,event.end)+1):
            data=frame_records(frame)
            for offset in range(0,len(data),0xf8):
                if _f(data,offset)>500.0:break
                if data[offset+0xd1]==0x11 and struct.unpack_from('<I',data,offset+0xdc)[0]==event.identity:
                    yield data,offset
    for event in events:
        if event.kind!=0x11 or event.samples is None or event.identity==0:continue
        occupied=0
        for data,offset in low_locations(event):
            view=memoryview(data)[offset:offset+0xf8]
            if _strength(view,1,context.channel_mode)<=0:continue
            if _strength(view,0,context.channel_mode)>0:
                for group in range(2,8):
                    if _strength(view,group,context.channel_mode)>0:occupied|=1<<group
            if occupied==0xfc:break
        group=_chosen(occupied)
        for data,offset in low_locations(event):
            view=memoryview(data)[offset:offset+0xf8]
            if _strength(view,1,context.channel_mode)<=0:continue
            for side in _sides(context.channel_mode):
                source=offset+0x2c+side*4;target=offset+0x14+group*0x18+side*4
                _put(data,target,f32(_f(data,target)+_f(data,source)));_put(data,source,0.0)
            data[offset+0xd0+group]=0x11;struct.pack_into('<I',data,offset+0xd8+group*4,event.identity)
            data[offset+0xd1]=0;struct.pack_into('<I',data,offset+0xdc,0)
    if cleanup:
        for frame in range(task_start_frame,last+1):records[frame]=redistribute_native_noise_remainder(frame_records(frame),context=context)
    records_by_frame.update(records)
    return records_by_frame
