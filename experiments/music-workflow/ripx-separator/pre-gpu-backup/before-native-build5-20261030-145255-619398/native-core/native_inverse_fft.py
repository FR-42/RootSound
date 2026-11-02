"""529480 packed-real inverse and3266c0 normalization, statically reconstructed.

Uses the same recovered radix4/2 arithmetic as the forward native FFT, with
the original inverse twiddle/sign branches. No NumPy/SciPy FFT is called.
Only the power-of-two domain required by512-sample band filtering is covered.
"""
from functools import lru_cache
import math
from native_fft import _multiply


@lru_cache(maxsize=8)
def _inverse_twiddles(length):
    return tuple(complex(math.cos(float(i)*6.283185307179586/length),
                         math.sin(float(i)*6.283185307179586/length)) for i in range(length))


def _inverse_worker(data,twiddles,stride):
    count=len(data)
    if count==1:return list(data)
    radix=4 if count%4==0 else 2
    width=count//radix
    groups=[_inverse_worker(data[index::radix],twiddles,stride*radix) for index in range(radix)]
    output=[0j]*count
    for index in range(width):
        first=groups[0][index]
        second=_multiply(groups[1][index],twiddles[index*stride])
        if radix==2:
            output[index]=first+second;output[index+width]=first-second;continue
        third=_multiply(groups[2][index],twiddles[index*stride*2])
        fourth=_multiply(groups[3][index],twiddles[index*stride*3])
        difference=first-third;summed=first+third
        odd_sum=second+fourth;odd_difference=second-fourth
        output[index+2*width]=summed-odd_sum
        output[index]=summed+odd_sum
        output[index+width]=complex(difference.real-odd_difference.imag,
                                     difference.imag+odd_difference.real)
        output[index+3*width]=complex(difference.real+odd_difference.imag,
                                       difference.imag-odd_difference.real)
    return output


@lru_cache(maxsize=8)
def _inverse_real_twiddles(half):
    return tuple(complex(math.cos((float(k)/half+.5)*3.141592653589793),
                         math.sin((float(k)/half+.5)*3.141592653589793))
                 for k in range(1,half//2+1))


def inverse_real(spectrum):
    """3266c0 finite full-spectrum input -> normalized real samples.

    529480 only consumes bins0..N/2 even though326510/328210 preserve a full
    N-complex work buffer. Negative-frequency bins are not reinterpreted or
    averaged by this wrapper. The explicit division byN belongs to3266c0.
    """
    values=tuple(complex(value) for value in spectrum)
    count=len(values)
    if count<4 or count&(count-1):raise ValueError('Native inverse requires full power-of-two spectrum')
    if any(not math.isfinite(value.real) or not math.isfinite(value.imag) for value in values):
        raise ValueError('Only finite native inverse input is supported')
    half=count//2
    packed=[0j]*half
    packed[0]=complex(values[0].real+values[half].real,values[0].real-values[half].real)
    for index,twiddle in enumerate(_inverse_real_twiddles(half),1):
        positive=values[index];negative=values[half-index].conjugate()
        summed=positive+negative;difference=positive-negative
        rotated=_multiply(difference,twiddle)
        packed[index]=complex(rotated.real+summed.real,rotated.imag+summed.imag)
        packed[half-index]=complex(summed.real-rotated.real,-(summed.imag-rotated.imag))
    transformed=_inverse_worker(packed,_inverse_twiddles(half),1)
    output=[]
    for value in transformed:
        output.extend((value.real/float(count),value.imag/float(count)))
    return output
