class Tree extends Thing {
    constructor(world, nid, x, y, z) {
        super()
        this.World = world
        this.UID = TreeUID
        this.SID = "scenery"
        this.NID = nid
        this.Sprite = SpriteData[this.SID]["dead-tree"]
        this.X = x
        this.Y = y
        this.Z = z
        this.OldX = x
        this.OldY = y
        this.OldZ = z
        this.Radius = 0.4
        this.Height = 1.0
        this.Speed = 0.1
        this.Health = 1
        world.AddThing(this)
        this.BlockBorders()
        this.AddToBlocks()
    }
    Update() {}
    Render(timeNow, interpolation, spriteBuffer, camX, camZ, camAngle) {
        let sin = camX - this.X
        let cos = camZ - this.Z
        let length = Math.sqrt(sin * sin + cos * cos)
        sin /= length
        cos /= length
        Render3.Sprite(spriteBuffer[this.SID], this.X, this.Y, this.Z, sin, cos, this.Sprite)
    }
}
