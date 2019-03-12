class Living extends Thing {
    constructor(world, uid, sid, nid, x, y, z, radius, height) {
        super(world, uid, sid, nid, x, y, z, radius, height)
        this.status = "idle"
        this.alliance = "none"
        this.speed = 2
    }
}
