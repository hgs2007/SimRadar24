$ErrorActionPreference = "Stop"

[CmdletBinding(DefaultParameterSetName = "Single")]
param(
  [Parameter(Mandatory = $true, ParameterSetName = "Single")]
  [string]$CommonsFileTitle,

  [Parameter(Mandatory = $true, ParameterSetName = "Single")]
  [string]$OutputPath,

  [Parameter(ParameterSetName = "Single")]
  [Parameter(ParameterSetName = "Manifest")]
  [int]$Width = 1600,

  [Parameter(Mandatory = $true, ParameterSetName = "Manifest")]
  [string]$ManifestPath,

  [Parameter(ParameterSetName = "Manifest")]
  [switch]$Force
)

function Get-CommonsImageInfo {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Title,

    [int]$RequestedWidth = 1600
  )

  $normalizedTitle = $Title -replace " ", "_"
  $url =
    "https://commons.wikimedia.org/w/api.php" +
    "?action=query&format=json&origin=*" +
    "&titles=$([uri]::EscapeDataString($normalizedTitle))" +
    "&prop=imageinfo&iiprop=url|timestamp|extmetadata&iiurlwidth=$RequestedWidth"

  return Invoke-RestMethod -Uri $url -Method Get
}

function Save-CommonsImage {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Title,

    [Parameter(Mandatory = $true)]
    [string]$DestinationPath,

    [int]$RequestedWidth = 1600
  )

  $outputFullPath = [System.IO.Path]::GetFullPath((Join-Path $PWD $DestinationPath))
  $outputDirectory = Split-Path -Parent $outputFullPath

  if (-not (Test-Path -LiteralPath $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory | Out-Null
  }

  $response = Get-CommonsImageInfo -Title $Title -RequestedWidth $RequestedWidth
  $page = @($response.query.pages.PSObject.Properties | ForEach-Object { $_.Value }) | Select-Object -First 1
  $imageInfo = $page.imageinfo[0]

  if (-not $imageInfo) {
    throw "No image info returned for '$Title'."
  }

  $downloadUrl = if ($imageInfo.thumburl) { $imageInfo.thumburl } else { $imageInfo.url }

  if (-not $downloadUrl) {
    throw "No download URL returned for '$Title'."
  }

  Invoke-WebRequest -Uri $downloadUrl -OutFile $outputFullPath
  Write-Host "Saved $Title to $outputFullPath"
}

if ($PSCmdlet.ParameterSetName -eq "Single") {
  Save-CommonsImage -Title $CommonsFileTitle -DestinationPath $OutputPath -RequestedWidth $Width
  return
}

$manifestFullPath = [System.IO.Path]::GetFullPath((Join-Path $PWD $ManifestPath))
if (-not (Test-Path -LiteralPath $manifestFullPath)) {
  throw "Manifest not found: $manifestFullPath"
}

$manifest = Get-Content -Path $manifestFullPath -Raw | ConvertFrom-Json

foreach ($entry in $manifest) {
  $title = [string]$entry.commonsFileTitle
  $destination = [string]$entry.outputPath
  $requestedWidth = if ($entry.width) { [int]$entry.width } else { $Width }

  if ([string]::IsNullOrWhiteSpace($title) -or [string]::IsNullOrWhiteSpace($destination)) {
    continue
  }

  $destinationFullPath = [System.IO.Path]::GetFullPath((Join-Path $PWD $destination))
  if ((Test-Path -LiteralPath $destinationFullPath) -and -not $Force) {
    Write-Host "Skipping existing file $destinationFullPath"
    continue
  }

  Save-CommonsImage -Title $title -DestinationPath $destination -RequestedWidth $requestedWidth
}
