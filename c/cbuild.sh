#!/bin/bash

# ----------------------------------------------------------------------------
#
#                    CBuild - Simple build script for C projects
#
# ----------------------------------------------------------------------------
#
#   Wrapper around: `gcc <file> -o build/<file>.exe <flags>`
#   <flags> are parsed from the target file: // cbuild: <flags>
#
# ----------------------------------------------------------------------------
print_help() {
    echo
    echo "Usage: cbuild.sh <file> [-output build] [-compiler gcc] [-run] [-silent] [-clear] [-help]"
    echo
    echo "  -output:   Output directory for build files (default: build)"
    echo "  -compiler: Specify the C compiler to use (default: gcc)"
    echo "  -run:      Run the compiled executable after building"
    echo "  -silent:   Do not print build commands and output"
    echo "  -clear:    Clear the console before running"
    echo "  -help:     Print this message"
    echo
    exit 0
}
# ----------------------------------------------------------------------------

# Parse arguments with defaults
output="build"
compiler="gcc"
run=false
silent=false
clear=false
while [[ $# -gt 0 ]]; do
    case "$1" in
        -output) output="$2"; shift 2 ;;
        -compiler) compiler="$2"; shift 2 ;;
        -run) run=true; shift ;;
        -silent) silent=true; shift ;;
        -clear) clear=true; shift ;;
        -help) print_help; shift ;;
        *) target="$1"; shift ;;
    esac
done

# [Optional] Clear console
$clear && clear

# Ensure target and compiler exist
if [[ -z "$target" ]]; then
    echo "[error] No target file specified. See -help for usage."
    exit 1
fi
if [[ ! -f "$target" ]]; then
    echo "[error] File not found: $target"
    exit 1
fi
if ! command -v "$compiler" &> /dev/null; then
    echo "[error] Compiler not found: $compiler"
    exit 1
fi

# Resolve paths
target_path=$(realpath "$target")
target_dir=$(dirname "$target_path")
target_name=$(basename "$target_path")
target_base="${target_name%.*}"
output_dir=$(realpath "$output")
output_exe="$output_dir/$target_base"

# Extract build flags from lines in the target file
compiler_flags=""
while IFS= read -r line; do
    if [[ "$line" == "// cbuild: "* ]]; then
        compiler_flags+="${line#// cbuild: } "
    else
        break
    fi
done < "$target_path"

# Construct build command and time execution
mkdir -p "$output_dir"
build_cmd="$compiler \"$target_path\" -o \"$output_exe\" $compiler_flags"
$silent || echo "[run] $build_cmd"
cd "$target_dir" || exit 1
start_time=$(date +%s%3N)
eval $build_cmd
exit_code=$?
end_time=$(date +%s%3N)
cd - > /dev/null || exit 1

# Log error or success output
if [[ $exit_code -ne 0 ]]; then
    echo "[error] Build failed: $exit_code"
    exit $exit_code
fi
build_time=$((end_time - start_time))
$silent || echo "[log] Build success: $output_exe (took ${build_time}ms)"

# [Optional] Run the executable
if $run; then
    $silent || echo "[run] $output_exe"
    "$output_exe"
fi
