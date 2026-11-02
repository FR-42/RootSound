"""370a00 whole-song default note table owner for unique refined0x4c blocks.

Every block retains empty frames. Native group-run matching, actual harmonic
objects, note-time fields and370070 default continuation are composed here.
Only global frame/time values grow with song length;0x28 task headers never do.
"""
from dataclasses import replace
import math

from native_minimum_frames import f32
from native_frame_groups import assemble_frame_groups, expand_frame_groups
from native_group_runs import find_group_run
from native_harmonic_object import pack_harmonic_run
from native_initial_payload import InitialNativePayload
from native_initial_times import initial_time_fields
from native_note_export import continue_default_payload,document_from_payloads


class NativeNoteOwner:
    def __init__(self, *, rate_98a1ac, timestep_9c3720, component_slots,
                 pitch_tolerance_9399e0):
        self.rate=f32(rate_98a1ac);self.step=f32(timestep_9c3720)
        if not math.isfinite(self.rate) or self.rate<=0 or not math.isfinite(self.step) or self.step<=0:
            raise ValueError('Actual positive native note/frame clock required')
        if type(component_slots) is not int or not 1<=component_slots<=3:
            raise ValueError('Actual native harmonic component capacity required')
        self.slots=component_slots;self.pitch_tolerance=float(pitch_tolerance_9399e0)
        if not math.isfinite(self.pitch_tolerance) or self.pitch_tolerance<0:
            raise ValueError('Actual nonnegative native merge pitch tolerance required')
        self.run_capacity=int(f32(30.0/self.step))
        if self.run_capacity<1:raise ValueError('Native30-second run capacity is empty')
        self.next_frame=0;self.payloads=[];self.blocks=0;self.merge_count=0

    def push_block(self,record_frames,*,first_frame):
        """Accept exactly one3443e0-owned global interval, then native note runs.

        Backward note-table scanning is limited to records owned by this fresh
        independent job (equivalent to initialDAT941c78 floor0). Existing edits
        or foreign note tables are not inferred or merged into this owner.
        """
        if type(first_frame) is not int or first_frame!=self.next_frame:
            raise ValueError('Native note blocks must begin at the contiguous output frontier')
        record_frames=tuple(record_frames);expanded=[]
        for records in record_frames:
            packed=assemble_frame_groups(records)
            if packed.remaining_unmarked:
                raise OverflowError('Native frame-group capacity exceeded; no truncated notes emitted')
            groups=expand_frame_groups(packed.groups,packed.marked_records,self.slots)
            reset=[]
            for group in groups:
                data=bytearray(group);data[4]&=0xfe;reset.append(bytes(data))
            expanded.append(tuple(reset))
        current=tuple(expanded);cursor=0;created=[];updated=[]
        while True:
            run=find_group_run(current,cursor,self.run_capacity)
            if run.start_frame is None:break
            groups=tuple(current[frame][group] for frame,group in run.references)
            obj=pack_harmonic_run(groups,first_frame+run.start_frame,component_slots=self.slots)
            references=tuple((first_frame+frame,group) for frame,group in run.references)
            merged=False
            if run.start_frame==0:
                for index in range(len(self.payloads)-1,-1,-1):
                    value=continue_default_payload(self.payloads[index],obj,run_start=0,
                        current_rip_timestep=self.step,pitch_tolerance_9399e0=self.pitch_tolerance)
                    if value is not None:
                        self.payloads[index]=replace(value,references=self.payloads[index].references+references)
                        self.merge_count+=1;updated.append(index);merged=True;break
            if not merged:
                fields=initial_time_fields(obj.start,obj.end,self.rate,
                    editing_or_offset_mode=False,matching_existing_note=False)
                relative=replace(obj,start=0,end=obj.end-obj.start)
                payload=InitialNativePayload(fields,relative,f32(1/self.rate),references)
                created.append(len(self.payloads));self.payloads.append(payload)
            current,cursor=run.marked_frames,run.next_cursor
        self.next_frame+=len(record_frames);self.blocks+=1
        return {'first_frame':first_frame,'next_frame':self.next_frame,
                'new_payload_indices':tuple(created),'updated_payload_indices':tuple(updated)}

    def accept_task(self,handoff):
        """Consume aNativeTaskHandoff without reinterpreting task output bounds."""
        from native_task_handoff import NativeTaskHandoff
        if not isinstance(handoff,NativeTaskHandoff):raise TypeError('Native task handoff required')
        if handoff.next_output_frame-handoff.first_output_frame!=len(handoff.record_frames):
            raise ValueError('Native task frame count disagrees with owned output interval')
        if handoff.output_capacity_drops:
            raise OverflowError('Native3443e0 frame capacity dropped records; incomplete note table not emitted')
        return self.push_block(handoff.record_frames,first_frame=handoff.first_output_frame)

    def snapshot(self):return tuple(self.payloads)

    def document(self):
        value=document_from_payloads(self.payloads)
        value['stage']='native-default-whole-song-note-table'
        value['owned_output_frames']=self.next_frame;value['native_note_blocks']=self.blocks
        value['native_cross_block_merges']=self.merge_count
        return value
