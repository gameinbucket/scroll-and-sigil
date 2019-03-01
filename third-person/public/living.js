class Living extends Thing {
    constructor(world, uid, sid, x, y, z, radius, height) {
        super(world, uid, sid, x, y, z, radius, height)
        this.status = "idle"
        this.alliance = "none"
        this.speed = 2
        this.health = 0
        this.r = 0.0
    }
}
