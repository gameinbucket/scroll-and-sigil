const HumanAnimationIdle = []
const HumanAnimationWalk = []
const HumanAnimationMelee = []
const HumanAnimationMissile = []
const HumanAnimationDeath = []

const HumanDead = 0
const HumanWalk = 1
const HumanMelee = 2
const HumanMissile = 3

const InputOpNewMove = 0
const InputOpContinueMove = 1
const InputOpMissile = 2

class You extends Thing {
    constructor(world, nid, x, y, z, angle, health) {
        super()
        this.World = world
        this.UID = HumanUID
        this.SID = "baron"
        this.NID = nid
        this.Animation = HumanAnimationWalk
        this.X = x
        this.Y = y
        this.Z = z
        this.Angle = angle
        this.OX = x
        this.OY = y
        this.OZ = z
        this.Radius = 0.4
        this.Height = 1.0
        this.Speed = 0.1
        this.Health = health
        this.Status = HumanWalk
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
    constructor(world, nid, x, y, z, angle, health) {
        super(world, nid, x, y, z, angle, health)
        this.camera = null
    }
    Missile() {
        if (this.UpdateAnimation() === AnimationDone) {
            this.AnimationFrame = 0
            this.Animation = HumanAnimationWalk
            this.Status = HumanWalk
        }
    }
    Walk() {
        let direction = null
        let goal = null

        // TODO filter input into map to reduce uploaded traffic

        if (Input.Is(" ")) {
            SocketSend.setUint8(SocketSendIndex, InputOpMissile, true)
            SocketSendIndex++
            SocketSendOperations++

            this.Status = HumanMissile
            this.AnimationMod = 0
            this.AnimationFrame = 0
            this.Animation = HumanAnimationMissile

            let missileSound = Sounds["baron-missile"].play()
            if (missileSound) missileSound.then(_ => {}).catch(_ => {})

            return
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
            this.Animation = HumanAnimationIdle
        } else {
            if (goal < 0)
                goal += Tau
            else if (goal >= Tau)
                goal -= Tau

            if (this.Angle !== goal) {
                this.Angle = goal
                SocketSend.setUint8(SocketSendIndex, InputOpNewMove, true)
                SocketSendIndex++
                SocketSend.setFloat32(SocketSendIndex, this.Angle, true)
                SocketSendIndex += 4
                SocketSendOperations++
            } else {
                SocketSend.setUint8(SocketSendIndex, InputOpContinueMove, true)
                SocketSendIndex++
                SocketSendOperations++
            }

            // TODO improve
            // this.X += Math.sin(this.Angle) * this.Speed * (16.0 / 50.0)
            // this.Z -= Math.cos(this.Angle) * this.Speed * (16.0 / 50.0)

            if (this.Animation === HumanAnimationIdle)
                this.Animation = HumanAnimationWalk

            if (this.UpdateAnimation() === AnimationDone)
                this.AnimationFrame = 0
        }
    }
    Update() {
        switch (this.Status) {
            case HumanMissile:
                this.Missile()
                break
            default:
                this.Walk()
                break
        }
    }
}
