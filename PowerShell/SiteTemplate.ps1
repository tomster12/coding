
# Embedded file data
$fileDatas = <REPLACE_FILEDATAS>

# Setup server
$http = [System.Net.HttpListener]::new() 
$http.Prefixes.Add("http://localhost:8080/")
$http.Start()

if ($http.IsListening) {
    write-host " HTTP Server Ready!  " -f 'black' -b 'gre'
    write-host "Listening at $($http.Prefixes)..." -f 'y'
}

# Helper functions
function CompareRequest {
    param($context, $method, $path);
    return $context.Request.HttpMethod -eq $method -and $context.Request.Url.LocalPath -like $path
}

function RequestFile {
    param($context, $localPath);
    if (!$fileDatas.ContainsKey($localPath)) { Write-Warning "Do not have file '$localPath'"; return }
    RespondByteData $context $fileDatas.$localPath.Content $fileDatas.$localPath.ContentType
}

function RespondByteData {
    param($context, $bytes, $type);
    $context.Response.ContentLength64 = $bytes.Length
    $context.Response.ContentType = $type
    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $context.Response.OutputStream.Close()
}

# Listener loop
while ($http.IsListening) {
    $context = $http.GetContext()
    
    Write-Host "'$($context.Request.UserHostAddress)' requested '$($Context.Request.Url.LocalPath)' ( $($context.Request.Url) )" -f 'mag'

    # http://127.0.0.1/*
    if (CompareRequest $context "GET" "/*") {
        $localPath = $context.Request.Url.LocalPath
        if ($localPath -eq "/") { $localPath = "/index.html" }
        RequestFile $context $localPath
    }
}

# $FormContent = [System.IO.StreamReader]::new($context.Request.InputStream).ReadToEnd()
# Write-Host $FormContent -f 'Green'
