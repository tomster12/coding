$startTime = Get-Date;
./output/6.exe
$endTime = Get-Date;
Write-Output "Finished in $(($endTime - $startTime).ToString())";
