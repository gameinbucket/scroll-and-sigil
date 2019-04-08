class Camera {
    constructor(thing, radius, rx, ry) {
        this.thing = thing
        this.radius = radius
        this.x = 0
        this.y = 0
        this.z = 0
        this.rx = rx
        this.ry = ry
        this.update()
    }
    update() {
        if (Input.KeyDown("ArrowLeft")) {
            this.ry -= 0.05
            if (this.ry < 0)
                this.ry += Tau
        }

        if (Input.KeyDown("ArrowRight")) {
            this.ry += 0.05
            if (this.ry >= Tau)
                this.ry -= Tau
        }

        if (this.rx > -0.25 && Input.KeyDown("ArrowUp"))
            this.rx -= 0.05

        if (this.rx < 0.25 && Input.KeyDown("ArrowDown"))
            this.rx += 0.05

        let sinX = Math.sin(this.rx)
        let cosX = Math.cos(this.rx)
        let sinY = Math.sin(this.ry)
        let cosY = Math.cos(this.ry)

        let thing = this.thing

        this.x = thing.X - this.radius * cosX * sinY
        this.y = thing.Y + this.radius * sinX + thing.Height
        this.z = thing.Z + this.radius * cosX * cosY
    }
}
