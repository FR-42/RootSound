"""Static-derived power-of-two forward FFT used by RipX's spectral path.

Evidence is independent direct disassembly, not an executed original binary:
0x140610900 factorization/twiddles, 0x1406119b0 recursive worker and radix 2,
0x140610e60 radix 4, 0x140528d80 real-plan setup, 0x140528f50 real transform.
Only the observed forward power-of-two domain is implemented. No inference
about the original inverse/mixed-radix branches is required by this path.
"""
import math
from functools import lru_cache


def _multiply(a, b):
    # Preserve the separate double multiplies/add/subs visible in SSE code.
    return complex(a.real * b.real - a.imag * b.imag,
                   a.imag * b.real + a.real * b.imag)


@lru_cache(maxsize=8)
def _twiddles(length):
    # 6109a5..6109d2: (-2*pi * i) / length, cos followed by sin.
    return tuple(complex(math.cos((float(i) * -6.283185307179586) / length),
                         math.sin((float(i) * -6.283185307179586) / length))
                 for i in range(length))


def _complex_worker(data, twiddles, stride):
    count = len(data)
    if count == 1:
        return list(data)
    radix = 4 if count % 4 == 0 else 2
    width = count // radix
    # 611a30 copies strided leaves; 611a60 recurses then dispatches butterflies.
    groups = [_complex_worker(data[index::radix], twiddles, stride * radix)
              for index in range(radix)]
    output = [0j] * count
    for index in range(width):
        first = groups[0][index]
        second = _multiply(groups[1][index], twiddles[index * stride])
        if radix == 2:
            output[index] = first + second
            output[index + width] = first - second
            continue
        third = _multiply(groups[2][index], twiddles[index * stride * 2])
        fourth = _multiply(groups[3][index], twiddles[index * stride * 3])
        difference = first - third
        summed = first + third
        odd_sum = second + fourth
        odd_difference = second - fourth
        output[index + 2 * width] = summed - odd_sum
        output[index] = summed + odd_sum
        # 610fe8..611049: forward branch (plan inverse flag == 0).
        output[index + width] = complex(difference.real + odd_difference.imag,
                                         difference.imag - odd_difference.real)
        output[index + 3 * width] = complex(difference.real - odd_difference.imag,
                                             difference.imag + odd_difference.real)
    return output


def forward_complex(data):
    """Unnormalized forward transform, exp(-2*pi*i*k*n/N)."""
    values = tuple(complex(value) for value in data)
    count = len(values)
    if not count or count & (count - 1):
        raise ValueError('Only positive power-of-two lengths are reconstructed')
    if any(not math.isfinite(value.real) or not math.isfinite(value.imag) for value in values):
        raise ValueError('Only finite FFT input is reconstructed')
    return _complex_worker(values, _twiddles(count), 1)


@lru_cache(maxsize=8)
def _real_twiddles(half):
    # 528eb0..528eee: (-pi)*(k/half+0.5), forward flag zero.
    return tuple(complex(math.cos((float(k) / half + .5) * -3.141592653589793),
                         math.sin((float(k) / half + .5) * -3.141592653589793))
                 for k in range(1, half // 2 + 1))


def forward_real(data):
    """0x140528f50 packed-real recombination; includes DC and Nyquist.

    Half factors undo the packed even/odd complex sum; they are not 1/N.
    A constant-one vector returns DC=N, a unit impulse has magnitude one.
    """
    values = tuple(float(value) for value in data)
    count = len(values)
    if count < 4 or count & (count - 1):
        raise ValueError('Real transform requires power-of-two length >= 4')
    half = count // 2
    packed = forward_complex([complex(values[2 * i], values[2 * i + 1]) for i in range(half)])
    output = [0j] * (half + 1)
    output[0] = complex(packed[0].real + packed[0].imag, 0)
    output[half] = complex(packed[0].real - packed[0].imag, 0)
    for k, twiddle in enumerate(_real_twiddles(half), 1):
        positive, negative = packed[k], packed[half - k].conjugate()
        summed, difference = positive + negative, positive - negative
        rotated = _multiply(difference, twiddle)
        output[k] = complex((summed.real + rotated.real) * .5,
                            (summed.imag + rotated.imag) * .5)
        output[half - k] = complex((summed.real - rotated.real) * .5,
                                   (rotated.imag - summed.imag) * .5)
    return output
