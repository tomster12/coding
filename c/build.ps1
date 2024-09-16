param (
    [string] $file = "",
    [switch] $run,
    [switch] $log,
    [switch] $clear
)

function Log {
    param (
        [string] $message
    )

    if ($log) {
        Write-Host $message
    }
}

if (-not $file) {
    Write-Error "Usage: .\build.ps1 .\<filename>.c"
    exit 1
}

if (-not (Test-Path $file)) {
    Write-Error "File $file not found"
    exit 1
}

if ($clear) {
    Clear-Host
}

$build_command = "gcc $file"
$first_line = Get-Content $file -First 1
if ($first_line -match '^// flags:(.*)') {
    $build_command = $build_command + " " + $matches[1].Trim()
}

Log "Running: $build_command"

Invoke-Expression $build_command

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed: $LASTEXITCODE"
    exit 1
}

$filename = [System.IO.Path]::GetFileNameWithoutExtension($file)
$build_dir = ".\output"
$build_file = "$build_dir\$filename.exe"

if (-not (Test-Path $build_dir)) {
    New-Item -ItemType Directory -Path $build_dir
}

Move-Item -Force .\a.exe $build_file

Log "Build successful: $build_file"

if ($run) {
    Log "Running: $build_file"
    Invoke-Expression $build_file
}
