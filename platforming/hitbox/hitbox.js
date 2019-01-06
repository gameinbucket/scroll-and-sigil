let canvas = document.getElementById("picture")
let context = canvas.getContext("2d")

canvas.width = 64
canvas.height = 64

context.fillStyle = "rgb(0, 0, 0)"
context.fillRect(0, 0, canvas.width, canvas.height)

let uploader = document.getElementById("upload")
uploader.addEventListener("change", upload, false)

function upload(e) {
    let reader = new FileReader()
    reader.onload = function (event) {
        let texture = new Image()
        texture.onload = function () {
            canvas.width = texture.width
            canvas.height = texture.height
            context.drawImage(texture, 0, 0)
            let data = context.getImageData(0, 0, texture.width, texture.height)
            process(data.data, texture.width, texture.height)
        }
        texture.src = event.target.result
    }
    reader.readAsDataURL(e.target.files[0])
}

class Box {
    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }
}

function process(data, width, height) {
    let boxes = []
    let mask = []

    for (let i = 0; i < data.length; i += 4)
        mask.push(false)

    let bx = 0
    let by = 0
    let bw = 0
    let bh = 0

    for (let i = 0; i < data.length; i += 4) {
        let red = data[i]
        let green = data[i + 1]
        let blue = data[i + 2]
        let alpha = data[i + 3]

        boxes.push(new Box(bx, by, bw, bh))
    }

}