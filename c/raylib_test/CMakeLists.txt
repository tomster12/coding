cmake_minimum_required(VERSION 3.10)
project(collision VERSION 1.0 LANGUAGES C)

# Fetch raylib source if it doesn't exist
if(NOT EXISTS ${CMAKE_SOURCE_DIR}/vendor/raylib/CMakeLists.txt)
    message(STATUS "Fetching raylib...")
    include(FetchContent)
    set(FETCHCONTENT_QUIET FALSE)
    FetchContent_Declare(
        raylib
        GIT_REPOSITORY https://github.com/raysan5/raylib.git
        GIT_TAG        4.5.0
        GIT_SHALLOW    TRUE
        GIT_PROGRESS   TRUE
    )
    FetchContent_MakeAvailable(raylib)
    message(STATUS "raylib fetched successfully.")
endif()

# Add project files
set(SOURCES main.c)
add_executable(collision ${SOURCES})

# Link raylib libs
target_link_libraries(collision raylib)

# Link raylib dependencies
if(WIN32)
    target_link_libraries(collision winmm gdi32)
endif()
