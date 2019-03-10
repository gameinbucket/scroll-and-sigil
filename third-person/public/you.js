class You extends Living {
    constructor(world, x, y, z) {
        super(world, "you", "skeleton", x, y, z, 0.4, 1.0)
        this.camera = null
    }
    update(world) {
        let pace = 0.1
        let input = []
        if (Input.Is("ArrowLeft")) {
            this.r -= 0.05
            input.push("tl")
        }
        if (Input.Is("ArrowRight")) {
            this.r += 0.05
            input.push("tr")
        }
        if (Input.Is("w")) {
            this.dx += Math.sin(this.r) * pace
            this.dz -= Math.cos(this.r) * pace
            input.push("mf")
        }
        if (Input.Is("s")) {
            this.dx -= Math.sin(this.r) * pace
            this.dz += Math.cos(this.r) * pace
            input.push("mb")
        }
        if (Input.Is("a")) {
            this.dx -= Math.cos(this.r) * pace
            this.dz -= Math.sin(this.r) * pace
            input.push("sl")
        }
        if (Input.Is("d")) {
            this.dx += Math.cos(this.r) * pace
            this.dz += Math.sin(this.r) * pace
            input.push("sr")
        }
        if (input.length > 0) {
            SOCKET.send(input[0])
        }
        super.update(world)
    }
}
