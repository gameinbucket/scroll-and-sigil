const SOUND = {}
const SPRITE_DATA = {}
const SPRITE_DATA_3D = {}
const SPRITE_ALIAS = {}
const SPRITE_ANIMATIONS = {}

class Wad {
    static async Load(g, gl, string) {
        let wad = Parser.read(string)

        console.log(wad)

        let resources = wad["resources"]
        let sprites = wad["sprites"]
        let animations = wad["animations"]
        let tiles = wad["tiles"]
        let shaders = resources["shaders"]
        let textures = resources["images"]
        let sounds = resources["sounds"]

        let promises = []

        for (let index = 0; index < shaders.length; index++)
            promises.push(g.make_program(gl, shaders[index]))

        for (let index = 0; index < textures.length; index++)
            promises.push(g.make_image(gl, textures[index], gl.CLAMP_TO_EDGE))

        await Promise.all(promises)

        for (let key in sounds)
            SOUND[key] = new Audio("sounds/" + sounds[key])

        for (let name in sprites) {
            let sprite = sprites[name]

            let texture = g.textures[name]
            let width = 1.0 / texture.image.width
            let height = 1.0 / texture.image.height

            SPRITE_DATA[name] = {}
            SPRITE_DATA_3D[name] = {}

            for (let frame in sprite) {
                let data = sprite[frame]
                let atlas = []
                for (let i in data)
                    atlas.push(parseInt(data[i]))
                SPRITE_DATA[name][frame] = Sprite.Build(atlas, width, height)
                SPRITE_DATA_3D[name][frame] = Sprite.Build3(atlas, width, height)
            }
        }

        for (let name in animations) {
            let animation = animations[name]
            let animation_list = animation["animations"]
            let alias = ("alias" in animation) ? animation["alias"] : null

            SPRITE_ALIAS[name] = {}
            SPRITE_ANIMATIONS[name] = {}

            for (let key in animation_list)
                SPRITE_ANIMATIONS[name][key] = animation_list[key]

            if (alias != null) {
                for (let key in alias)
                    SPRITE_ALIAS[name][key] = alias[key]
            }
        }

        TILE_TEXTURE.push(null)
        TILE_CLOSED.push(false)
        let tile_sprites = sprites["tiles"]
        let texture = g.textures["tiles"]
        let width = 1.0 / texture.image.width
        let height = 1.0 / texture.image.height
        for (let name in tile_sprites) {
            let data = tile_sprites[name]
            let x = parseInt(data[0])
            let y = parseInt(data[1])
            let w = parseInt(data[2])
            let h = parseInt(data[3])
            TILE_TEXTURE.push(Sprite.Simple(x, y, w, h, width, height))
            TILE_CLOSED.push(tiles[name]["closed"] === "true")
        }
    }
}
