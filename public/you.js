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
        this.camera = null
    }
    Update() {
        let moving = false

        if (Input.Is("w")) {
            SOCKET_SEND += "mf "
            moving = true
        }

        if (Input.Is("s")) {
            SOCKET_SEND += "mb "
            moving = true
        }

        if (Input.Is("a")) {
            SOCKET_SEND += "sl "
            moving = true
        }

        if (Input.Is("d")) {
            SOCKET_SEND += "sr "
            moving = true
        }

        if (moving) {
            if (this.Animation === BaronAnimationIdle)
                this.Animation = BaronAnimationWalk
            if (this.UpdateAnimation() === AnimationDone) {
                this.AnimationFrame = 0
            }
        } else {
            this.AnimationMod = 0
            this.AnimationFrame = 0
            this.Animation = BaronAnimationIdle
        }
    }
}
