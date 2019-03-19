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
        if (Input.Is("w")) {
            SOCKET_SEND += "mf "
        }

        if (Input.Is("s")) {
            SOCKET_SEND += "mb "
        }

        if (Input.Is("a")) {
            SOCKET_SEND += "sl "
        }

        if (Input.Is("d")) {
            SOCKET_SEND += "sr "
        }

        if (this.UpdateAnimation() === AnimationDone) {
            this.AnimationFrame = 0
        }
    }
}
