const Sounds = {}
const ImageData = {}
const SpriteData = {}
const SpriteAlias = {}
const SpriteAnimations = {}
const DirectionPrefix = ["front-", "front-side-", "side-", "back-side-", "back-"]

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

        for (let s in sounds) {
            let name = sounds[s]
            let key = name.substring(0, name.lastIndexOf("."))
            Sounds[key] = new Audio("sounds/" + name)
        }
        for (let name in sprites) {
            let sprite = sprites[name]

            let texture = g.textures[name]
            let width = 1.0 / texture.image.width
            let height = 1.0 / texture.image.height

            ImageData[name] = {}
            SpriteData[name] = {}

            for (let frame in sprite) {
                let data = sprite[frame]
                let atlas = []
                for (let i in data)
                    atlas.push(parseInt(data[i]))
                ImageData[name][frame] = Sprite.Build(atlas, width, height)
                SpriteData[name][frame] = Sprite.Build3(atlas, width, height)
            }
        }

        for (let name in animations) {
            let animation = animations[name]
            let animation_list = animation["animations"]
            let alias = ("alias" in animation) ? animation["alias"] : null

            SpriteAlias[name] = {}
            SpriteAnimations[name] = {}

            for (let key in animation_list)
                SpriteAnimations[name][key] = animation_list[key]

            if (alias != null) {
                for (let key in alias)
                    SpriteAlias[name][key] = alias[key]
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
