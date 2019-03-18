class You extends Living {
    constructor(world, nid, x, y, z) {
        super(world, "you", "baron", nid, x, y, z, 0.4, 1.0)
        this.camera = null
    }
    update(world) {
        let pace = 0.1

        if (Input.Is("ArrowLeft")) {
            // this.Angle += 0.05
            // SOCKET_SEND += "tl "
        }
        if (Input.Is("ArrowRight")) {
            // this.Angle -= 0.05
            // SOCKET_SEND += "tr "
        }
        if (Input.Is("w")) {
            // this.dx += Math.sin(this.Angle) * pace
            // this.dz -= Math.cos(this.Angle) * pace
            SOCKET_SEND += "mf "
        }
        if (Input.Is("s")) {
            // this.dx -= Math.sin(this.Angle) * pace
            // this.dz += Math.cos(this.Angle) * pace
            SOCKET_SEND += "mb "
        }
        if (Input.Is("a")) {
            // this.dx -= Math.cos(this.Angle) * pace
            // this.dz -= Math.sin(this.Angle) * pace
            SOCKET_SEND += "sl "
        }
        if (Input.Is("d")) {
            // this.dx += Math.cos(this.Angle) * pace
            // this.dz += Math.sin(this.Angle) * pace
            SOCKET_SEND += "sr "
        }

        super.update(world)
    }
}
