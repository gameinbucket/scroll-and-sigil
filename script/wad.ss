import
  strings

global
  wadSounds          = map[string]js.value
  wadImageData       = map[string]map[string]render.sprite
  wadDirectionPrefix = string[] "front-",
    "front-side-", "side-", "back-side-", "back-",

func wadRead graphics.renderSystem g js.value gl string data
  wad = parseRead data
  resources = wad["resources"]:map[string]object
  shaders = resources["shaders"]:map[string]object
  for i = 0 i < (len shaders) i++
	  name = shaders[i]:string
	  g.makeProgram gl name
  for i = 0 i < (len textures) i++
	  name = textures[i]:string
	  if name = "sky"
	    echo "todo"
	    g.makeImage gl name opengl.repeat
	  else
	    g.makeImage gl name opengl.clampToEdge