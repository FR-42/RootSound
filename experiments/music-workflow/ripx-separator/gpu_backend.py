"""Explicit device selection. No silently successful CPU fallback for GPU jobs."""
def select_device(choice):
    import torch
    if choice == 'cpu': return 'cpu', 'CPU（显式选择）'
    if choice != 'gpu': raise ValueError('运算设备必须为 gpu 或 cpu。')
    if hasattr(torch,'xpu') and torch.xpu.is_available():
        # This performs a real allocation and operation, not just adapter enumeration.
        sample=torch.ones(8,device='xpu')
        if float((sample*2).sum().cpu()) != 16: raise RuntimeError('Intel GPU 数值自检失败。')
        return 'xpu', torch.xpu.get_device_name(0)+' / XPU（FFT 在 CPU）'
    if torch.cuda.is_available():
        return 'cuda', torch.cuda.get_device_name(0)+' / CUDA'
    raise RuntimeError('GPU 后端不可用。请检查本工具的 GPU 运行库和显卡驱动；如需 CPU，请在界面显式选择 CPU。')
