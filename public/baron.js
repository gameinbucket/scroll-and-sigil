const BaronAnimationIdle = []
const BaronAnimationWalk = []
const BaronAnimationMelee = []
const BaronAnimationMissile = []
const BaronAnimationDeath = []

const BaronSleep = 0
const BaronDead = 1
const BaronLook = 2
const BaronChase = 3
const BaronMelee = 4
const BaronMissile = 5

class Baron extends Thing {
    constructor(world, nid, x, y, z, direction, heatlh, status) {
        super()
        this.World = world
        this.UID = BaronUID
        this.SID = "baron"
        this.NID = nid
        this.Update = this.BaronUpdate
        this.Animation = BaronAnimationWalk
        this.X = x
        this.Y = y
        this.Z = z
        this.Angle = DirectionToAngle[direction]
        this.OX = x
        this.OY = y
        this.OZ = z
        this.Radius = 0.4
        this.Height = 1.0
        this.Speed = 0.1
        this.Health = heatlh
        this.Status = status
        world.AddThing(this)
        this.BlockBorders()
        this.AddToBlocks()
    }
    NetUpdateState(status) {
        if (this.Status === status)
            return
        this.AnimationMod = 0
        this.AnimationFrame = 0
        switch (status) {
            case BaronDead:
                this.Animation = BaronAnimationDeath
                break
            case BaronMelee:
                this.Animation = BaronAnimationMelee
                let meleeSound = Sounds["baron-melee"].play()
                if (meleeSound) meleeSound.then(_ => {}).catch(_ => {})
                break
            case BaronMissile:
                this.Animation = BaronAnimationMissile
                let missileSound = Sounds["baron-missile"].play()
                if (missileSound) missileSound.then(_ => {}).catch(_ => {})
                break
            case BaronChase:
                if (Math.random() < 0.1) {
                    let screamSound = Sounds["baron-scream"].play()
                    if (screamSound) screamSound.then(_ => {}).catch(_ => {})
                }
            default:
                this.Animation = BaronAnimationWalk
                break
        }
        this.Status = status
    }
    NetUpdateHealth(health) {
        if (this.Health === health)
            return
        console.log("health was not synchronized")
        this.Health = health
    }
    Damage(amount) {
        this.Health -= amount
        if (this.Health <= 0) {
            let sound = Sounds["baron-death"].play()
            if (sound) sound.then(_ => {}).catch(_ => {})
        } else {
            let sound = Sounds["baron-pain"].play()
            if (sound) sound.then(_ => {}).catch(_ => {})
        }
    }
    Dead() {
        if (this.AnimationFrame === this.Animation.length - 1) {
            this.Update = this.EmptyUpdate
        } else {
            this.UpdateAnimation()
        }
    }
    Look() {
        if (this.UpdateAnimation() === AnimationDone) {
            this.AnimationFrame = 0
        }
    }
    Melee() {
        if (this.UpdateAnimation() === AnimationDone) {
            this.AnimationFrame = 0
            this.Animation = BaronAnimationWalk
        }
    }
    Missile() {
        if (this.UpdateAnimation() === AnimationDone) {
            this.AnimationFrame = 0
            this.Animation = BaronAnimationWalk
        }
    }
    Chase() {
        if (this.UpdateAnimation() === AnimationDone) {
            this.AnimationFrame = 0
        }
    }
    BaronUpdate() {
        switch (this.Status) {
            case BaronDead:
                this.Dead()
                break
            case BaronLook:
                this.Look()
                break
            case BaronMelee:
                this.Melee()
                break
            case BaronMissile:
                this.Missile()
                break
            case BaronChase:
                this.Chase()
                break
        }
    }
    EmptyUpdate() {}
}
