class Camera {
    constructor(thing, radius, rx, ry) {
        this.thing = thing
        this.radius = radius
        this.x
        this.y
        this.z
        this.rx = rx
        this.ry = ry
        this.update()
    }
    update(interpolation) {
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
