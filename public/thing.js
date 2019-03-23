const Gravity = 0.01

const AnimationRate = 16

const AnimationNotDone = 0
const AnimationAlmostDone = 1
const AnimationDone = 2

const AnimationFront = 0
const AnimationFrontSide = 1
const AnimationSide = 2
const AnimationBackSide = 3
const AnimationBack = 4

const DirectionNorth = 0
const DirectionNorthEast = 1
const DirectionEast = 2
const DirectionSouthEast = 3
const DirectionSouth = 4
const DirectionSouthWest = 5
const DirectionWest = 6
const DirectionNorthWest = 7
const DirectionCount = 8
const DirectionNone = 8

const DirectionToAngle = [
    0.0 * DegToRad,
    45.0 * DegToRad,
    90.0 * DegToRad,
    135.0 * DegToRad,
    180.0 * DegToRad,
    225.0 * DegToRad,
    270.0 * DegToRad,
    315.0 * DegToRad
]

class Thing {
    constructor() {
        this.World = null
        this.UID = ""
        this.SID = ""
        this.NID = ""
        this.Animation = null
        this.AnimationMod = 0
        this.AnimationFrame = 0
        this.X = 0
        this.Y = 0
        this.Z = 0
        this.Angle = 0
        this.DX = 0
        this.DY = 0
        this.DZ = 0
        this.OX = 0
        this.OY = 0
        this.OZ = 0
        this.MinBX = 0
        this.MinBY = 0
        this.MinBZ = 0
        this.MaxBX = 0
        this.MaxBY = 0
        this.MaxBZ = 0
        this.Ground = false
        this.Radius = 0
        this.Height = 0
        this.Speed = 0
        this.Health = 0
    }
    static LoadNewThing(world, uid, nid, x, y, z) {
        switch (uid) {
            case "you":
                return new You(world, nid, x, y, z)
            case "baron":
                return new Baron(world, nid, x, y, z)
            case "tree":
                return new Tree(world, nid, x, y, z)
        }
    }
    Save(x, y, z) {
        return "{u:" + this.UID + ",x:" + (this.X - x) + ",y:" + (this.Y - y) + ",z:" + (this.Z - z) + "}"
    }
    BlockBorders() {
        this.MinBX = Math.floor((this.X - this.Radius) * InverseBlockSize)
        this.MinBY = Math.floor(this.Y * InverseBlockSize)
        this.MinBZ = Math.floor((this.Z - this.Radius) * InverseBlockSize)
        this.MaxBX = Math.floor((this.X + this.Radius) * InverseBlockSize)
        this.MaxBY = Math.floor((this.Y + this.Height) * InverseBlockSize)
        this.MaxBZ = Math.floor((this.Z + this.Radius) * InverseBlockSize)
    }
    AddToBlocks() {
        for (let gx = this.MinBX; gx <= this.MaxBX; gx++) {
            for (let gy = this.MinBY; gy <= this.MaxBY; gy++) {
                for (let gz = this.MinBZ; gz <= this.MaxBZ; gz++) {
                    this.World.GetBlock(gx, gy, gz).AddThing(this)
                }
            }
        }
    }
    RemoveFromBlocks() {
        for (let gx = this.MinBX; gx <= this.MaxBX; gx++) {
            for (let gy = this.MinBY; gy <= this.MaxBY; gy++) {
                for (let gz = this.MinBZ; gz <= this.MaxBZ; gz++) {
                    this.World.GetBlock(gx, gy, gz).RemoveThing(this)
                }
            }
        }
    }
    UpdateAnimation() {
        this.AnimationMod++
        if (this.AnimationMod === AnimationRate) {
            this.AnimationMod = 0
            this.AnimationFrame++
            let len = this.Animation.length
            if (this.AnimationFrame === len - 1)
                return AnimationAlmostDone
            else if (this.AnimationFrame === len)
                return AnimationDone
        }
        return AnimationNotDone
    }
    NetUpdateState(_) {}
    TerrainCollisionY(world) {
        if (this.DY < 0) {
            let gx = Math.floor(this.X)
            let gy = Math.floor(this.Y)
            let gz = Math.floor(this.Z)
            let bx = Math.floor(gx * InverseBlockSize)
            let by = Math.floor(gy * InverseBlockSize)
            let bz = Math.floor(gz * InverseBlockSize)
            let tx = gx - bx * BlockSize
            let ty = gy - by * BlockSize
            let tz = gz - bz * BlockSize

            let tile = world.GetTileType(bx, by, bz, tx, ty, tz)
            if (TileClosed[tile]) {
                this.Y = gy + 1
                this.Ground = true
                this.DY = 0
            }
        }
    }
    Resolve(b) {
        let square = this.Radius + b.Radius
        if (Math.abs(this.X - b.X) > square || Math.abs(this.Z - b.Z) > square)
            return
        if (Math.abs(this.OX - b.X) > Math.abs(this.OZ - b.Z)) {
            if (this.OX - b.X < 0) this.X = b.X - square
            else this.X = b.X + square
            this.DX = 0.0
        } else {
            if (this.OZ - b.Z < 0) this.Z = b.Z - square
            else this.Z = b.Z + square
            this.DZ = 0.0
        }
    }
    Overlap(b) {
        let square = this.Radius + b.Radius
        return Math.abs(this.X - b.X) <= square && Math.abs(this.Z - b.Z) <= square
    }
    Damage(_) {}
    Integrate() {
        // OX and snapshot need to be different things
        // this.OX = this.X
        // this.OY = this.Y
        // this.OZ = this.Z

        // if (this.DX != 0.0 || this.DZ != 0.0) {
        //     this.X += this.DX
        //     this.Z += this.DZ

        //     let collided = []
        //     let searched = new Set()

        //     this.RemoveFromBlocks(world)

        //     for (let gx = this.MinBX; gx <= this.MaxBX; gx++) {
        //         for (let gy = this.MinBY; gy <= this.MaxBY; gy++) {
        //             for (let gz = this.MinBZ; gz <= this.MaxBZ; gz++) {
        //                 let block = world.GetBlock(gx, gy, gz)
        //                 for (let t = 0; t < block.thingCount; t++) {
        //                     let thing = block.things[t]
        //                     if (searched.has(thing)) continue
        //                     searched.add(thing)
        //                     if (this.Overlap(thing)) collided.push(thing)
        //                 }
        //             }
        //         }
        //     }

        //     while (collided.length > 0) {
        //         let closest = null
        //         let manhattan = Number.MAX_VALUE
        //         for (let i = 0; i < collided.length; i++) {
        //             let thing = collided[i]
        //             let dist = Math.abs(this.OX - thing.X) + Math.abs(this.OZ - thing.Z)
        //             if (dist < manhattan) {
        //                 manhattan = dist
        //                 closest = thing
        //             }
        //         }
        //         this.Resolve(closest)
        //         collided.splice(closest)
        //     }

        //     this.BlockBorders()
        //     this.AddToBlocks(world)

        //     this.DX = 0.0
        //     this.DZ = 0.0
        // }

        // if (!this.Ground || this.DY != 0.0) {
        //     this.DY -= GRAVITY
        //     this.Y += this.DY
        //     this.TerrainCollisionY(world)

        //     this.RemoveFromBlocks(world)
        //     this.BlockBorders()
        //     this.AddToBlocks(world)
        // }
    }
    Render(interpolation, spriteBuffer, camX, camZ, camAngle) {
        let vx = this.OX + interpolation * (this.X - this.OX)
        let vy = this.OY + interpolation * (this.Y - this.OY)
        let vz = this.OZ + interpolation * (this.Z - this.OZ)

        let sin = camX - vx
        let cos = camZ - vz
        let length = Math.sqrt(sin * sin + cos * cos)
        sin /= length
        cos /= length

        let angle = camAngle - this.Angle
        if (angle < 0) angle += Tau

        let direction
        let mirror

        const AngleA = 337.5 * DegToRad
        const AngleB = 292.5 * DegToRad
        const AngleC = 247.5 * DegToRad
        const AngleD = 202.5 * DegToRad
        const AngleE = 157.5 * DegToRad
        const AngleF = 112.5 * DegToRad
        const AngleG = 67.5 * DegToRad
        const AngleH = 22.5 * DegToRad

        if (angle > AngleA) {
            direction = AnimationFront
            mirror = false
        } else if (angle > AngleB) {
            direction = AnimationFrontSide
            mirror = false
        } else if (angle > AngleC) {
            direction = AnimationSide
            mirror = false
        } else if (angle > AngleD) {
            direction = AnimationBackSide
            mirror = false
        } else if (angle > AngleE) {
            direction = AnimationBack
            mirror = false
        } else if (angle > AngleF) {
            direction = AnimationBackSide
            mirror = true
        } else if (angle > AngleG) {
            direction = AnimationSide
            mirror = true
        } else if (angle > AngleH) {
            direction = AnimationFrontSide
            mirror = true
        } else {
            direction = AnimationFront
            mirror = false
        }

        let sprite = this.Animation[this.AnimationFrame][direction]

        if (mirror)
            Render3.MirrorSprite(spriteBuffer[this.SID], vx, vy, vz, sin, cos, sprite)
        else
            Render3.Sprite(spriteBuffer[this.SID], vx, vy, vz, sin, cos, sprite)
    }
}
