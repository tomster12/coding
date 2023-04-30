
param(
    [Switch] $openSite
)

# Embedded file data
$fileDatas = <REPLACE_FILEDATAS>

# Setup server
$http = [System.Net.HttpListener]::new() 
$http.Prefixes.Add("http://localhost:8081/")
$http.Start()

if ($http.IsListening) {
    write-host " HTTP Server Ready!  " -f 'black' -b 'gre'
    write-host "Listening at $($http.Prefixes)..." -f 'y'
    if ($openSite) {
        Start-Process $http.Prefixes
    }
}

# Helper functions
function CompareRequest {
    param($context, $method, $path);
    return $context.Request.HttpMethod -eq $method -and $context.Request.Url.LocalPath -like $path
}

function RequestFile {
    param($context, $localPath);
    if (!$fileDatas.ContainsKey($localPath)) { Write-Warning "Do not have file '$localPath'"; return }
    $byteData = [Convert]::FromBase64String($fileDatas.$localPath.Content)
    RespondByteData $context $byteData $fileDatas.$localPath.ContentType
}

function RespondByteData {
    param($context, $bytes, $type);
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.ContentType = $type
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.OutputStream.Close()
}

function GetMachineState {
    param($context);
    $queryData = ConvertFrom-Json $context.Request.QueryString["config"]
    if ($null -eq $queryData) { return }
    Write-Host $queryData

    Write-Host "Testing remote access"
    try {  
        Invoke-Command -ComputerName $queryData.ip { 1 } -ErrorAction Stop
        Write-Host "Online"
    }
    catch {
        If ($PSItem.Exception.Message.Contains("Access is denied")) {
            Write-Host "Offline (Remoting not enabled)"
        }
        else {
            Write-Host "Offline (DNS)"
        }
    }
}

# Listener loop
while ($http.IsListening) {
    $context = $http.GetContext()
    
    Write-Host "'$($context.Request.UserHostAddress)' requested '$($Context.Request.Url.LocalPath)' ( $($context.Request.Url) )" -f 'mag'

    # GET /exit
    if (CompareRequest $context "GET" "/exit") {
        exit
    }

    # GET /machineState
    elseif (CompareRequest $context "GET" "/machineState") {
        GetMachineState $context
    }
    
    # GET /*
    elseif (CompareRequest $context "GET" "/*") {
        $localPath = $context.Request.Url.LocalPath
        if ($localPath -eq "/") { $localPath = "/index.html" }
        RequestFile $context $localPath
    }
}
