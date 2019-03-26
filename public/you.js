const YouAnimationIdle = []
const YouAnimationWalk = []

class You extends Thing {
    constructor(world, nid, x, y, z) {
        super()
        this.World = world
        this.UID = "you"
        this.SID = "baron"
        this.NID = nid
        this.Animation = BaronAnimationWalk
        this.X = x
        this.Y = y
        this.Z = z
        this.OX = x
        this.OY = y
        this.OZ = z
        this.Radius = 0.4
        this.Height = 1.0
        this.Speed = 0.1
        this.Health = 1
        world.AddThing(this)
        this.BlockBorders()
        this.AddToBlocks()
    }
    Damage(_) {
        for (let i = 0; i < 20; i++) {
            let spriteName = "blood-" + Math.floor(Math.random() * 3)

            let x = this.X + this.Radius * (1 - Math.random() * 2)
            let y = this.Y + this.Height * Math.random()
            let z = this.Z + this.Radius * (1 - Math.random() * 2)

            const spread = 0.2

            let dx = spread * (1 - Math.random() * 2)
            let dy = spread * Math.random()
            let dz = spread * (1 - Math.random() * 2)

            new Blood(this.World, x, y, z, dx, dy, dz, spriteName)
        }
    }
    Update() {}
}

class PlayerYou extends You {
    constructor(world, nid, x, y, z) {
        super(world, nid, x, y, z)
        this.camera = null
    }
    Update() {
        let direction = null
        let goal = null

        // TODO filter input into map to reduce uploaded traffic

        if (Input.Is(" ")) {
            SocketSend += "b "
        }

        if (Input.Is("w")) {
            direction = "w"
            goal = this.camera.ry
        }

        if (Input.Is("s")) {
            if (direction === null) {
                direction = "s"
                goal = this.camera.ry + Math.PI
            } else {
                direction = null
                goal = null
            }
        }

        if (Input.Is("a")) {
            if (direction === null) {
                direction = "a"
                goal = this.camera.ry - HalfPi
            } else if (direction === "w") {
                direction = "wa"
                goal -= QuarterPi
            } else if (direction === "s") {
                direction = "sa"
                goal += QuarterPi
            }
        }

        if (Input.Is("d")) {
            if (direction === null)
                goal = this.camera.ry + HalfPi
            else if (direction === "a")
                goal = null
            else if (direction === "wa")
                goal = this.camera.ry
            else if (direction === "sa")
                goal = this.camera.ry + Math.PI
            else if (direction === "w")
                goal += QuarterPi
            else if (direction === "s")
                goal -= QuarterPi
        }

        if (goal === null) {
            this.AnimationMod = 0
            this.AnimationFrame = 0
            this.Animation = BaronAnimationIdle
        } else {
            if (goal < 0)
                goal += Tau
            else if (goal >= Tau)
                goal -= Tau

            if (this.Angle !== goal) {
                this.Angle = goal
                SocketSend += "a:" + this.Angle + " "
            } else
                SocketSend += "m "

            // TODO improve
            // this.X += Math.sin(this.Angle) * this.Speed * (16.0 / 50.0)
            // this.Z -= Math.cos(this.Angle) * this.Speed * (16.0 / 50.0)

            if (this.Animation === BaronAnimationIdle)
                this.Animation = BaronAnimationWalk

            if (this.UpdateAnimation() === AnimationDone)
                this.AnimationFrame = 0
        }
    }
}
