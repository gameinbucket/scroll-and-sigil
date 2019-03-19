const BaronAnimationIdle = []
const BaronAnimationWalk = []
const BaronAnimationMelee = []
const BaronAnimationMissile = []
const BaronAnimationDeath = []

class Baron extends Thing {
    constructor(world, nid, x, y, z) {
        super()
        this.World = world
        this.UID = "baron"
        this.SID = "baron"
        this.NID = nid

        let animationWalk = SpriteAnimations[this.SID]["walk"]
        for (let a in animationWalk) {
            let name = animationWalk[a]
            let slice = new Array(5)
            for (let d in DirectionPrefix) {
                let direction = DirectionPrefix[d]
                let fullname = direction + name
                let sprite = SpriteData[this.SID]["front-" + name]
                if (fullname in SpriteData[this.SID]) {
                    sprite = SpriteData[this.SID][fullname]
                }
                slice[d] = sprite
            }
            BaronAnimationWalk.push(slice)
        }

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

        Sounds["baron-pain"].play()
    }
    Update() {
        if (this.UpdateAnimation() === AnimationDone) {
            this.AnimationFrame = 0
        }
    }
}
