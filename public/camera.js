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
    update(interpolation) {
        if (Input.Is("ArrowLeft")) {
            this.ry -= 0.05
            if (this.ry < 0)
                this.ry += Tau
        }

        if (Input.Is("ArrowRight")) {
            this.ry += 0.05
            if (this.ry >= Tau)
                this.ry -= Tau
        }

        if (this.rx > -0.25 && Input.Is("ArrowUp"))
            this.rx -= 0.05

        if (this.rx < 0.25 && Input.Is("ArrowDown"))
            this.rx += 0.05

        let sin_x = Math.sin(this.rx)
        let cos_x = Math.cos(this.rx)
        let sin_y = Math.sin(this.ry)
        let cos_y = Math.cos(this.ry)

        let vx = this.thing.OX + interpolation * (this.thing.X - this.thing.OX)
        let vy = this.thing.OY + interpolation * (this.thing.Y - this.thing.OY)
        let vz = this.thing.OZ + interpolation * (this.thing.Z - this.thing.OZ)

        this.x = vx - this.radius * cos_x * sin_y
        this.y = vy + this.radius * sin_x
        this.z = vz + this.radius * cos_x * cos_y

        this.y += this.thing.Height
    }
}
