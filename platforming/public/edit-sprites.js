class Sprite {
    constructor(x, y, texture_data, boxes) {
        this.x = x
        this.y = y
        this.texture_data = texture_data
        this.boxes = boxes
    }
}

class Sprites {
    static Process(atlas, textures) {
        if (textures.length === 0) return

        const limit = 256
        let sprites = []
        let x = 0
        let y = 0
        let atlas_width = 0
        let atlas_height = 0
        let json = ""

        for (let index = 0; index < textures.length; index++) {
            let texture = textures[index]
            let width = texture.width
            let height = texture.height
            let boxes = Boxes.Process(texture.data, width, height)
            let name = texture.name

            if (x + width + 1 > limit) {
                atlas_width = x - 1
                x = 0
                y = atlas_height + 1
            }

            sprites.push(Sprite.Build(x, y, texture, boxes))

            if (index > 0) json += ", "
            json += `"${name}":{"atlas":[${x}, ${y}, ${width}, ${height}], "boxes":[${Boxes.JSON(boxes)}]}`

            x += width + 1

            if (y + height > atlas_height)
                atlas_height = y + height
        }

        atlas_width = Math.max(atlas_width, x - 1)

        atlas_width = Math.pow(2, Math.ceil(Math.log(atlas_width) / Math.log(2)))
        atlas_height = Math.pow(2, Math.ceil(Math.log(atlas_height) / Math.log(2)))

        const prefix = "data:image/png;base64,"
        let canvas = Sprites.Paint(sprites, atlas_width, atlas_height)
        let url = canvas.toDataURL()
        url = url.substring(prefix.length)

        for (let index = 0; index < sprites.length; index++) {
            let sprite = sprites[index]
            Boxes.Paint(sprite.boxes, sprite.texture_data.width, sprite.texture_data.height)
        }

        return `{"name":"${atlas}", "sprites":{${json}}, "base64":"${url}"}`
    }
    static Paint(sprites, width, height) {
        let canvas = document.createElement("canvas")
        let context = canvas.getContext("2d")

        canvas.width = width
        canvas.height = height
        canvas.style.display = "block"
        canvas.style.margin = "1px"

        for (let index = 0; index < sprites.length; index++) {
            let sprite = sprites[index]
            context.drawImage(sprite.texture_data.texture, sprite.x, sprite.y)
        }

        document.body.appendChild(canvas)

        return canvas
    }
}