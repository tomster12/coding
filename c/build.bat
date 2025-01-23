@echo off
setlocal enabledelayedexpansion

:: Default values for parameters
set "output=build"
set "compiler=gcc"
set "run="
set "silent="
set "clear="
set "help="

:: Parse arguments
:parse_args
if "%~1"=="" goto check_help
if "%~1"=="-output" (set "output=%~2" & shift & shift & goto parse_args)
if "%~1"=="-compiler" (set "compiler=%~2" & shift & shift & goto parse_args)
if "%~1"=="-run" (set "run=true" & shift & goto parse_args)
if "%~1"=="-silent" (set "silent=true" & shift & goto parse_args)
if "%~1"=="-clear" (set "clear=true" & shift & goto parse_args)
if "%~1"=="-help" (set "help=true" & shift & goto parse_args)
set "target=%~1"
shift
goto parse_args

:: [Optional] Print help message
:check_help
if defined help (
    echo.
    echo Usage: build.bat main.c [-output build] [-compiler gcc] [-run] [-silent] [-clear] [-help]
    echo.
    echo ^- output: Output directory for build files ^(default: build^).
    echo ^- compiler: Specify the C compiler to use ^(default: gcc^).
    echo ^- run: Run the compiled executable after building.
    echo ^- silent: Do not print build commands and output.
    echo ^- clear: Clear the console before running.
    echo ^- help: Print this message.
    echo.
    exit /b 0
)

:: Ensure target is specified
if not defined target (
    echo [error] No target file specified. See -help for usage.
    exit /b 1
)

:: [Optional] Clear console
if defined clear cls

:: Ensure target file exists
if not exist "%target%" (
    echo [error] File not found: "%target%". See -help for usage.
    exit /b 1
)

:: Ensure compiler is available
where "%compiler%" >nul 2>&1
if errorlevel 1 (
    echo [error] Compiler not found: "%compiler%". Ensure it is in your PATH.
    exit /b 1
)

:: Resolve target and output paths
for %%A in ("%target%") do (
    set "target_dir=%%~dpA"
    set "target_name=%%~nxA"
    set "target_name_noext=%%~nA"
)
if not defined target_dir set "target_dir=."
set "output_dir=%target_dir%%output%"
set "output_exe=%output_dir%\%target_name_noext%.exe"

:: Check for compiler flags in the first line of the target file
set "compiler_flags="
for /f "usebackq tokens=*" %%A in ("%target%") do (
    set "line=%%A"
    if "!line:~0,10!"=="// build: " ( set "compiler_flags=!line:~10!" )
    goto exit_flag_search
)
:exit_flag_search

:: Construct build command
set "build_command=%compiler% %target_name% -o "%output_exe%" !compiler_flags!"

:: Create output directory
if not exist "%output_dir%" mkdir "%output_dir%"

:: Run and time the build command in the target directory
for /f "tokens=1-4 delims=:.," %%T in ("%time%") do ( set "start_h=%%T" && set "start_m=%%U" && set "start_s=%%V" && set "start_ms=%%W" )

pushd "%target_dir%"
if not defined silent echo [run] !build_command!
%build_command%
set "exit_code=%errorlevel%"
popd

for /f "tokens=1-4 delims=:.," %%T in ("%time%") do ( set "end_h=%%T" && set "end_m=%%U" && set "end_s=%%V" && set "end_ms=%%W" )

set /a "start_total=(start_h*3600000) + (start_m*60000) + (start_s*1000) + start_ms"
set /a "end_total=(end_h*3600000) + (end_m*60000) + (end_s*1000) + end_ms"
if %end_total% LSS %start_total% set /a "end_total+=86400000"
set /a "build_time=end_total-start_total"

:: Check build result
if not "%exit_code%"=="0" (
    echo [error] Build failed: %exit_code%
    exit /b 1
)
if not defined silent echo [log] Build success: %output_exe% ^(took %build_time% ms^)

:: [Optional] Run the executable
if defined run (
    if not defined silent echo [run] %output_exe%
    "%output_exe%"
)
