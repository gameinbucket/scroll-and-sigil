class Box {
    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }
    inside(x, y, width, height) {
        return this.x >= x && this.y >= y && this.x + this.width <= x + width && this.y + this.height <= y + height
    }
}

class Boxes {
    static Process(data, width, height) {

        let mask = []
        let color = []
        for (let x = 0; x < width; x++) {
            let mask_slice = []
            let color_slice = []
            for (let y = 0; y < height; y++) {
                mask_slice.push(false)
                let i = (x + y * width) * 4
                let alpha = data[i + 3]
                color_slice.push(alpha > 0)
            }
            mask.push(mask_slice)
            color.push(color_slice)
        }

        let boxes = []
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let box = Boxes.NextBox(color, mask, x, y, width, height)
                if (box === null) continue
                boxes.push(box)
                x += box.width
            }
        }

        Boxes.Reduce(color, width, height, boxes)

        return boxes
    }
    static NextBox(color, mask, x, y, width, height) {

        if (!color[x][y] || mask[x][y]) return null

        let w = 1
        let h = 0

        while (Boxes.Valid(x + w, y, width, height) && !mask[x + w][y]) {
            if (color[x + w][y]) w++
            else if (Boxes.Valid(x + w + 1, y, width, height) && !mask[x + w + 1][y] && color[x + w + 1][y]) w += 2
            else break
        }

        loop: while (true) {
            h++
            for (let pos = 0; pos < w; pos++) {
                if (Boxes.Valid(x + pos, y + h, width, height) && !mask[x + pos][y + h]) {
                    if (color[x + pos][y + h]) continue
                    else if (Boxes.Valid(x + pos, y + h + 1, width, height) && !mask[x + pos][y + h + 1] && color[x + pos][y + h + 1]) continue
                    else if (Boxes.Valid(x + pos - 1, y + h, width, height) && Boxes.Valid(x + pos + 1, y + h, width, height) && color[x + pos - 1][y + h] && color[x + pos + 1][y + h])
                        continue
                }
                break loop
            }
        }

        for (let i = 0; i < w; i++)
            for (let j = 0; j < h; j++)
                mask[x + i][y + j] = true

        return new Box(x, y, w, h)
    }
    static Valid(x, y, width, height) {
        if (x < 0 || x >= width) return false
        else if (y < 0 || y >= height) return false
        return true
    }
    static Reduce(color, width, height, boxes) {
        for (let index = 0; index < boxes.length; index++) {
            let box = boxes[index]
            let x = box.x
            let y = box.y
            let w = box.width
            let h = box.height

            loop: while (true) {
                for (let pos = 0; pos < h; pos++) {
                    if (Boxes.Valid(x + w, y + pos, width, height) && color[x + w][y + pos]) continue
                    break loop
                }
                w++
            }

            loop: while (true) {
                for (let pos = 0; pos < w; pos++) {
                    if (Boxes.Valid(x + pos, y + h, width, height) && color[x + pos][y + h]) continue
                    break loop
                }
                h++
            }

            if (w === box.width && h === box.height) continue

            for (let jindex = 0; jindex < boxes.length; jindex++) {
                if (index === jindex) continue
                let other = boxes[jindex]
                if (other.inside(x, y, w, h)) {
                    //boxes.splice(jindex, 1)
                    //jindex--
                }
            }

            //box.width = w
            //box.height = h
        }
    }
    static JSON(boxes) {
        let json = ""
        for (let index = 0; index < boxes.length; index++) {
            let box = boxes[index]
            if (index > 0) json += ", "
            json += `[${box.x}, ${box.y}, ${box.width}, ${box.height}]`
        }
        return json
    }
    static Paint(boxes, width, height) {
        let canvas = document.createElement("canvas")
        let context = canvas.getContext("2d")

        canvas.width = width
        canvas.height = height
        canvas.style.margin = "1px"

        for (let index = 0; index < boxes.length; index++) {
            let box = boxes[index]

            let red = 200 + Math.floor(Math.random() * 55)
            let green = 100 + Math.floor(Math.random() * 100)

            context.fillStyle = `rgb(${red}, ${green}, ${red})`
            context.fillRect(box.x, box.y, box.width, box.height)
        }

        document.body.appendChild(canvas)
    }
}