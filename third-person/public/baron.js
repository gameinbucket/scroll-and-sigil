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
    constructor(world, nid, x, y, z) {
        super()
        this.World = world
        this.UID = "baron"
        this.SID = "baron"
        this.NID = nid
        this.Update = this.BaronUpdate

        Baron.SpriteBuilder(this.SID, BaronAnimationIdle, "idle")
        Baron.SpriteBuilder(this.SID, BaronAnimationWalk, "walk")
        Baron.SpriteBuilder(this.SID, BaronAnimationMelee, "melee")
        Baron.SpriteBuilder(this.SID, BaronAnimationMissile, "missile")
        Baron.SpriteBuilder(this.SID, BaronAnimationDeath, "death")

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
        this.Status = BaronSleep
        world.AddThing(this)
        this.BlockBorders()
        this.AddToBlocks()
    }
    static SpriteBuilder(sid, array, name) {
        let animation = []
        let animationData = SpriteAnimations[sid][name]
        for (let a in animationData) {
            let name = animationData[a]
            let slice = new Array(5)
            for (let d in DirectionPrefix) {
                let direction = DirectionPrefix[d]
                let fullname = direction + name
                let sprite = SpriteData[sid]["front-" + name]
                if (fullname in SpriteData[sid]) {
                    sprite = SpriteData[sid][fullname]
                }
                slice[d] = sprite
            }
            animation.push(slice)
        }
        array.push.apply(array, animation)
    }
    NetUpdateState(status) {
        switch (status) {
            case BaronDead:
                this.Animation = BaronAnimationDeath
                break
            case BaronMelee:
                this.Animation = BaronAnimationMelee
                Sounds["baron-melee"].play()
                break
            case BaronMissile:
                this.Animation = BaronAnimationMissile
                Sounds["baron-missile"].play()
                break
            case BaronChase:
                Sounds["baron-scream"].play()
                break
            default:
                this.Animation = BaronAnimationWalk
                break
        }
        this.Status = status
    }
    Damage(amount) {
        this.Health -= amount
        if (this.Health <= 0)
            Sounds["baron-death"].play()
        else
            Sounds["baron-pain"].play()
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
        }
    }
    Missile() {
        if (this.UpdateAnimation() === AnimationDone) {
            this.AnimationFrame = 0
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
