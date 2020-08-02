# scroll and sigil

- [website](https://scrollandsigil.com)

# development planning

## editor

- built into game binary for easy user content creation, including on consoles
- usable with keyboard (with or without mouse), mouse (optional), and controller
- top down 2D view for map editing
- toggelable 3D first person camera view, and sloped view
- window for editing
  - textures
  - models
  - behaviour / parameter scripts
- no draggable popups (bad for controller input)
- cloud synchronizing game packs for cross-platform use
- minecraft like block editing mode (prefab squares to make placement easier)

### controls

- WASD / Arrow Keys / Controller Stick for moving main editor window (when in focus)

### diagram

```
+------------------+--------------------------------------+
| Open Save New Exit                                      |
+------------------+--------------------------------------+
|                  |                                      |
|                  |                                      |
|     top panel    |                                      |
|                  |                                      |
|------------------|         main editing window          |
|                  |                                      |
|                  |                                      |
|                  |                                      |
|   bottom panel   |                                      |
+                  +--------------------------------------+
|                  |                                      |
|                  |         secondary editing window     |
|                  |                                      |
|                  |                                      |
+------------------+--------------------------------------+
```

### texture editing

```
+------------------+--------------------------------------+
| Open Save New Exit                                      |
+------------------+--------------------------------------+
|                  |                                      |
|                  |                                      |
|     top panel    |                                      |
|                  |                                      |
|------------------|            dispay texture            |
|                  |                                      |
|                  |                                      |
|                  |                                      |
|   bottom panel   |                                      |
+                  |                                      |
|                  |                                      |
|                  |                                      |
|                  |                                      |
|                  |                                      |
+------------------+--------------------------------------+
```

## vulkan

- dynamic `render_buffer` updates
- shared descriptor sets for uniform buffer
- deferred offscreen rendering with `frame_buffers`

## rendering

- diffuse + specular textures
- shadow mapping

## phyics

- rigid bodies

## scripting system

- runnable within game loop
- conditionals, updating game objects
