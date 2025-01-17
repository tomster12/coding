param (
    [string] $target,
    [string] $output = "output",
    [switch] $run,
    [switch] $silent,
    [switch] $clear
)

# Check target exists and find target directory and file ame

if ($clear) {
    Clear-Host
}

if (-not $target) {
    Write-Error "[error] Usage: .\build.ps1 .\target.c"
    exit 1
}

if (-not (Test-Path $target)) {
    Write-Error "[error] File not found: $target"
    exit 1
}

$target = [System.IO.Path]::GetFullPath($target)
$target_dir = [System.IO.Path]::GetDirectoryName($target)
$target_name = [System.IO.Path]::GetFileName($target)
$target_name_noext = [System.IO.Path]::GetFileNameWithoutExtension($target)

if ($target_dir -eq "") {
    $target_dir = "."
}

# Construct the build command considering compiler flags in the target file

$output_dir = "$target_dir\$output"
$output_exe = "$output_dir\$target_name_noext.exe"
$build_command = "gcc $target_name -o $output_exe"

$compiler_flag_search = "// compiler:"
$first_line = Get-Content $target -First 1
if ($first_line -match "^$compiler_flag_search(.*)") {
    $build_command = $build_command + " " + $matches[1].Trim()
}

# Create build output directory and run build command

if (-not (Test-Path $output_dir)) {
    New-Item -ItemType Directory -Path $output_dir | out-null
}

if (-not $silent) {
    Write-Host "[run] $build_command"
}

$base_dir = Get-Location
Set-Location $target_dir

$build_time = Measure-Command {
    Invoke-Expression $build_command
}

Set-Location $base_dir

if ($LASTEXITCODE -ne 0) {
    Write-Error "[error] Build failed: $LASTEXITCODE"
    exit 1
}

if (-not $silent) {
    Write-Host "[log] Build success: $output_exe ($($build_time.TotalSeconds)s)"
}

# Run the file if specified

if ($run) {
    if (-not $silent) {
        Write-Host "[run] $output_exe"
    }

    Invoke-Expression $output_exe
}
