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
    update() {
        let sin_x = Math.sin(this.rx)
        let cos_x = Math.cos(this.rx)
        let sin_y = Math.sin(this.ry)
        let cos_y = Math.cos(this.ry)
        this.x = this.thing.x - this.radius * cos_x * sin_y
        this.y = this.thing.y + this.radius * sin_x
        this.z = this.thing.z + this.radius * cos_x * cos_y
    }
}
