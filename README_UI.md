# The Long Walk Home UI Customization Guide

## Architecture

The game now separates story, configuration, managers, UI, and saves:

- `scenes.js` contains narrative and choice data.
- `config/assets.js` maps scene IDs to media, ambience, SFX, and overlays.
- `config/audio.js` stores generated audio profiles and volume defaults.
- `config/theme.js` applies visual settings such as fog, CRT, animation, and font scale.
- `save.js` exposes `SaveManager`, `NotificationManager`, and the legacy-compatible `Save` API.
- `ui.js` exposes `UIManager` / `UI` and dynamically injects image or video media.
- `game.js` remains the story-flow coordinator.

## Swapping Scene Media

Edit only `config/assets.js`. Scene media priority is:

1. `video`
2. `gif`
3. `image`

Example:

```js
streetlights: {
  video: "assets/videos/streetlights.mp4",
  ambience: "dragging",
  overlays: ["fog", "rain", "crt"]
}
```

No engine code needs to change when replacing a GIF with a video.

## Adding Audio

Generated audio profiles live in `config/audio.js`. Add a key under `profiles`, then reference that key as `ambience` or `music` in `config/assets.js`.

## Save Features

The save system supports:

- Autosave whenever a non-ending scene renders.
- Manual saves from the left rail.
- Quick save and quick load.
- Slot list with load, rename, and delete.
- JSON export and import.
- Save metadata: scene, chapter, fear, battery, clues, inventory, settings, playtime, timestamp, media state, and thumbnail path.

Unlocked endings and settings are stored separately from run saves.

## Mod Folder Convention

The project includes a `mods/` folder for future overrides. A future mod loader can use:

```text
mods/<mod-name>/assets/
mods/<mod-name>/config/
```

The current implementation keeps the registry simple and stable while leaving this folder convention ready.
