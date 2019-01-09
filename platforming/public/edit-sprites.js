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

        let sprites = []
        let x = 0
        let y = 0
        let atlas_height = 0
        let json = `{"name":"${atlas}", "sprites":[`

        for (let index = 0; index < textures.length; index++) {
            let texture = textures[index]
            let width = texture.width
            let height = texture.height
            let boxes = Boxes.Process(texture.data, width, height)
            let name = texture.name

            sprites.push(new Sprite(x, y, texture, boxes))

            if (index > 0) json += ", "
            json += `{"name":"${name}", "atlas":[${x}, 0, ${width}, ${height}], "boxes":[${Boxes.JSON(boxes)}]}`

            x += width + 1

            if (height > atlas_height)
                atlas_height = height
        }

        let atlas_width = x - 1
        json += `], "width":${atlas_width}, "height":${atlas_height}}`
        console.log(json)

        Sprites.Paint(sprites, atlas_width, atlas_height)

        for (let index = 0; index < sprites.length; index++) {
            let sprite = sprites[index]
            Boxes.Paint(sprite.boxes, sprite.texture_data.width, sprite.texture_data.height)
        }
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
    }
}