class Menu {
    constructor(thing) {
        this.thing = thing

        SOUND["open.inventory"].currentTime = 0
        SOUND["open.inventory"].play()

        this.menu_overview = 0
        this.menu_inventory = 1

        this.screen = this.menu_inventory // this.menu_overview
        this.select_index = 0
        this.select_lim = this.thing.inventory.length // 2
        this.sticky_left = true
        this.sticky_right = true
        this.sticky_enter = true
        this.sticky_back = true
    }
    select() {
        if (Input.Is("ArrowLeft")) {
            if (this.sticky_left) {
                SOUND["menu.select"].currentTime = 0
                SOUND["menu.select"].play()
                if (this.select_index > 0)
                    this.select_index--
                this.sticky_left = false
            }
        } else this.sticky_left = true

        if (Input.Is("ArrowRight")) {
            if (this.sticky_right) {
                SOUND["menu.select"].currentTime = 0
                SOUND["menu.select"].play()
                if (this.select_index < this.select_lim - 1)
                    this.select_index++
                this.sticky_right = false
            }
        } else this.sticky_right = true

        if (Input.Is("Enter")) {
            if (this.sticky_enter) {
                switch (this.screen) {
                    case this.menu_overview:
                        this.screen = this.menu_inventory
                        this.select_index = 0
                        this.select_lim = this.thing.inventory.length
                        break
                    case this.menu_inventory:
                        let item = this.thing.inventory[this.select_index]
                        switch (item.slot) {
                            case "hand":
                                this.thing.hand = item
                                break
                            case "head":
                                this.thing.head = item
                                break
                            case "body":
                                this.thing.body = item
                                break
                            case "item":
                                this.thing.item = item
                                break
                            case "skill":
                                this.thing.skill = item
                                break
                        }
                        SOUND["equip"].currentTime = 0
                        SOUND["equip"].play()
                }
                this.sticky_enter = false
            }
        } else this.sticky_enter = true

        if (Input.Is("Delete")) {
            if (this.sticky_back) {
                switch (this.screen) {
                    case this.menu_inventory:
                        this.screen = this.menu_overview
                        this.select_index = 0
                        this.select_lim = 2
                        break
                }
                this.sticky_back = false
            }
        } else this.sticky_back = true
    }
    render(g, gl, frame, generic, generic2) {
        generic.zero()
        generic2.zero()

        switch (this.screen) {
            case this.menu_overview:
                {
                    let frame_half_width = frame.width * 0.5
                    let frame_half_height = frame.height * 0.5
                    let columns = 2
                    let half_items = columns * 21 * 0.5
                    let x = frame_half_width - half_items
                    let y = frame_half_height - 16
                    Render.Sprite(generic, x + 0 * 21, y, SPRITE_DATA["interface"][this.select_index === 0 ? "select.panel" : "panel"])
                    Render.Sprite(generic, x + 1 * 21, y, SPRITE_DATA["interface"][this.select_index === 1 ? "select.panel" : "panel"])
                }
                break
            case this.menu_inventory:
                {
                    let columns = 8
                    let inventory = this.thing.inventory
                    let x = 20
                    let y = frame.height - 71
                    if (inventory.length === 0) {
                        Render.Sprite(generic, x, y, SPRITE_DATA["interface"]["panel"])
                    } else {
                        for (let index = 0; index < inventory.length; index++) {
                            let px = x + index % columns * 21
                            let py = y + Math.floor(index / columns) * 33

                            if (this.select_index === index)
                                Render.Sprite(generic, px, py, SPRITE_DATA["interface"]["select.panel"])
                            else
                                Render.Sprite(generic, px, py, SPRITE_DATA["interface"]["panel"])

                            let sprite = inventory[index].sprite[0]
                            Render.Sprite(generic2, x + index % columns * 21 + 10 - sprite.width * 0.5, y + Math.floor(index / columns) * 33 + 16 - sprite.height * 0.5, sprite)
                        }
                    }

                    x = frame.width - 40
                    Render.Sprite(generic, x, y, SPRITE_DATA["interface"]["panel"])
                    Render.Sprite(generic, x - 1 * 21, y, SPRITE_DATA["interface"]["panel"])
                    Render.Sprite(generic, x - 2 * 21, y, SPRITE_DATA["interface"]["panel"])
                    Render.Sprite(generic, x - 3 * 21, y, SPRITE_DATA["interface"]["panel"])

                    if (this.thing.head !== null) {
                        let sprite = this.thing.head.sprite[0]
                        let px = x + 10 - sprite.width * 0.5
                        let py = y + 16 - sprite.height * 0.5
                        Render.Sprite(generic2, px, py, sprite)
                    }

                    if (this.thing.body !== null) {
                        let sprite = this.thing.body.sprite[0]
                        let px = x + 10 - 1 * 21 - sprite.width * 0.5
                        let py = y + 16 - sprite.height * 0.5
                        Render.Sprite(generic2, px, py, sprite)
                    }
                }
                break
        }

        g.set_texture(gl, "interface")
        RenderSystem.UpdateAndDraw(gl, generic)
        g.set_texture(gl, "item")
        RenderSystem.UpdateAndDraw(gl, generic2)
    }
}