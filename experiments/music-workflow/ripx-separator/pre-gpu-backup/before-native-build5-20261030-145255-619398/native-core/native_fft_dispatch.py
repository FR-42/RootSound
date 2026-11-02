"""Choose two implementations of the same recovered FFT arithmetic.

No transform or audio runs when this module is imported. The first real
user-requested transform compiles the strict implementation when available.
"""
from native_fft import forward_real


class NativeFFTDispatch:
    def __init__(self,report):
        self.report=report;self.backend='recovered-fft-python'
        self.transform=forward_real;self.compile_error=None;self.first=True
        try:
            from native_fft_numba import forward_real as compiled
            from numba.core.errors import NumbaError
        except (ImportError,OSError):
            pass
        else:
            self.transform=compiled;self.compile_error=NumbaError
            self.backend='recovered-fft-numba-strict-no-cache'

    def __call__(self,values):
        if self.first:
            self.first=False
            if self.compile_error is not None:
                try:return self.transform(values)
                except self.compile_error:
                    self.transform=forward_real;self.backend='recovered-fft-python'
                    self.report(.03,'本机编译器不可用，继续使用同一原生FFT的Python实现')
        return self.transform(values)
