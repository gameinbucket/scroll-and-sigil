class Missile {
    constructor() {
        this.World = null
        this.UID = ""
        this.SID = ""
        this.NID = ""
        this.Sprite = null
        this.X = 0
        this.Y = 0
        this.Z = 0
        this.DX = 0
        this.DY = 0
        this.DZ = 0
        this.MinBX = 0
        this.MinBY = 0
        this.MinBZ = 0
        this.MaxBX = 0
        this.MaxBY = 0
        this.MaxBZ = 0
        this.Radius = 0
        this.Height = 0
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
                    this.World.GetBlock(gx, gy, gz).AddMissile(this)
                }
            }
        }
    }
    RemoveFromBlocks() {
        for (let gx = this.MinBX; gx <= this.MaxBX; gx++) {
            for (let gy = this.MinBY; gy <= this.MaxBY; gy++) {
                for (let gz = this.MinBZ; gz <= this.MaxBZ; gz++) {
                    this.World.GetBlock(gx, gy, gz).RemoveMissile(this)
                }
            }
        }
    }
    Overlap(b) {
        let square = this.Radius + b.Radius
        return Math.abs(this.X - b.X) <= square && Math.abs(this.Z - b.Z) <= square
    }
    Collision() {
        let searched = new Set()
        for (let gx = this.MinBX; gx <= this.MaxBX; gx++) {
            for (let gy = this.MinBY; gy <= this.MaxBY; gy++) {
                for (let gz = this.MinBZ; gz <= this.MaxBZ; gz++) {
                    let block = this.World.GetBlock(gx, gy, gz)
                    for (let t = 0; t < block.thingCount; t++) {
                        let thing = block.things[t]
                        if (thing.Health > 0) {
                            if (searched.has(thing)) continue
                            searched.add(thing)
                            if (this.Overlap(thing)) {
                                this.Hit(thing)
                                return true
                            }
                        }
                    }
                }
            }
        }
        let minGX = Math.floor(this.X - this.Radius)
        let minGY = Math.floor(this.Y)
        let minGZ = Math.floor(this.Z - this.Radius)
        let maxGX = Math.floor(this.X + this.Radius)
        let maxGY = Math.floor(this.Y + this.Height)
        let maxGZ = Math.floor(this.Z + this.Radius)
        for (let gx = minGX; gx <= maxGX; gx++) {
            for (let gy = minGY; gy <= maxGY; gy++) {
                for (let gz = minGZ; gz <= maxGZ; gz++) {
                    let bx = Math.floor(gx * InverseBlockSize)
                    let by = Math.floor(gy * InverseBlockSize)
                    let bz = Math.floor(gz * InverseBlockSize)
                    let tx = gx - bx * BlockSize
                    let ty = gy - by * BlockSize
                    let tz = gz - bz * BlockSize
                    let tile = this.World.GetTileType(bx, by, bz, tx, ty, tz)
                    if (TileClosed[tile]) {
                        this.Hit(null)
                        return true
                    }
                }
            }
        }
        return false
    }
    Update() {
        if (this.Collision()) {
            return true
        }
        this.X += this.DX
        this.Y += this.DY
        this.Z += this.DZ
        return this.Collision()
    }
    Render(interpolation, spriteBuffer, camX, camZ, camAngle) {
        let sin = camX - this.X
        let cos = camZ - this.Z
        let length = Math.sqrt(sin * sin + cos * cos)
        sin /= length
        cos /= length
        Render3.Sprite(spriteBuffer[this.SID], this.X, this.Y, this.Z, sin, cos, this.Sprite)
    }
}

class Plasma extends Missile {
    constructor(world, nid, damage, x, y, z, dx, dy, dz) {
        super()
        this.UID = "plasma"
        this.SID = "missiles"
        this.NID = nid
        this.Sprite = SpriteData[this.SID]["baron-missile-front-1"]
        this.World = world
        this.X = x
        this.Y = y
        this.Z = z
        this.DX = dx
        this.DY = dy
        this.DZ = dz
        this.Radius = 0.4
        this.Height = 1.0
        this.Damage = damage
        this.Hit = this.PlasmaHit
        world.AddMissile(this)
        this.BlockBorders()
        this.AddToBlocks()
        return this
    }
    PlasmaHit(thing) {
        this.X -= this.DX
        this.Y -= this.DY
        this.Z -= this.DZ
        if (thing !== null)
            thing.Damage(1)
        Sounds["plasma-impact"].play()
        new PlasmaExplosion(this.World, this.X, this.Y, this.Z)
        this.RemoveFromBlocks()
    }
}
