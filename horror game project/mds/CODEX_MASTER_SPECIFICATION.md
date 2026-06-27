# CODEX MASTER SPECIFICATION

## The Long Walk Home UI & Architecture Refactor

This document is the implementation specification for refactoring the
existing browser game.

## Goals

-   Preserve existing gameplay, scenes, endings, fear, battery, clues
    and inventory.
-   Separate engine, UI, assets and configuration.
-   Never hardcode asset paths.
-   Support images, GIFs, videos, ambience and sound effects per scene.
-   Allow unlimited manual saves, autosaves, quick saves, import/export
    JSON saves.
-   Modern cinematic UI matching the supplied concept art.

## Folder Structure

``` text
assets/
  images/
  gifs/
  videos/
  audio/
    ambience/
    sfx/
    music/
  ui/
config/
  assets.js
  audio.js
  theme.js
  ui.js
mods/
save/
src/
  engine/
  managers/
  ui/
styles/
```

## Managers

AssetManager, AudioManager, MediaManager, UIManager, ThemeManager,
SaveManager, SceneManager, NotificationManager.

## Asset Rules

Each scene supports: - image - gif - video - ambience - music - sfx -
overlays (fog, rain, CRT)

Media priority: 1. video 2. gif 3. image

Changing media must only require editing config/assets.js.

## UI

Left: title/menu. Center: media viewer. Right: story, status, inventory,
choices, save. Bottom: location thumbnails.

## Save System

Unlimited slots, rename, delete, overwrite, autosave, quick save/load,
JSON import/export, screenshot thumbnails.

Store: scene, chapter, fear, battery, clues, inventory, settings,
playtime, timestamp, media state.

## Settings

Master/music/SFX volume, text speed, CRT, fog, animations, fullscreen,
font size, language.

## Mod Support

mods/`<mod>`{=html}/assets and mods/`<mod>`{=html}/config override
defaults.

## Performance

Lazy loading, caching, preload next scene, unload unused assets.

## Deliverables

README_UI.md with customization guide.
