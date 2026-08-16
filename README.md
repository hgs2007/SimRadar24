# VATSIM Scope

A clean, map-first VATSIM flight tracker prototype with a lightweight always-on Node backend.

## What it does

- Loads live pilot data from the public VATSIM data feed
- Plots flights on an interactive map
- Lets you search by callsign, route, pilot name, airline, or aircraft type
- Shows a rich detail panel for the selected flight
- Attempts to load an aircraft-related image from Wikimedia based on airline and type

## Local run

### Preferred: always-on backend

This version now includes a small Node server that:
- polls the VATSIM feed every 15 seconds
- caches the latest snapshot in memory
- serves the frontend and a local API

1. Install Node.js 18+
2. Open PowerShell in this folder
3. Run:

```powershell
npm start
```

4. Open [http://localhost:8080](http://localhost:8080)

Useful backend endpoints:
- [http://localhost:8080/api/vatsim-data](http://localhost:8080/api/vatsim-data)
- [http://localhost:8080/api/health](http://localhost:8080/api/health)
- [http://localhost:8080/api/events](http://localhost:8080/api/events) (Server-Sent Events stream)

The frontend now:
- uses `/api/vatsim-data` instead of talking to VATSIM directly
- subscribes to `/api/events`
- falls back to client polling only if the event stream is unavailable

### Fallback: static-only preview

If you only want to preview the frontend without the backend, you can still use:

```powershell
.\serve.ps1
```

## Notes

- Backend poll source: `https://data.vatsim.net/v3/vatsim-data.json`
- Backend poll interval: 15 seconds
- Aircraft photos are best-effort and not guaranteed to match the exact livery for every flight
- The frontend now prefers `/api/vatsim-data` when served over HTTP, and falls back to the public VATSIM feed only in static/file scenarios
- For a true always-on deployment, host `server.js` on an always-running platform such as Render, Fly.io, Railway, or EC2
