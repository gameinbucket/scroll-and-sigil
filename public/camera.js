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
    update(timeNow, interpolation) {
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

        let sinX = Math.sin(this.rx)
        let cosX = Math.cos(this.rx)
        let sinY = Math.sin(this.ry)
        let cosY = Math.cos(this.ry)

        let thing = this.thing
        let viewX
        let viewY
        let viewZ
        if (thing.SnapshotEnd < timeNow) {
            viewX = thing.X
            viewY = thing.Y
            viewZ = thing.Z
        } else {
            viewX = thing.OldX + interpolation * (thing.X - thing.OldX)
            viewY = thing.OldY + interpolation * (thing.Y - thing.OldY)
            viewZ = thing.OldZ + interpolation * (thing.Z - thing.OldZ)
        }

        this.x = viewX - this.radius * cosX * sinY
        this.y = viewY + this.radius * sinX
        this.z = viewZ + this.radius * cosX * cosY

        this.y += thing.Height
    }
}
