cmake_minimum_required(VERSION 3.24)
cmake_policy(SET CMP0141 NEW)
set(CMAKE_MSVC_DEBUG_INFORMATION_FORMAT Embedded)
project(rootsound_stretch_pilot LANGUAGES CXX)
get_filename_component(ROOT "${CMAKE_CURRENT_SOURCE_DIR}/../../../../.." ABSOLUTE)
add_executable(stretch-pilot main.cpp)
target_compile_features(stretch-pilot PRIVATE cxx_std_17)
target_include_directories(stretch-pilot PRIVATE
    "${ROOT}/.cache/stretch-pilot/source/include"
    "${ROOT}/.cache/stretch-pilot/linear/include")
if(MSVC)
    target_compile_options(stretch-pilot PRIVATE /W4 /EHsc /utf-8 /bigobj)
endif()
