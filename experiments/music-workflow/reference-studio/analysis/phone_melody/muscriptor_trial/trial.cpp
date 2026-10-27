// Thin file/JSON wrapper. All transcription uses the unmodified pinned model API.
#include "muscriptor/transcriber.hpp"
#include <chrono>
#include <cstdio>
#include <filesystem>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <iterator>
#include <stdexcept>
#include <string>
#include <vector>

int main(int argc, char** argv) {
    try {
        if (argc < 4 || argc > 5) {
            throw std::runtime_error("usage: muscriptor_short weights.gguf mono16000.f32 notes.json [synth_lead]");
        }
        const auto began = std::chrono::steady_clock::now();
        std::ifstream input(argv[2], std::ios::binary | std::ios::ate);
        if (!input) throw std::runtime_error("cannot read prepared audio");
        const auto byte_count = input.tellg();
        if (byte_count <= 0 || byte_count % sizeof(float) != 0) throw std::runtime_error("invalid float32 audio length");
        std::vector<float> audio(static_cast<std::size_t>(byte_count) / sizeof(float));
        input.seekg(0);
        input.read(reinterpret_cast<char*>(audio.data()), byte_count);
        if (!input) throw std::runtime_error("incomplete float32 audio read");
        const auto devices = msl::availableDevices();
        msl::LoadOptions load_options;
        load_options.device = devices.size() - 1;
        auto model = msl::Transcriber::load(std::filesystem::path(argv[1]), load_options);
        if (!model) throw std::runtime_error(msl::describe(model.error()));
        if (model->device().backend != "CPU") throw std::runtime_error("CPU backend required");
        const double load_seconds = std::chrono::duration<double>(std::chrono::steady_clock::now() - began).count();
        msl::TranscribeOptions options;
        options.n_threads = 4;
        if (argc == 5) {
            if (std::string(argv[4]) != "synth_lead") throw std::runtime_error("unsupported conditioning");
            options.instruments = {msl::InstrumentGroup::SynthLead};
        }
        const auto infer_start = std::chrono::steady_clock::now();
        auto notes = model->transcribe(audio, options, [](const msl::TranscriptionUpdate& update) {
            std::fprintf(stderr, "local transcription %.0f%%; new notes=%zu\n", 100 * update.progress, update.new_notes.size());
            std::fflush(stderr);
            return true;
        });
        if (!notes) throw std::runtime_error(msl::describe(notes.error()));
        const double infer_seconds = std::chrono::duration<double>(std::chrono::steady_clock::now() - infer_start).count();
        std::ofstream output(argv[3]);
        if (!output) throw std::runtime_error("cannot create note report");
        output << std::setprecision(9) << "{\n  \"backend\":\"CPU\",\n  \"threads\":4,\n  \"sampleRate\":16000,\n"
               << "  \"conditioning\":\"" << (argc == 5 ? "synth_lead" : "automatic") << "\",\n"
               << "  \"preludeForcing\":true,\n  \"audioSeconds\":" << audio.size() / 16000.0 << ",\n"
               << "  \"loadSeconds\":" << load_seconds << ",\n  \"inferenceSeconds\":" << infer_seconds << ",\n"
               << "  \"audioUploaded\":false,\n  \"notes\":[\n";
        for (std::size_t i = 0; i < notes->size(); ++i) {
            const auto& note = (*notes)[i];
            output << "    {\"onset\":" << note.onset << ",\"offset\":" << note.offset
                   << ",\"pitch\":" << note.pitch << ",\"program\":" << note.program
                   << ",\"instrument\":\"" << msl::instrumentLabel(note.program)
                   << "\",\"is_drum\":" << (note.is_drum ? "true" : "false") << "}"
                   << (i + 1 == notes->size() ? "\n" : ",\n");
        }
        output << "  ]\n}\n";
        if (!output) throw std::runtime_error("failed writing note report");
        std::printf("notes=%zu load=%.3fs inference=%.3fs\n", notes->size(), load_seconds, infer_seconds);
        return 0;
    } catch (const std::exception& error) {
        std::fprintf(stderr, "short trial failed: %s\n", error.what());
        return 1;
    }
}
