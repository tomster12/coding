@echo off
setlocal enabledelayedexpansion

:: ----------------------------------------------------------------------------
::
::                    CBuild - Simple build script for C projects
::
:: ----------------------------------------------------------------------------
::
::   Effectively a wrapper around `gcc <file> -o build/<file>.exe <flags>`
::   <flags> are parsed from the target file: // cbuild: <flags>
::   Useful for multiple c files, linking / including, and running in 1 command
::
:: ----------------------------------------------------------------------------
::
:: Usage: cbuild.bat <file> [options]
:: Options:
::   -output <dir>    : Specify output directory (default: build)
::   -compiler <name> : Specify compiler to use (default: gcc)
::   -run             : Run the executable after building
::   -silent          : Suppress build output logging
::   -clear           : Clear the console before building
::   -help            : Display this help message
::
:: ----------------------------------------------------------------------------

:: Parse arguments with defaults
set "output=build"
set "compiler=gcc"
set "run="
set "silent="
set "clear="
set "help="

:start_parse_args
if "%~1"=="" goto end_parse_args
if "%~1"=="-help" (set "help=true" & goto check_help)
if "%~1"=="-output" (set "output=%~2" & shift & shift & goto start_parse_args)
if "%~1"=="-compiler" (set "compiler=%~2" & shift & shift & goto start_parse_args)
if "%~1"=="-run" (set "run=true" & shift & goto start_parse_args)
if "%~1"=="-silent" (set "silent=true" & shift & goto start_parse_args)
if "%~1"=="-clear" (set "clear=true" & shift & goto start_parse_args)
set "target=%~1"
shift
goto start_parse_args
:end_parse_args

:: [Optional] Clear console
if defined clear cls

:: [Optional] Print help message
:check_help
if defined help (
    echo.
    echo Usage: cbuild.bat main.c [-output build] [-compiler gcc] [-run] [-silent] [-clear] [-help]
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

:: Ensure target is specified and exists
if not defined target (
    echo [error] No target file specified. See -help for usage.
    exit /b 1
)
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

:: Resolve target directory, output directory, and output executable name
for %%A in ("%target%") do (
    set "target_dir=%%~dpA"
    set "target_name=%%~nxA"
    set "target_name_noext=%%~nA"
)
if not defined target_dir set "target_dir=."
set "output_dir=%target_dir%%output%"
set "output_exe=%output_dir%\%target_name_noext%.exe"

:: Extract build flags from subsequent lines in the target file
set "compiler_flags="
for /f "usebackq tokens=*" %%A in ("%target%") do (
    set "line=%%A"
    if "!line:~0,11!"=="// cbuild: " (
        set "compiler_flags=!compiler_flags! !line:~11!"
    ) else (
        goto exit_flag_search
    )
)
:exit_flag_search

:: Construct build command
set "build_command=%compiler% %target_name% -o "%output_exe%" %compiler_flags%"

:: Create output directory
if not exist "%output_dir%" mkdir "%output_dir%"

:: Run and time the build command from the target file directory
for /f "tokens=1-4 delims=:.," %%T in ("%time%") do ( set "start_h=%%T" && set "start_m=%%U" && set "start_s=%%V" && set "start_ms=%%W" )
pushd "%target_dir%"
if not defined silent echo [run] !build_command!
%build_command%
set "exit_code=%errorlevel%"
popd
for /f "tokens=1-4 delims=:.," %%T in ("%time%") do ( set "end_h=%%T" && set "end_m=%%U" && set "end_s=%%V" && set "end_ms=%%W" )

:: Check and log build command result
if not "%exit_code%"=="0" (
    echo [error] Build failed: %exit_code%
    exit /b 1
)
set /a "start_total=(start_h*3600000) + (start_m*60000) + (start_s*1000) + start_ms"
set /a "end_total=(end_h*3600000) + (end_m*60000) + (end_s*1000) + end_ms"
if %end_total% LSS %start_total% set /a "end_total+=86400000"
set /a "build_time=end_total-start_total"
if not defined silent echo [log] Build success: %output_exe% ^(took %build_time% ms^)

:: [Optional] Run the executable
if defined run (
    pushd "%output_dir%"
    if not defined silent echo [run] %output_exe%
    "%output_exe%"
)
