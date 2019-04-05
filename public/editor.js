class Editor {
    constructor() {}
    async init(app) {
        let player = app.world.netLookup.get(app.world.PID)
        app.camera = new SimpleCamera(player, 10.0, 0.0, 0.0)
        player.camera = app.camera
        console.log(player)
    }
}

let editor = new Editor()
let app = new App(editor)

app.run()

function loop() {
    app.loop()
}
