"""Optional strict Numba compilation of the statically reconstructed FFT.

No fast-math, no external FFT calls. Twiddles come from native_fft's same
scalar Python math functions. Not enabled by the spectral front end by default.
"""
import numpy as np
from numba import njit
from native_fft import _twiddles, _real_twiddles


@njit(cache=False, fastmath=False)
def _mul(a,b):
    return complex(a.real*b.real-a.imag*b.imag,
                   a.imag*b.real+a.real*b.imag)


@njit(cache=False, fastmath=False)
def _worker(data, twiddles, stride):
    count=len(data)
    if count==1:
        return data.copy()
    radix=4 if count%4==0 else 2
    width=count//radix
    groups=np.empty((radix,width),dtype=np.complex128)
    for group in range(radix):
        groups[group]=_worker(data[group::radix],twiddles,stride*radix)
    output=np.empty(count,dtype=np.complex128)
    for index in range(width):
        first=groups[0,index]
        second=_mul(groups[1,index],twiddles[index*stride])
        if radix==2:
            output[index]=first+second
            output[index+width]=first-second
            continue
        third=_mul(groups[2,index],twiddles[index*stride*2])
        fourth=_mul(groups[3,index],twiddles[index*stride*3])
        difference=first-third
        summed=first+third
        odd_sum=second+fourth
        odd_difference=second-fourth
        output[index+2*width]=summed-odd_sum
        output[index]=summed+odd_sum
        output[index+width]=complex(difference.real+odd_difference.imag,
                                    difference.imag-odd_difference.real)
        output[index+3*width]=complex(difference.real-odd_difference.imag,
                                      difference.imag+odd_difference.real)
    return output


@njit(cache=False, fastmath=False)
def _real(values, twiddles, real_twiddles):
    half=len(values)//2
    source=np.empty(half,dtype=np.complex128)
    for i in range(half):
        source[i]=complex(values[2*i],values[2*i+1])
    packed=_worker(source,twiddles,1)
    output=np.empty(half+1,dtype=np.complex128)
    output[0]=complex(packed[0].real+packed[0].imag,0)
    output[half]=complex(packed[0].real-packed[0].imag,0)
    for j in range(len(real_twiddles)):
        k=j+1
        positive=packed[k]
        negative=packed[half-k].conjugate()
        summed=positive+negative
        difference=positive-negative
        rotated=_mul(difference,real_twiddles[j])
        output[k]=complex((summed.real+rotated.real)*.5,(summed.imag+rotated.imag)*.5)
        output[half-k]=complex((summed.real-rotated.real)*.5,(rotated.imag-summed.imag)*.5)
    return output


def forward_real(values):
    values=np.asarray(values,dtype=np.float64)
    count=len(values)
    if count<4 or count&(count-1) or values.ndim!=1 or not np.isfinite(values).all():
        raise ValueError('Finite power-of-two real transform required')
    half=count//2
    return _real(values,np.asarray(_twiddles(half)),np.asarray(_real_twiddles(half)))

