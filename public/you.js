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

        let goalA = 999.0
        let goalB = 999.0

        if (Input.Is("w")) {
            SocketSend += "mf "
            moving = true
            goalA = this.camera.ry
        }

        if (Input.Is("s")) {
            SocketSend += "mb "
            moving = true
            if (goalA === 999.0) {
                goalA = this.camera.ry + Math.PI
                if (goalA >= Tau)
                    goalA -= Tau
            } else {
                goalA = 999.0
            }
        }

        if (Input.Is("a")) {
            SocketSend += "sl "
            moving = true
            goalB = this.camera.ry - HalfPi
            if (goalB < 0)
                goalB += Tau
        }

        if (Input.Is("d")) {
            SocketSend += "sr "
            moving = true
            if (goalB === 999.0) {
                goalB = this.camera.ry + HalfPi
                if (goalB >= Tau)
                    goalB -= Tau
            } else {
                goalB = 999.0
            }
        }

        const rate = 0.03

        let goal
        if (goalA === 999.0) {
            if (goalB === 999.0) {
                goal = 999.0
            } else {
                goal = goalB
            }
        } else {
            if (goalB === 999.0) {
                goal = goalA
            } else {
                goal = (goalA + goalB) * 0.5
                if (goal >= Tau)
                    goal -= Tau
            }
        }

        if (goal != 999.0) {
            let diff = this.Angle - goal
            while (diff <= Math.PI)
                diff += Tau
            while (diff > Math.PI)
                diff -= Tau
            if (diff < 0) {
                if (-diff < rate)
                    this.Angle = goal
                else {
                    this.Angle += rate
                    if (this.Angle >= Tau)
                        this.Angle -= Tau
                }
            } else if (diff < rate)
                this.Angle = goal
            else {
                this.Angle -= rate
                if (this.Angle < 0)
                    this.Angle += Tau
            }
            SocketSend += "a:" + this.Angle + " "
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
