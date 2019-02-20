class Affliction {
    constructor() {}
    begin() {}
    end() {}
}

class RoarAffliction {
    constructor() {
        this.time = 300
    }
    begin(thing) {
        SOUND["roar"].currentTime = 0
        SOUND["roar"].play()
        thing.strength++
        thing.dexterity--
    }
    end(thing) {
        thing.strength--
        thing.dexterity++
    }
}