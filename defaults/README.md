Local default aircraft photos used by the tracker.

Current mappings in the app:

- `AAL_A320.jpg` -> `AAL|A320`
- `BAW_A380.png` -> `BAW|A380`
- `DLH_A333.png` -> `DLH|A333`
- `DLH_A343.jpg` -> `DLH|A343`
- `DLH_A350.png` -> `DLH|A350`
- `QFA_A350.png` -> `QFA|A350`
- `QFA_A380.png` -> `QFA|A380`
- `SHT_A320.png` -> `SHT|A320`

To download a single vetted Wikimedia Commons image into this folder, use:

```powershell
.\download-commons-default.ps1 `
  -CommonsFileTitle "File:Delta Air Lines Airbus A350-900 N512DN.jpg" `
  -OutputPath ".\\defaults\\DAL_A359.jpg"
```

Then add the matching key in `app.js` under `localDefaultAircraftPhotos`.

To auto-download all manifest entries with a Commons file title:

```powershell
.\download-commons-default.ps1 -ManifestPath ".\\defaults\\commons-defaults.json"
```

To overwrite existing files too:

```powershell
.\download-commons-default.ps1 -ManifestPath ".\\defaults\\commons-defaults.json" -Force
```

Fill in missing `commonsFileTitle` values in:

- [C:\Users\shanm\Documents\New project 2\defaults\commons-defaults.json](C:\Users\shanm\Documents\New project 2\defaults\commons-defaults.json)
