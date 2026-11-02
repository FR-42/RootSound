"""File/clock ownership for native whole-song jobs; no recognizer substitutes.

FFmpeg is used only as a codec. PCM representation, zero context and the
mono branch's integer channel average follow the recovered input reader.
Task sizes are caller-selected resource geometry, not claimed RipX defaults.
"""
from dataclasses import dataclass
from pathlib import Path
import subprocess

import numpy as np
import soundfile as sf

from native_spectral import native_configuration, f32


@dataclass(frozen=True)
class NativeSongGeometry:
    body_frames: int = 256
    prefix_frames: int = 128

    def __post_init__(self):
        if type(self.body_frames) is not int or type(self.prefix_frames) is not int:
            raise ValueError('Task geometry must use integer native frames')
        if not 64 <= self.body_frames <= 4096 or not self.body_frames//2 <= self.prefix_frames <= 4096:
            raise ValueError('Task body must be64..4096 frames; context must cover at least half the body')
        if self.allocated_frames*0x1500>0x1000000:
            raise ValueError('Task geometry exceeds the recovered24-bit frame/slot queue representation')

    @property
    def allocated_frames(self):return self.body_frames + 2*self.prefix_frames


def decode_native_input(source, destination, config):
    source=Path(source).resolve(strict=True);destination=Path(destination)
    if destination.exists():raise FileExistsError(destination)
    result=subprocess.run([config['ffmpeg'],'-v','error','-nostdin','-n','-i',str(source),
        '-map','0:a:0','-vn','-c:a','pcm_s16le','-f','wav',str(destination)],
        capture_output=True,creationflags=getattr(subprocess,'CREATE_NO_WINDOW',0))
    if result.returncode:
        raise RuntimeError(result.stderr.decode('utf8',errors='replace')[-3000:])
    info=sf.info(destination)
    if info.channels not in (1,2) or info.frames<=0 or info.subtype!='PCM_16':
        raise ValueError('原生整曲入口要求非空单声道或立体声音频')
    native_configuration(info.samplerate)
    return info


class NativeSongPCM:
    """Read only one native task; keep PCM16 units without normalized scaling."""
    def __init__(self,path):
        self.stream=sf.SoundFile(path)
        self.sample_rate=self.stream.samplerate
        self.sample_count=self.stream.frames
        self.channels=self.stream.channels
        self.configuration=native_configuration(self.sample_rate)
        self.hop=self.configuration['hop']
        self.frame_count=(self.sample_count+self.hop-1)//self.hop

    def __enter__(self):return self
    def __exit__(self,*unused):self.stream.close()

    def task_mono(self,block_index,geometry):
        """367be0 /318290 task origin=(block*body-prefix)*H.

        Original signed16 mono input averages integer channels with truncation
        before conversion to float32. Native stereo feature fusion is a separate
        branch; this method does not replace it with generic stereo estimates.
        """
        if type(block_index) is not int or block_index<0:raise ValueError('Invalid native task index')
        origin=(block_index*geometry.body_frames-geometry.prefix_frames)*self.hop
        count=geometry.allocated_frames*self.hop
        output=np.zeros(count,dtype=np.float32)
        begin=max(0,origin);end=min(origin+count,self.sample_count)
        if begin<end:
            self.stream.seek(begin)
            values=self.stream.read(end-begin,dtype='int16',always_2d=True)
            if self.channels==1:mono=values[:,0]
            else:
                sums=values.astype(np.int32).sum(axis=1)
                # int16 signed division in the original rounds toward zero.
                mono=np.trunc(sums.astype(np.float64)/self.channels).astype(np.int16)
            output[begin-origin:end-origin]=mono.astype(np.float32)
        return output,origin


def native_song_clock(sample_rate,hop):
    if type(sample_rate) is not int or type(hop) is not int or min(sample_rate,hop)<=0:
        raise ValueError('Positive actual native source clock required')
    rate=f32(f32(sample_rate)/f32(hop))
    return rate,f32(1.0/rate),f32(f32(sample_rate)/f32(hop*2))
