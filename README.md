# VATSIM Scope

A clean, map-first VATSIM flight tracker prototype built as a static frontend.

## What it does

- Loads live pilot data from the public VATSIM data feed
- Plots flights on an interactive map
- Lets you search by callsign, route, pilot name, airline, or aircraft type
- Shows a rich detail panel for the selected flight
- Attempts to load an aircraft-related image from Wikimedia based on airline and type

## Local run

This machine does not currently have Node.js or Python installed, so the repo includes a tiny PowerShell static server.

1. Open PowerShell in this folder
2. Run:

```powershell
.\serve.ps1
```

3. Open [http://localhost:8080](http://localhost:8080)

If your PowerShell execution policy blocks the script, run:

```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```

## Notes

- Data source: `https://data.vatsim.net/v3/vatsim-data.json`
- Refresh interval: 15 seconds
- Aircraft photos are best-effort and not guaranteed to match the exact livery for every flight
- This is a frontend prototype, so there is no server-side caching, rate limiting, or image licensing layer yet
