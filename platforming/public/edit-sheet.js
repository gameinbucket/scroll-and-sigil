class TextureData {
    constructor(name, texture, data, width, height) {
        this.name = name
        this.texture = texture
        this.data = data
        this.width = width
        this.height = height
    }
}

let atlas = document.getElementById("atlas")
let make = document.getElementById("make")

make.addEventListener("mousedown", process, false)

async function process() {
    let name = atlas.value
    if (name === "") return

    let data = await Network.Send("api/sprites/list", name)
    console.log(data)

    if (data === "sprite not found") return

    let sprites = data.split(", ")
    let promises = []
    let textures = []

    for (let index = 0; index < sprites.length; index++) {
        let image = new Image()
        image.src = "sprites/" + name + "/" + sprites[index]
        promises.push(new Promise(function (resolve) {
            image.onload = function () {
                let canvas = document.createElement("canvas")
                let context = canvas.getContext("2d")
                let width = image.width
                let height = image.height
                let name = image.src

                name = name.substring(name.lastIndexOf("/") + 1)
                name = name.substring(0, name.indexOf("."))
                name = name.replace(/-/g, ".")

                canvas.width = width
                canvas.height = height
                context.drawImage(image, 0, 0)

                let data = context.getImageData(0, 0, width, height)
                textures.push(new TextureData(name, image, data.data, width, height))

                resolve()
            }
        }))
    }

    await Promise.all(promises)

    let json = Sprites.Process(atlas.value, textures)
    Network.Send("api/sprites/save", json)
}