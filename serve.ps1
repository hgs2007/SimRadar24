param(
  [int]$Port = 8080
)

$root = (Get-Location).Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")

$contentTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png" = "image/png"
  ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".svg" = "image/svg+xml"
  ".ico" = "image/x-icon"
}

try {
  $listener.Start()
  Write-Host "Serving $root at http://localhost:$Port"
  Write-Host "Press Ctrl+C to stop."

  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $requestPath = $context.Request.Url.AbsolutePath.TrimStart("/")
    $relativePath = if ([string]::IsNullOrWhiteSpace($requestPath)) { "index.html" } else { $requestPath }
    $localPath = Join-Path $root $relativePath

    if ((Test-Path $localPath) -and -not (Get-Item $localPath).PSIsContainer) {
      $extension = [System.IO.Path]::GetExtension($localPath).ToLowerInvariant()
      $contentType = if ($contentTypes.ContainsKey($extension)) { $contentTypes[$extension] } else { "application/octet-stream" }
      $bytes = [System.IO.File]::ReadAllBytes($localPath)
      $context.Response.ContentType = $contentType
      $context.Response.StatusCode = 200
      $context.Response.ContentLength64 = $bytes.Length
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $message = [System.Text.Encoding]::UTF8.GetBytes("Not found")
      $context.Response.StatusCode = 404
      $context.Response.ContentType = "text/plain; charset=utf-8"
      $context.Response.ContentLength64 = $message.Length
      $context.Response.OutputStream.Write($message, 0, $message.Length)
    }

    $context.Response.OutputStream.Close()
  }
} finally {
  if ($listener.IsListening) {
    $listener.Stop()
  }
  $listener.Close()
}
