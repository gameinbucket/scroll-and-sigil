class Living extends Thing {
    constructor(world, uid, sid, x, y, z) {
        super(world, uid, sid, x, y, z)
        this.status = "idle"
        this.alliance = "none"
        this.speed = 2
        this.health = 0
    }
}
