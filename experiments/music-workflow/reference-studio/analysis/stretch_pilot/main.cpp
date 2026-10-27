#include <signalsmith-stretch/signalsmith-stretch.h>

#include <cmath>
#include <filesystem>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <stdexcept>
#include <string>
#include <vector>

namespace fs = std::filesystem;

static std::vector<float> readAudio(const fs::path &path) {
    std::ifstream stream(path, std::ios::binary | std::ios::ate);
    if (!stream) throw std::runtime_error("Cannot open input");
    const auto bytes = stream.tellg();
    if (bytes <= 0 || bytes % sizeof(float)) throw std::runtime_error("Invalid float32 input length");
    const auto count = static_cast<std::size_t>(bytes) / sizeof(float);
    if (count > 1000000000) throw std::runtime_error("Input exceeds this offline trial's memory limit");
    std::vector<float> audio(count);
    stream.seekg(0);
    stream.read(reinterpret_cast<char *>(audio.data()), static_cast<std::streamsize>(bytes));
    if (!stream) throw std::runtime_error("Cannot read complete input");
    for (float value : audio) if (!std::isfinite(value)) throw std::runtime_error("Input contains nonfinite samples");
    return audio;
}

int wmain(int argc, wchar_t **argv) {
    try {
        if (argc != 6 && argc != 7) {
            std::cerr << "Usage: stretch-pilot input.f32 output.f32 sample-rate channels speed [pitch-semitones]\n"
                      << "Interleaved little-endian float32; speed 0.6 means 1/0.6 times the duration.\n";
            return 2;
        }
        const fs::path inputPath(argv[1]), outputPath(argv[2]);
        if (fs::absolute(inputPath).lexically_normal() == fs::absolute(outputPath).lexically_normal())
            throw std::runtime_error("Input and output must differ");
        if (fs::exists(outputPath) && fs::equivalent(inputPath, outputPath))
            throw std::runtime_error("Input and output refer to the same file");
        const int sampleRate = std::stoi(argv[3]);
        const int channels = std::stoi(argv[4]);
        const double speed = std::stod(argv[5]);
        const double semitones = argc == 7 ? std::stod(argv[6]) : 0;
        if (sampleRate < 8000 || sampleRate > 192000 || channels < 1 || channels > 8
            || !std::isfinite(speed) || speed < 0.25 || speed > 4
            || !std::isfinite(semitones) || std::abs(semitones) > 24)
            throw std::runtime_error("Unsupported parameters");
        auto input = readAudio(inputPath);
        if (input.size() % channels) throw std::runtime_error("Incomplete input frame");
        const auto inputFrames = input.size() / channels;
        const auto outputFrames = static_cast<std::size_t>(std::llround(inputFrames / speed));
        if (outputFrames > 1000000000 / channels) throw std::runtime_error("Output exceeds memory limit");
        std::vector<float> output;
        int inputLatency = 0, outputLatency = 0;
        if (speed == 1 && semitones == 0) {
            // Reference playback must not change samples, phase, level or duration.
            output = input;
        } else {
            signalsmith::stretch::SignalsmithStretch<float> stretch(1);
            // A single multichannel processor keeps stereo phase decisions linked.
            stretch.presetDefault(channels, static_cast<float>(sampleRate));
            stretch.setTransposeSemitones(static_cast<float>(semitones));
            inputLatency = stretch.inputLatency();
            outputLatency = stretch.outputLatency();
            // exact() performs outputSeek()/process()/flush() internally. Very
            // short clips are zero-extended to give that finite-clip path enough
            // input for its analysis window; only their requested duration remains.
            const auto paddedFrames = std::max(inputFrames, static_cast<std::size_t>(sampleRate));
            const auto paddedOutputFrames = static_cast<std::size_t>(std::llround(paddedFrames / speed));
            std::vector<std::vector<float>> planarInput(channels, std::vector<float>(paddedFrames));
            std::vector<std::vector<float>> planarOutput(channels, std::vector<float>(paddedOutputFrames));
            for (std::size_t frame = 0; frame < inputFrames; ++frame)
                for (int channel = 0; channel < channels; ++channel)
                    planarInput[channel][frame] = input[frame * channels + channel];
            if (!stretch.exact(planarInput, static_cast<int>(paddedFrames),
                               planarOutput, static_cast<int>(paddedOutputFrames)))
                throw std::runtime_error("Finite-clip stretching failed");
            output.resize(outputFrames * channels);
            for (std::size_t frame = 0; frame < outputFrames; ++frame)
                for (int channel = 0; channel < channels; ++channel)
                    output[frame * channels + channel] = planarOutput[channel][frame];
        }
        double peak = 0;
        for (float value : output) {
            if (!std::isfinite(value)) throw std::runtime_error("DSP produced nonfinite output");
            peak = std::max(peak, std::abs(static_cast<double>(value)));
        }
        std::ofstream file(outputPath, std::ios::binary | std::ios::trunc);
        if (!file) throw std::runtime_error("Cannot create output");
        file.write(reinterpret_cast<const char *>(output.data()), static_cast<std::streamsize>(output.size() * sizeof(float)));
        file.close();
        if (!file) throw std::runtime_error("Cannot write complete output");
        std::cout << std::setprecision(12)
                  << "{\"input_frames\":" << inputFrames << ",\"output_frames\":" << outputFrames
                  << ",\"sample_rate\":" << sampleRate << ",\"channels\":" << channels
                  << ",\"speed\":" << speed << ",\"pitch_semitones\":" << semitones
                  << ",\"input_latency\":" << inputLatency << ",\"output_latency\":" << outputLatency
                  << ",\"peak\":" << peak << ",\"unity_bypass\":" << ((speed == 1 && semitones == 0) ? "true" : "false")
                  << "}\n";
        return 0;
    } catch (const std::exception &error) {
        std::cerr << error.what() << '\n';
        return 1;
    }
}
