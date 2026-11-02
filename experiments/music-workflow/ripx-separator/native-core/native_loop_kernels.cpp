// Compiled execution of the existing reconstructed sample loops.
// No external DSP/model code. Build with -fno-fast-math -ffp-contract=off.
#include <cmath>
#include <cstdint>
#include <algorithm>
#include <limits>

static double F(double x) { volatile float y=static_cast<float>(x); return y; }
static constexpr double TAU=6.283185307179586;
static constexpr double SCALE=5215.189175235227;
static constexpr double FRACTION=4294967296.0;
static bool phase_integer(double x) {return std::isfinite(x) && x>-9223372036854775808.0 && x<9223372036854775808.0;}

extern "C" {
__declspec(dllexport) unsigned rs_loop_abi() { return 1; }

__declspec(dllexport) double rs_energy(const double* values, std::int64_t count) {
    double energy=0.0;
    for(std::int64_t i=0;i<count;++i) { double x=F(values[i]); energy=energy+x*x; }
    return energy;
}

__declspec(dllexport) int rs_correlate(const double* values,const double* window,
    std::int64_t count,const double* table,const double* slopes,double frequency,
    double rate,double phase,std::int64_t first,std::int64_t hop,
    std::int64_t original_hop,std::int64_t original_begin,int chirp,int windowed,
    int negative,double* output) {
    if(count<1 || hop<1 || original_hop<1 || rate<=0) return 1;
    double omega=std::fmod((TAU/rate)*F(frequency),TAU);
    if(omega<0) omega+=TAU;
    double quantized=omega*SCALE*FRACTION+.5;
    double initial;
    if(chirp) {
        double shifted=F(F(phase)+F(402.12387));
        initial=F(F(F(shifted*F(SCALE))*F(FRACTION))+F(.5));
    } else initial=F(F(F(F(phase)*F(SCALE))*F(FRACTION))+F(.5));
    if(!phase_integer(quantized) || !phase_integer(initial)) return 2;
    std::uint64_t increment=static_cast<std::uint64_t>(static_cast<std::int64_t>(quantized));
    std::uint64_t position=static_cast<std::uint64_t>(static_cast<std::int64_t>(initial))-increment;
    double sine=0.0,cosine=0.0,correlation=0.0;
    std::int64_t cursor=first,offset=0,segment=0,end=first+count;
    while(cursor<end) {
        if(segment>=64) return 3;
        std::int64_t stop=chirp?std::min(end,(cursor&~(hop-1))+hop):end;
        for(;cursor<stop;++cursor,++offset) {
            position+=increment;
            std::uint64_t index=(position>>32)&0x7fff;
            double sample=values[offset];
            if(windowed) sample=F(sample*window[offset]);
            if(negative) correlation=F(correlation-F(sample*table[index]));
            else {
                sine=F(sine+F(sample*table[index]));
                cosine=F(cosine+F(sample*table[(index+0x2000)&0x7fff]));
            }
        }
        if(chirp && cursor<end) {
            std::int64_t distance=segment==0 && original_begin%original_hop>0?
                original_hop-original_begin%original_hop:original_hop;
            omega+=F(static_cast<double>(distance)*slopes[segment]);
            quantized=omega*SCALE*FRACTION;
            quantized=omega<0?quantized-.5:quantized+.5;
            if(!phase_integer(quantized)) return 2;
            increment=static_cast<std::uint64_t>(static_cast<std::int64_t>(quantized));
            ++segment;
        }
    }
    output[0]=sine;output[1]=cosine;output[2]=correlation;return 0;
}

__declspec(dllexport) void rs_add_component(float* pcm,std::int64_t total,
    std::int64_t start,std::int64_t hop,double amplitude,const double* table,
    std::uint64_t position,std::uint64_t increment) {
    std::int64_t left=std::min(hop/2,start),end=start+hop,right=std::min(hop/2,total-end);
    std::int64_t i=start-left+1;
    for(;i<end+right;++i) {
        position+=increment;
        double value=F(amplitude*table[(position>>32)&0x7fff]);
        if(i<start+left) value=F(value*F(F(static_cast<double>(i-start+left))/F(static_cast<double>(2*left))));
        else if(i>=end-right) value=F(value*F(F(static_cast<double>(end+right-i))/F(static_cast<double>(2*right))));
        pcm[i]=static_cast<float>(F(F(pcm[i])+value));
    }
}

__declspec(dllexport) void rs_render_segment(float* pcm,std::int64_t first,
    std::int64_t stop,const double* table,std::uint64_t* position,
    std::uint64_t increment,double* level,double delta) {
    std::uint64_t p=*position;double v=*level;
    for(std::int64_t i=first;i<stop;++i) {
        p+=increment;
        pcm[i]=static_cast<float>(F(F(table[(p>>32)&0x7fff]*v)+F(pcm[i])));
        v=F(v+delta);
    }
    *position=p;*level=v;
}
}
