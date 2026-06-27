# The Long Walk Home

Current browser game version.

## Overview

The Long Walk Home is a single-page psychological horror text adventure built with:

- HTML
- CSS
- Vanilla JavaScript

The game runs locally in the browser with no backend and no framework.

## Core Premise

The player has just finished a long late-night shift. Instead of taking a taxi, they walk home through heavy fog. The route becomes unfamiliar, something begins following them, and the player must make choices while managing fear, phone battery, clues, and inventory.

The story uses uncertainty, isolation, exhaustion, paranoia, and subtle supernatural events rather than heavy jump scares.

## Current Endings

This version has exactly two endings.

### Good Ending: The Road Ends

Unlocked when the player reaches the final door with:

- All required clues found
- Fear below 5
- Battery above 0

Required clues:

- `FoundWorkerID`
- `ReadNewspaper`
- `SawGhost`
- `FoundLuckyCharm`

The good ending reveals that the walk is connected to an earlier death or limbo-like state. The player remembers what happened and leaves the fog.

### Bad Ending: The Long Walk

Triggered when the player:

- Makes certain dangerous choices
- Reaches the final door without all required good-ending conditions
- Lets fear or battery conditions collapse the route

The bad ending traps the player in the fog, always close to home but never arriving.

## Game State

The game tracks:

- `fear`
- `battery`
- `clues`
- `inventory`
- `settings`
- `sceneId`

### Fear

Fear ranges from 0 to 10.

Fear increases when the player investigates disturbing events, waits too long, listens to strange sounds, or chooses unsafe paths.

High fear can cause:

- Text distortion
- Hallucination-style choices
- Unreliable narration
- Greater risk of bad outcomes

### Battery

Battery starts at 15%.

Battery decreases when the player uses the phone or flashlight. Battery can be restored by taking batteries in the abandoned convenience store.

If the player needs battery for a choice but has none, the route can collapse into the bad ending.

### Clues

Clues are boolean flags used for the good ending.

Current clues:

- `FoundWorkerID`
- `ReadNewspaper`
- `SawGhost`
- `FoundLuckyCharm`

### Inventory

Inventory is shown in the status panel.

Current inventory items include:

- Worker ID
- Newspaper
- Lucky Charm

## File Structure

```text
index.html
styles.css
scenes.js
visuals.js
game.js
ui.js
audio.js
save.js
assets/
  visuals/
  custom/
```

## File Responsibilities

### `index.html`

Defines the page structure:

- Title screen
- Game screen
- Scene image area
- Story text area
- Status panel
- Choices
- Endings dialog

### `styles.css`

Controls the visual style:

- Dark horror interface
- Fog animation
- CRT scanline/flicker effect
- Responsive layout
- Scene visual frame
- High-fear text shake
- Reduced motion support

### `scenes.js`

Contains all story scenes as JavaScript scene objects.

Each scene can contain:

- `id`
- `chapter`
- `title`
- `text`
- `effects`
- `choices`
- optional `clue`
- optional `item`
- optional `ending`

### `visuals.js`

Editable file for assigning pictures or GIFs to each scene.

Put custom images in:

```text
assets/custom/
```

Then update `visuals.js`, for example:

```js
alley: "assets/custom/my-alley.gif",
streetlights: "assets/custom/streetlights.jpg",
goodEnding: "assets/custom/good-ending.png"
```

Supported formats:

- `.gif`
- `.jpg`
- `.jpeg`
- `.png`
- `.webp`
- `.avif`

Keep scene IDs on the left unchanged.

### `game.js`

Controls gameplay:

- Starts new games
- Continues saves
- Applies choice effects
- Tracks fear, battery, clues, and inventory
- Resolves good or bad ending
- Saves progress

### `ui.js`

Updates the interface:

- Scene title
- Chapter label
- Story text
- Typewriter animation
- Scene visual
- Choices
- Fear meter
- Battery meter
- Inventory list
- Endings gallery

### `audio.js`

Creates simple browser-generated ambience using the Web Audio API.

Current sound profiles include:

- Rain
- Wind
- Dragging
- Electrical buzz
- Heartbeat
- Footsteps

### `save.js`

Handles local storage:

- Autosave
- Continue
- Reset save
- Ending unlocks
- Settings

## Scene List

### Chapter 1

- `leavingWork` - Leaving Work
- `friendCall` - No Answer
- `friendCallAgain` - Busy Signal
- `taxiCancelled` - Cancelled
- `streetlights` - Streetlights
- `alley` - Alley
- `deadLine` - Dead Line

### Chapter 2

- `theFog` - The Fog
- `convenienceStore` - Abandoned Convenience Store
- `storeCharm` - Red Thread
- `storeBattery` - Borrowed Light
- `storeGhost` - Back Page
- `mainRoad` - Main Road
- `park` - Park Path
- `waiting` - Waiting
- `apartmentDistrict` - Apartment District
- `figure` - Under the Light
- `figureLight` - White Beam

### Chapter 3

- `lobby` - Lobby
- `guard` - Security Guard
- `guardTruth` - The Logbook
- `stairs` - Stairs
- `elevator` - Elevator
- `hide` - Mailboxes
- `peephole` - Peephole
- `endingCheck` - The Door

### Endings

- `goodEnding` - Good Ending: The Road Ends
- `badEnding` - Bad Ending: The Long Walk

## Current Visual Mapping

Visuals are configured in `visuals.js`.

Current default assets:

```js
leavingWork: "assets/visuals/loading-bay.gif"
friendCall: "assets/visuals/phone-call.gif"  
streetlights: "assets/visuals/streetlights.gif" 
alley: "assets/visuals/alley.gif" 
theFog: "assets/visuals/fog-road.gif"
convenienceStore: "assets/visuals/convenience-store.gif"
park: "assets/visuals/park-path.gif"
apartmentDistrict: "assets/visuals/apartment-blocks.gif"
figure: "assets/visuals/street-figure.gif"
lobby: "assets/visuals/lobby.gif"
stairs: "assets/visuals/stairs.gif"
elevator: "assets/visuals/elevator.gif"
peephole: "assets/visuals/apartment-door.gif"
goodEnding: "assets/visuals/true-ending.gif"
badEnding: "assets/visuals/taken-ending.gif"
```

Several scenes reuse the same visual when they share a location.

## Main Good Ending Route

One reliable route to the good ending:

1. Call a friend
2. Put the phone away
3. Investigate the alley
4. Take the ID
5. Take the shortcut
6. Take the charm
7. Leave the store
8. Approach the figure
9. Thank it
10. Talk to the guard
11. Ask what happened
12. Take the stairs
13. Unlock your door
14. Step through

This route gathers the needed clues, keeps fear low enough, and preserves battery.

## Local Save System

The game uses browser local storage.

Stored data includes:

- Current scene
- Fear
- Battery
- Clues
- Inventory
- Settings
- Unlocked endings

Use the title screen buttons to:

- Start a new walk
- Continue
- Reset save

## Customization Notes

To change story content:

- Edit `scenes.js`

To change images or GIFs:

- Put files in `assets/custom/`
- Edit `visuals.js`

To change visual styling:

- Edit `styles.css`

To change ending rules:

- Edit `resolveEnding()` in `game.js`

## Run Locally

If a local server is already running, open:

```text
http://127.0.0.1:5173/
```

Otherwise, from the project folder, run a simple local server such as:

```powershell
python -m http.server 5173 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:5173/
```
