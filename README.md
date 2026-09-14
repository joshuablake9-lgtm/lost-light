# Lost Light

A Game Boy Color-inspired browser RPG set on the Lantern Coast.

## Current playable slice

- Title screen and opening narration
- Explore the Lost Light Inn at 160×144 internal resolution
- Keyboard movement and collision
- NPC conversations
- Five mentor interactions
- Choose a starting class: Fighter, Ranger, Rogue, Cleric, or Wizard
- Local browser save

## Play locally

Serve the repository with any static HTTP server, then open `index.html`.

```bash
npx serve .
```

Controls:

- Arrow keys / WASD: move
- Z / Enter / Space: interact and confirm
- X / Escape: cancel
- R: erase the local save from the title screen

## Story

On the morning he reaches adulthood, an orphan raised by the village of Dunmere begins the day at the Lost Light Inn. Before nightfall, the Ashfang Warband will attack, setting him on a path toward Blackstone Keep and the wizard Malveris.

## Development

The prototype uses Phaser 3.90 from the official CDN and procedural placeholder pixel art. Production artwork and audio will replace the placeholders as development continues.
