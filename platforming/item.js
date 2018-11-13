class Item extends Thing {
    constructor(world, id, x, y) {
        super(world, "item", x, y)
        this.half_width = 8
        this.height = 16
        this.sprite = this.animations[id]
    }
    update(world) {
        if (!this.ground) this.dy -= GRAVITY
        this.x += this.dx
        this.y += this.dy
        this.remove_from_blocks(world)
        this.tile_collision(world)
        this.block_borders()
        // this.thing_collision(world)
        // this.block_borders()
        this.add_to_blocks(world)
        this.dx = 0
    }
    use(_) {}
}

class Roar extends Item {
    constructor(world, x, y) {
        super(world, "roar", x, y)
        this.slot = "skill"
        this.size = 1
    }
    use(thing) {
        const min_stamina = 24
        if (!thing.ground) return
        if (thing.state !== "idle" && thing.state !== "walk") return
        if (thing.stamina < min_stamina) return
        thing.stamina_reduce = thing.stamina
        thing.stamina -= min_stamina

        SOUND["roar"].play()
        let affect = {
            strength: 1,
            time: 3600
        }
        thing.afflictions.push(affect)
    }
}

class Water extends Item {
    constructor(world, x, y) {
        super(world, "water", x, y)
        this.slot = "item"
        this.size = 1
    }
}

class Whip extends Item {
    constructor(world, x, y) {
        super(world, "whip", x, y)
        this.slot = "hand"
        this.size = 2
        this.base_damage = 18
        this.strength_multiplier = 1
        this.dexterity_multiplier = 1
        this.reach = 48
    }
}

class Helmet extends Item {
    constructor(world, x, y) {
        super(world, "helmet", x, y)
        this.slot = "head"
        this.size = 2
    }
}

class Shield extends Item {
    constructor(world, x, y) {
        super(world, "shield", x, y)
        this.slot = "hand"
        this.size = 3
    }
}

class Armor extends Item {
    constructor(world, x, y) {
        super(world, "armor", x, y)
        this.slot = "body"
        this.size = 5
    }
}

class Food extends Item {
    constructor(world, x, y) {
        super(world, "food", x, y)
        this.slot = "item"
        this.size = 1
    }
}

class Musket extends Item {
    constructor(world, x, y) {
        super(world, "musket", x, y)
        this.slot = "hand"
        this.size = 3
    }
}

class MusketBall extends Item {
    constructor(world, x, y) {
        super(world, "musket-ball", x, y)
        this.slot = "ammo"
        this.size = 0
    }
}

class Gloves extends Item {
    constructor(world, x, y) {
        super(world, "gloves", x, y)
        this.slot = "arms"
        this.size = 1
    }
}

class Boots extends Item {
    constructor(world, x, y) {
        super(world, "boots", x, y)
        this.slot = "legs"
        this.size = 1
    }
}