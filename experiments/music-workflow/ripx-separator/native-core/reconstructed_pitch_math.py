"""Static reconstruction of two RipX numerical helpers, NOT a transcriber.

Target SHA256 5f088fa4fbbe1759ef75d8034c79f33c846e3bf5f13d5048dd95a6614d2ad441.
Sources: pitch-initial.json (0x14036c990), pitch-fit.json and
pitch-fit-assembly.json (0x14036c2d0), pitch-fit-constants.json.
No RipX code is loaded/executed. Windows UCRT supplies the standard fmaf.
Inputs are finite, nonnegative frequency/amplitude arrays of length eight.
Static-derived implementation; not yet differential-tested against RipX.
"""
import ctypes
import math

f32=lambda value: ctypes.c_float(value).value
_ucrt=ctypes.CDLL('ucrtbase.dll')
_fma=_ucrt.fmaf
_fma.argtypes=[ctypes.c_float]*3
_fma.restype=ctypes.c_float
THRESHOLD=f32(f32(f32(math.pow(0.0004882961516159551,0.6020599913))*32767.0)*.5)

def inputs(frequencies, amplitudes):
    if len(frequencies)!=8 or len(amplitudes)!=8:
        raise ValueError('These helpers consume exactly eight harmonic slots.')
    values=tuple(map(f32,frequencies)),tuple(map(f32,amplitudes))
    if any(not math.isfinite(x) or x<0 for group in values for x in group):
        raise ValueError('Only the finite nonnegative analysis-input domain is reconstructed.')
    return values

def initial_fundamental(frequencies, amplitudes):
    """Returns (f0, number_above_threshold); fallback deliberately returns count=0."""
    frequencies,amplitudes=inputs(frequencies,amplitudes)
    count=0; numerator=denominator=0.0
    for n,(freq,amp) in enumerate(zip(frequencies,amplitudes),1):
        if amp>THRESHOLD:
            denominator=f32(denominator+amp)
            numerator=f32(numerator+f32(f32(freq/n)*amp)); count+=1
    if denominator==0:
        for n,(freq,amp) in enumerate(zip(frequencies,amplitudes),1):
            if amp!=0:
                denominator=f32(denominator+amp)
                numerator=f32(numerator+f32(f32(freq/n)*amp))
        count=0
    return (f32(numerator/denominator) if denominator else numerator),count

def fit_inharmonicity(frequencies, amplitudes, fixed_f0=0.0, restrict_range=True):
    """Returns (output_f0, stretch_b), preserving the original update/fallback rules.

    f_n = n*f0*(1+(n*n-1)*b). fixed_f0=0 enables two-pass joint fitting.
    SIMD assembly establishes MAX(freq,n*f0), not MIN, when f0>0.
    Five fmaf sums round to float32; determinant/solution use float64.
    """
    frequencies,amplitudes=inputs(frequencies,amplitudes)
    fixed_f0=f32(fixed_f0)
    if not math.isfinite(fixed_f0) or fixed_f0<0: raise ValueError('Invalid fixed f0')
    initial,count=initial_fundamental(frequencies,amplitudes)
    required=2 if initial>1000 and amplitudes[0]>THRESHOLD and f32(amplitudes[1]+amplitudes[2])>THRESHOLD else (3 if initial>650 else 4)
    if count<required: return (fixed_f0 or initial),0.0
    free=fixed_f0==0; f0=fixed_f0
    for _ in range(2 if free else 1):
        # D=sum(A²*n²*q²), C=sum(A²*n²*q), Y=sum(A²*n*f*q)
        # B=sum(A²*n²), X=sum(A²*n*f); q=n²-1.
        D=C=Y=B=X=0.0
        for n,(freq,amp) in enumerate(zip(frequencies,amplitudes),1):
            if amp==0: continue
            a2=f32(amp*amp); n2=f32(n*n); q=f32(n2-1)
            freq=max(freq,f32(n*f0)) if f0>0 else freq
            an2=f32(a2*n2); an=f32(a2*n)
            D=_fma(an2,f32(q*q),D)
            C=_fma(an2,q,C)
            Y=_fma(an,f32(freq*q),Y)
            if free:
                B=_fma(n2,a2,B); X=_fma(an,freq,X)
        if free:
            determinant=C*C-B*D
            f0=f32((Y*C-X*D)/determinant) if abs(determinant)>.001 else initial
    b=f32((Y-C*f0)/(D*f0)) if D*f0 else 0.0
    if restrict_range:
        numerator=f32(f32(f0*24)/f32(4433.19140625))
        denominator=f32(f32(f0*24)*575)
        lower=f32(numerator/denominator) if denominator else float('nan')
        upper=f32(f32(f32(f0-90)*f32(f0-90))*f32(4e-6)) if f0>=90 else 0.0
        if b<lower or b>upper: b=0.0
    return (fixed_f0 if not free else (f0 if b!=0 else initial)),b

if __name__=='__main__':
    assert initial_fundamental([0]*8,[0]*8)==(0.0,0)
    center,count=initial_fundamental([440*n for n in range(1,9)],[1]*8)
    assert abs(center-440)<1e-4 and count==0
    for f0,b in [(220,.0002),(440,.001),(1100,.0001)]:
        frequencies=[n*f0*(1+(n*n-1)*b) for n in range(1,9)]
        estimate,stretch=fit_inharmonicity(frequencies,[1000]*8)
        assert abs(estimate-f0)<.01,(f0,estimate)
        assert abs(stretch-b)<1e-7,(b,stretch)
    fixed,stretch=fit_inharmonicity([440*n for n in range(1,9)],[1000]*8,fixed_f0=440)
    assert fixed==440 and stretch==0
    print('PASS: static-derived scalar helper invariants; native equivalence NOT established')
