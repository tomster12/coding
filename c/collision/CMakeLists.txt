cmake_minimum_required(VERSION 3.10)
project(collision VERSION 1.0 LANGUAGES C)

# Build raylib examples
# set(BUILD_EXAMPLES TRUE CACHE BOOL "Build raylib examples")

# Include raylib prebuilt headers
# include_directories(${CMAKE_SOURCE_DIR}/raylib/include)

# Add raylib source files
add_subdirectory(${CMAKE_SOURCE_DIR}/vendor/raylib)

# Add project source files
set(SOURCES src/main.c)
add_executable(collision ${SOURCES})

# Link raylib prebuilt libs
# target_link_libraries(collision ${CMAKE_SOURCE_DIR}/raylib/lib/raylib.lib)

# Link raylib source libs
target_link_libraries(collision raylib)

# Link raylib additional libraries
if(WIN32)
    target_link_libraries(collision winmm gdi32)
endif()
