"""Whole-file orchestration of the recovered native ordinary harmonic path.

This owns files, bounded task windows and global output coordinates. The
native producers own peaks, history, selected candidates, trajectories,
harmonic objects and rendering. No public model fallback is available.
"""
from dataclasses import asdict
from pathlib import Path
import json
import math
import tempfile

from native_song_files import NativeSongGeometry, NativeSongPCM, decode_native_input, native_song_clock
from native_spectral import f32
from native_fft_dispatch import NativeFFTDispatch
from native_peak_windows import native_peak_window_context
from native_fundamental_seeds import NativeSeedContext
from native_raw_selection import NativeSelectionContext
from native_selection_history import NativeSelectionHistory
from native_frame_selection import select_native_frame
from native_band_buffers import NativeBandBuffers, native_band_records, native_band_processing_range
from native_frequency_search import native_frequency_blend_table, native_frequency_blend_length
from native_tracking import NativeTracker, NativeTrackingPolicy
from native_trajectory_refinement import NativeRefinementContext, refine_native_trajectories
from native_note_owner import NativeNoteOwner
from native_task_handoff import native_task_output_interval, complete_native_task
from native_song_output import export_native_song
from native_background import native_background_grids
from native_residual_grid import NativeNoiseContext
from native_noise_history import NativeNoiseTaskKey
from native_noise_pipeline import run_native_noise_task,OWNED_INACTIVE_ZERO_POLICY
from native_acoustic_classifier import classify_native_notes

REFERENCE='5f088fa4fbbe1759ef75d8034c79f33c846e3bf5f13d5048dd95a6614d2ad441'


def _write(path,value):
    path.write_text(json.dumps(value,ensure_ascii=False,allow_nan=False,indent=2),encoding='utf8')


def run_native_song(request,report,config):
    source=Path(request['input']).resolve(strict=True)
    bpm=float(request.get('coordinate_bpm',120))
    if not math.isfinite(bpm) or not 40<=bpm<=240:raise ValueError('MIDI速度坐标须为40–240 BPM')
    geometry=NativeSongGeometry(request.get('body_frames',256),request.get('prefix_frames',128))
    # These two overlap capacities are explicit resource choices of this
    # reconstruction. They are not claimed original GUI preset defaults.
    extra=request.get('tail_frames',8)
    if type(extra) is not int or not 1<=extra<=geometry.prefix_frames:
        raise ValueError('原生任务尾部容量必须在1至前后文容量之间')
    if extra<2:raise ValueError('原生鼓噪跨帧分析需要至少2帧前瞻')
    profile=request.get('harmonic_profile','mixed')
    if profile not in ('mixed','piano'):raise ValueError('未知原生谐波配置')
    noise_mode=request.get('noise_mode',0)
    if type(noise_mode) is not int or noise_mode not in (0,8):raise ValueError('原生鼓噪模式须为0或8')
    # Import all acoustic producers BEFORE creating/decoding the user task.
    from native_peak_sequence import refine_native_peak_sequence
    from native_harmonic_postprocess import postprocess_native_harmonics
    job=Path(request['job']).resolve();job.mkdir(parents=True,exist_ok=False)
    status=job/'status.json'
    _write(status,{'status':'running','public_model_used':False,'audio_validation_by_builder':False})
    try:
        with tempfile.TemporaryDirectory(prefix='.native-song-',dir=job) as temporary:
            decoded=Path(temporary)/'source-pcm16.wav'
            report(.01,'解码输入；开始原生普通谐波整曲处理（CPU）')
            info=decode_native_input(source,decoded,config)
            with NativeSongPCM(decoded) as pcm:
                rate,step,bandwidth=native_song_clock(pcm.sample_rate,pcm.hop)
                fft=NativeFFTDispatch(report)
                channel_mode=1 if pcm.channels==1 else 3
                body,prefix=geometry.body_frames,geometry.prefix_frames
                lookback=max(1,int(f32(f32(rate*f32(.035))+f32(.5)))) #31f5a0 MULSS/ADDSS.
                #31e670's generic mode8 is used for a mixed recording. Its
                #lower bound is explicitly caller-set31Hz rather than70Hz.
                #The oldff03(Piano) preset remains selectable, not disguised
                #as a general classifier or as the original app default.
                piano=profile=='piano'
                seed=NativeSeedContext(31.,4300.,channel_mode,False,8,not piano)
                selector=NativeSelectionContext(seed,rate,32 if piano else 24,96,4300.,flag_94=piano)
                history=NativeSelectionHistory(rate)
                notes=NativeNoteOwner(rate_98a1ac=rate,timestep_9c3720=step,
                    component_slots=3,pitch_tolerance_9399e0=1.)
                policy=NativeTrackingPolicy(rate,body,prefix,extra,channel_mode,mode_14=8,
                    flag_94=piano,flag_96=True,lookback_98a05c=lookback,lookback_98a060=lookback)
                refinement=NativeRefinementContext(pcm.sample_rate,pcm.hop,rate,body,prefix,
                    extra,extra,2,channel_mode,21.,min(f32(f32(pcm.sample_rate)*.5),24000.))
                windows=native_peak_window_context(pcm.sample_rate,prefix_frames=prefix,
                    body_frames=body,flag_91=False)
                bands=native_band_records(pcm.sample_rate,pcm.hop,geometry.allocated_frames*pcm.hop)
                blend=native_frequency_blend_table(native_frequency_blend_length(rate,pcm.hop))
                noise_grids,grid_bandwidth=native_background_grids(pcm.sample_rate,pcm.hop)
                bias=max(1,int(f32(f32(rate*f32(.2))+f32(.5))))
                noise_context=NativeNoiseContext(pcm.sample_rate,pcm.hop,rate,body,prefix,extra,
                    channel_mode,grid_bandwidth,bias,mode_14=noise_mode)
                blocks=(pcm.frame_count+body-1)//body
                retained=();previous_peaks=();next_group=0;noise_tail=None;next_event=0
                counters={'tasks':0,'selected_candidates':0,'raw_candidates':0,
                    'trajectories':0,'frequency_searches':0,'native_cross_block_merges':0,
                    'native_candidate_capacity_frames':0,'nonharmonic_groups':0,
                    'nonharmonic_splits':0,'native_drum_noise_events':0}
                with (job/'native-task-ledger.jsonl').open('x',encoding='utf8') as ledger:
                    for block in range(blocks):
                        pcm_channels,origin_sample=pcm.task_channels(block,geometry)
                        samples=pcm_channels[0]
                        origin_frame=block*body-prefix
                        start=prefix;end=prefix+min(body,pcm.frame_count-block*body)
                        final=block==blocks-1
                        first_sample,last_sample=native_band_processing_range(pcm.sample_rate,pcm.hop,
                            context_24=body,context_28=prefix,context_bc=extra,
                            task_start_frame=start,task_end_frame=end,
                            last_band_stride=bands[-1].primary.stride)
                        prepared=NativeBandBuffers(pcm_channels,bands,sample_rate=pcm.sample_rate,
                            hop=pcm.hop,processing_begin=first_sample,processing_end=last_sample,
                            bandwidth_989fe0=bandwidth,window_lookup_989ff0=blend)
                        report(.03+.72*block/blocks,f'原生整曲 {block+1}/{blocks}：谱峰、基频和历史选择')
                        peak_result=refine_native_peak_sequence(samples,sample_rate=pcm.sample_rate,
                            window_context=windows,band_buffers=prepared,analysis_rate=rate,
                            task_start=start,task_end=end,context_bc=extra,
                            previous_peak_frames=previous_peaks,fft=fft,pcm_channels=pcm_channels)
                        tracker=NativeTracker(policy=policy,first_frame=start,task_end_frame=end,
                            next_group_id=next_group,previous_trajectories=retained,
                            bandwidth_989fe0=bandwidth)
                        for frame in peak_result.frames:
                            selected=select_native_frame(frame,selector,history)
                            if selected.capacity_reached:
                                #321770's real physical96-record capacity is
                                #part of this native branch, not a job failure.
                                counters['native_candidate_capacity_frames']+=1
                            tracker.push_frame(frame.frame_index,selected.selected_records)
                            counters['selected_candidates']+=len(selected.selected_records)
                            counters['raw_candidates']+=selected.raw_record_count
                        tracked=tracker.finish()
                        refined=refine_native_trajectories(tracked.trajectories,prepared,context=refinement,
                            task_start_frame=start,task_end_frame=end,background=tracker.background)
                        post=postprocess_native_harmonics(refined.trajectories,context=refinement,
                            task_start_frame=start,task_end_frame=end,extra_components=1)
                        noise=run_native_noise_task(post.trajectories,prepared,noise_grids,
                            context=noise_context,task_start_frame=start,task_end_frame=end,
                            next_group_id=tracked.next_group_id,task_key=NativeNoiseTaskKey(block,0,0),
                            previous_cache=noise_tail,next_event_identity=next_event,
                            task_output_frame=block*body,zero_initialized_frames=OWNED_INACTIVE_ZERO_POLICY)
                        emit_start,emit_stop=native_task_output_interval(context_24=body,
                            task_start=start,task_end=end,task_identity_is_first=block==0,
                            control_flag_44=final)
                        handoff=complete_native_task(noise.trajectories,policy=policy,origin_frame=origin_frame,
                            task_start=start,task_end=end,emit_start=emit_start,emit_stop=emit_stop,
                            expected_output_frame=notes.next_frame,is_final_task=final)
                        notes.accept_task(handoff)
                        retained=handoff.retained.trajectories;next_group=noise.next_group_id
                        noise_tail=noise.tail_cache;next_event=noise.next_event_identity
                        previous_peaks=peak_result.retained_peak_frames
                        history.retain_for_next_task(extra)
                        counters['tasks']+=1;counters['trajectories']+=len(tracked.trajectories)
                        counters['frequency_searches']+=refined.frequency_searches
                        counters['nonharmonic_groups']+=noise.stats['created_nonharmonic_groups']
                        counters['nonharmonic_splits']+=noise.stats['split_nonharmonic_groups']
                        counters['native_drum_noise_events']+=noise.stats['classified_events']
                        ledger.write(json.dumps({'task':block,'origin_frame':origin_frame,
                            'first_output_frame':handoff.first_output_frame,'next_output_frame':handoff.next_output_frame,
                            'retained_trajectories':len(retained),'new_group_frontier':next_group,
                            'noise':noise.stats,'counters':dict(counters)},ensure_ascii=False,allow_nan=False)+'\n');ledger.flush()
                        report(.03+.72*(block+1)/blocks,f'原生整曲 {block+1}/{blocks}：音符累计 {len(notes.payloads)} 项')
                if counters['native_candidate_capacity_frames']:
                    report(.76,f"{counters['native_candidate_capacity_frames']} 帧触及原生候选容量；已在结果说明中记录")
                if notes.next_frame!=pcm.frame_count:
                    raise ValueError('原生整曲输出时钟未覆盖完整文件，任务未发布')
                counters['native_cross_block_merges']=notes.merge_count
                payloads=notes.snapshot()
                report(.78,'使用原件乐器定义与谐波签名进行音符分类')
                assignments=classify_native_notes(payloads,context_mode_14=noise_mode)
                result=export_native_song(job,payloads,decoded_pcm16=decoded,
                    coordinate_bpm=bpm,report=report,assignments=assignments)
                manifest=json.loads(result.read_text(encoding='utf8'))
                manifest.update(source=str(source),reference_binary_sha256=REFERENCE,
                    algorithm='static-reconstructed-native-stereo-harmonics-and-drum-noise',device='cpu',
                    fft_backend=fft.backend,
                    configuration={'sample_rate':pcm.sample_rate,'hop':pcm.hop,'analysis_rate':rate,
                        'timestep':step,'task_geometry':asdict(geometry),'tail_frames':extra,
                        'geometry_origin':'explicit-reconstruction-resource-profile',
                        'harmonic_context':'31e670 ff03(Piano)' if piano else '31e670 generic8 / explicit31Hz floor',
                        'scheduling':'reconstruction: harmonic pass then native residual analysis then native382c80 classifier',
                        'base_components_9399fc':2,
                        'extra_components_939a00':1,'component_slots':3,'analysis_channel_mode':channel_mode,
                        'native_93965c_noise_reanalysis':True,'native_noise_mode14':noise_mode,
                        'inactive_padding':'reconstruction-owned-zero; original unused malloc bytes unspecified'},counters=counters,
                    owned_analysis_frames=notes.next_frame,whole_file_chain_connected=True,
                    full_ripx_feature_equivalence=False,limitations=[
                        '根据静态程序证据重建；尚未与原件运行结果对比。',
                        '立体声使用原件的mean/left/right分析与双侧幅相细化，尚未原件运行对照。',
                        '本工具组合已恢复的原生阶段；没有宣称原件完整多预设调度或全部编辑流程已复刻。',
                        '不完整的分类保留未知；鼓噪负类型按原件规则保留音频，不伪造MIDI鼓键。',
                        '未恢复自动速度检测、编辑效果和全部特殊模式。',
                        '原生重建目前在CPU执行；此入口不调用公开分轨或音高模型。'])
                _write(result,manifest)
        _write(status,{'status':'complete','whole_file_chain_connected':True,
            'full_ripx_feature_equivalence':False,'public_model_used':False})
        report(1,'原生整曲搭建版输出已保存：重建音频、余量和MIDI',result=str(result))
    except BaseException as error:
        _write(status,{'status':'failed','error':str(error),'public_model_used':False})
        raise
