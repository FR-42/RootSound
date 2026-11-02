"""34b460's actual512-bin neighborhood histograms over native0xf8 frames.

The returned0x410 cells are the original threshold/statistics representation
consumed by34d770/34df10, not independent spectrogram segmentation.
Evidence:remaining-34b460.json/.c, target SHA256
5f088fa4fbbe1759ef75d8034c79f33c846e3bf5f13d5048dd95a6614d2ad441.
Construction only: no audio, original execution or numerical comparison.
"""
from dataclasses import dataclass
import math
import struct

from native_harmonic_fields import f32


def _f(data,offset):return struct.unpack_from('<f',data,offset)[0]


@dataclass(frozen=True)
class NativeNoiseHistogramTable:
    packed:bytes
    columns:int
    first_frame:int
    last_frame:int
    bias:int
    group_width:int
    radius:int

    def cell(self,frame,bucket):
        if type(frame) is not int or type(bucket) is not int:
            raise ValueError('Native histogram frame/bucket must be integers')
        row=self.bias+frame-self.first_frame
        rows=len(self.packed)//0x410//self.columns if self.columns else 0
        if not 0<=row<rows or not 0<=bucket<self.columns:
            raise IndexError('Native histogram lookup outside its owned allocation')
        start=(row*self.columns+bucket)*0x410
        return self.packed[start:start+0x410]


def native_noise_histograms(records_by_frame,*,task_start_frame,task_end_frame,
                            bias_989fe4,channel_mode,group_width,radius=3):
    """34b460 taskclock→native512-bin histogram cells; end is INCLUSIVE.

    records_by_frame contains actual347170-produced packed0xf8 rows indexed
    in task-local frame coordinates, including any retained preceding context.
    group_width is350e40's round(500/bandwidth), original ushortparam2.
    Missing source rows are an error, never silent zero-valued audio evidence.
    """
    if any(type(value) is not int for value in (task_start_frame,task_end_frame,
            bias_989fe4,channel_mode,group_width,radius)):
        raise ValueError('Actual native histogram geometry required')
    if not 1<=group_width<=65535 or not 0<=radius<=32767 or bias_989fe4<0 or channel_mode not in (1,2,3) or task_end_frame<task_start_frame:
        raise ValueError('Invalid native histogram geometry')
    def row(frame):
        if frame not in records_by_frame:raise ValueError('Missing actual native noise histogram frame')
        value=records_by_frame[frame]
        if not isinstance(value,(bytes,bytearray)) or len(value)%0xf8 or len(value)//0xf8>0x1d0:
            raise ValueError('Native histogram source must be packed0xf8 records')
        return value
    reference=row(task_start_frame)
    columns=(group_width-1+len(reference)//0xf8)//group_width
    # Source allocation includes leading bias rows; retain these actual zeros
    # as allocation state, distinct from absent source measurements.
    size=(task_end_frame+1+bias_989fe4-task_start_frame)*columns*0x410
    if size>256*1024**2:raise OverflowError('Native histogram cells exceed256MiB owned allocation')
    output=bytearray(size)
    half=radius*group_width;width=((radius*2+1)&0xffff)*group_width
    window_width=width&0xffff;right_requirement=window_width-half
    for frame in range(task_start_frame,task_end_frame+1):
        source=row(frame);count=len(source)//0xf8
        base=-half
        while base<count:
            bucket=(half+base)//group_width
            if not 0<=bucket<columns:
                raise ValueError('Native noise row dimensions changed between frames')
            offset=(bucket+(bias_989fe4-task_start_frame+frame)*columns)*0x410
            for window_start in (base,base-half,base+half):
                if count<right_requirement+window_start:break
                begin=max(0,window_start);stop=min(count,window_start+window_width)
                maximum=f32(0);strengths=[]
                for index in range(begin,stop):
                    at=index*0xf8
                    if _f(source,at)<500.:continue
                    value=_f(source,at+0x14)
                    if channel_mode!=1:value=f32(f32(_f(source,at+0x18)+value)*f32(.5))
                    if not math.isfinite(value) or value<0:raise ValueError('Invalid native histogram amplitude')
                    strengths.append(value);maximum=max(maximum,max(f32(1024.),value))
                histogram=[0]*512
                if maximum:
                    for value in strengths:
                        index=int(f32(f32(value/maximum)*f32(511.)))&0xffff
                        if index>=512:raise ValueError('Native histogram amplitude exceeded its first-pass maximum')
                        histogram[index]=(histogram[index]+1)&0xffff
                total=len(strengths) if maximum else 0
                target=int(f32(f32(f32(total)/f32(6.))+f32(.5)))
                accumulated=0;quantile=f32(511.)
                for index,number in enumerate(histogram):
                    quantile=f32(index)
                    if target<=accumulated+number:
                        fraction=f32(f32(number+accumulated-target)/f32(number)) if number else f32(0)
                        quantile=f32(quantile+f32(f32(1.)-fraction));break
                    accumulated+=number
                threshold=f32(f32(quantile*f32(.001953125))*maximum)
                if _f(output,offset)<threshold:
                    struct.pack_into('<fffH',output,offset,threshold,threshold,maximum,sum(histogram)&0xffff)
                    struct.pack_into('<512H',output,offset+0xe,*histogram)
                    struct.pack_into('<H',output,offset+0x40e,512)
            base+=group_width
    return NativeNoiseHistogramTable(bytes(output),columns,task_start_frame,task_end_frame,
        bias_989fe4,group_width,radius)
