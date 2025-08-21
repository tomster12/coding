@echo off
setlocal enabledelayedexpansion
goto :start_program

:: ----------------------------------------------------------------------------
::
::                    CBuild - Simple build script for C projects
::
:: ----------------------------------------------------------------------------
::
::   Wrapper around: `gcc <file> -o build/<file>.exe <flags>`
::   <flags> are parsed from the target file: // cbuild: <flags>
::
:: ----------------------------------------------------------------------------
:print_help
echo.
echo Usage: cbuild.bat <file> [-output build] [-compiler gcc] [-run] [-silent] [-clear] [-help]
echo.
echo ^- output: Output directory for build files ^(default: build^).
echo ^- compiler: Specify the C compiler to use ^(default: gcc^).
echo ^- run: Run the compiled executable after building.
echo ^- silent: Do not print build commands and output.
echo ^- clear: Clear the console before running.
echo ^- help: Print this message.
echo.
exit /b 0
:: ----------------------------------------------------------------------------

:: Parse arguments with defaults
:start_program
set "output=build"
set "compiler=gcc"
set "run="
set "silent="
set "clear="
set "help="
:start_parse_args
if "%~1"=="" goto end_parse_args
if "%~1"=="-help" (set "help=true" & goto print_help)
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

:: Ensure target and compiler exist
if not defined target (
    echo [error] No target file specified. See -help for usage.
    exit /b 1
)
if not exist "%target%" (
    echo [error] File not found: "%target%". See -help for usage.
    exit /b 1
)
where "%compiler%" >nul 2>&1
if errorlevel 1 (
    echo [error] Compiler not found: "%compiler%". Ensure it is in your PATH.
    exit /b 1
)

:: Resolve paths
for %%A in ("%target%") do (
    set "target_dir=%%~dpA"
    set "target_name=%%~nxA"
    set "target_base=%%~nA"
)
if not defined target_dir set "target_dir=."
set "target_path=%target_dir%%target_name%"
for %%A in ("%output%") do (
    set "output_dir=%%~dpA"
)
set "output_exe_path=%output_dir%\%target_base%.exe"

:: Extract build flags from lines in the target file
set "compiler_flags="
for /f "usebackq tokens=*" %%A in ("%target_path%") do (
    set "line=%%A"
    if "!line:~0,11!"=="// cbuild: " (
        set "compiler_flags=!compiler_flags! !line:~11!"
    ) else (
        goto exit_flag_search
    )
)
:exit_flag_search

:: Construct build command and time execution
pushd "%target_dir%"
if not exist "%output_dir%" mkdir "%output_dir%"
set "build_command=%compiler% "%target_path%" -o "%output_exe_path%" %compiler_flags%"
if not defined silent echo [run] !build_command!
for /f "tokens=1-4 delims=:.," %%T in ("%time%") do ( set "start_h=%%T" && set "start_m=%%U" && set "start_s=%%V" && set "start_ms=%%W" )
%build_command%
set "exit_code=%errorlevel%"
for /f "tokens=1-4 delims=:.," %%T in ("%time%") do ( set "end_h=%%T" && set "end_m=%%U" && set "end_s=%%V" && set "end_ms=%%W" )
popd

:: Log error or success output
if not "%exit_code%"=="0" (
    echo [error] Build failed: %exit_code%
    exit /b 1
)
set /a "start_total=(start_h*3600000) + (start_m*60000) + (start_s*1000) + start_ms"
set /a "end_total=(end_h*3600000) + (end_m*60000) + (end_s*1000) + end_ms"
if %end_total% LSS %start_total% set /a "end_total+=86400000"
set /a "build_time=end_total-start_total"
if not defined silent echo [log] Build success: %output_exe_path% ^(took %build_time% ms^)

:: [Optional] Run the executable
if defined run (
    pushd "%output_dir%"
    if not defined silent echo [run] %output_exe_path%
    "%output_exe_path%"
)
