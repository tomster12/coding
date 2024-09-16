param (
    [string]$file = "",
    [switch]$run,
    [switch]$clear
)

if ($clear) {
    Clear-Host
}

Write-Host ""

if (-not $file) {
    Write-Host "[Log] Usage: .\build.ps1 .\<filename>.c"
    exit 1
}

if (-not (Test-Path $file)) {
    Write-Host "[Log] File $file not found"
    exit 1
}

# Build up the the build command considering the first line
$build_command = "gcc $file"

$first_line = Get-Content $file -First 1
if ($first_line -match '^// flags:(.*)') {
    $build_command = $build_command + " " + $matches[1].Trim()
}

# Run the build command and check successful
Write-Host "[Run] $build_command"
Invoke-Expression $build_command

if ($LASTEXITCODE -ne 0) {
    Write-Host "[Log] Build failed!"
    exit 1
}

# Move the output .\a.exe to .\build\filename.exe
$filename = [System.IO.Path]::GetFileNameWithoutExtension($file)
$build_dir = ".\output"
$build_file = "$build_dir\$filename.exe"

if (-not (Test-Path $build_dir)) {
    New-Item -ItemType Directory -Path $build_dir
}

Move-Item -Force .\a.exe $build_file
Write-Host "[Log] Successful build: $build_file"

# Run the output file if requested
if ($run) {
    Write-Host "[Run] $build_file`n"
    Invoke-Expression $build_file
}

Write-Host ""
