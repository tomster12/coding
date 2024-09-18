param (
    [string] $target = "",
    [switch] $run,
    [switch] $silent,
    [switch] $clear
)

function Log {
    param (
        [string] $message
    )

    if (-not $silent) {
        Write-Host $message
    }
}

# Preliminary checks
if (-not $target) {
    Write-Error "Usage: .\build.ps1 .\target.c"
    exit 1
}

if (-not (Test-Path $target)) {
    Write-Error "File $target not found"
    exit 1
}

$target_dir = [System.IO.Path]::GetDirectoryName($target)
$target_name = [System.IO.Path]::GetFileName($target)
$target_name_noext = [System.IO.Path]::GetFileNameWithoutExtension($target)

if ($target_dir -eq "") {
    $target_dir = "."
}

if ($clear) {
    Clear-Host
}

# Move to file directory and build
$base_dir = Get-Location
Set-Location $target_dir

$build_command = "gcc $target_name -o tmp.exe"
$first_line = Get-Content $target_name -First 1
if ($first_line -match '^// build:(.*)') {
    $build_command = $build_command + " " + $matches[1].Trim()
}

Log "[run] $build_command"

$build_time = Measure-Command {
    Invoke-Expression $build_command
}

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed | $LASTEXITCODE"
    Set-Location $base_dir
    exit 1
}


# Move back to base directory and move output to build directory
Set-Location $base_dir

$build_dir = ".\output"
$build_output = "$target_dir\tmp.exe"
$build_dest = "$build_dir\$target_name_noext.exe"

if (-not (Test-Path $build_dir)) {
    New-Item -ItemType Directory -Path $build_dir
}

Move-Item -Force -Path $build_output -Destination $build_dest

Log "Build successful -> $build_dest ($($build_time.TotalSeconds)s)"

if ($run) {
    Log "[run] $build_dest"
    Invoke-Expression $build_dest
}
